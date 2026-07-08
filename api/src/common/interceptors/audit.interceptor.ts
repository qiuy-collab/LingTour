import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { DataSource, type EntityTarget } from 'typeorm';
import { AuditService } from '../../modules/audit/audit.service';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_RESOURCE_KEY = 'audit_resource';
export const AUDIT_ENTITY_KEY = 'audit_entity';
export const AUDIT_ID_PARAM_KEY = 'audit_id_param';

type AuditEntityClass = EntityTarget<Record<string, any>>;
type AuditUser = { sub?: string; email?: string; name?: string };
type AuditMetadata = { action: string; resource: string };
type AuditPlainObject = Record<string, any>;

export const AuditAction = (action: string, resource: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, resource });

export const AuditEntity = (entityClass: AuditEntityClass, idParam = 'id') => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(AUDIT_ENTITY_KEY, entityClass)(
      target,
      propertyKey!,
      descriptor!,
    );
    SetMetadata(AUDIT_ID_PARAM_KEY, idParam)(target, propertyKey!, descriptor!);
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private static readonly SENSITIVE_KEYS = new Set([
    'password',
    'passwordHash',
    'password_hash',
    'token',
    'secret',
    'credential',
    'accessToken',
    'refreshToken',
    'resetToken',
  ]);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.getAllAndOverride<AuditMetadata>(
      AUDIT_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'] as AuditUser | undefined;
    const ip = request.ip || request.headers?.['x-forwarded-for'] || '';
    const userAgent = request.headers?.['user-agent'] || '';
    const rawNewValues = this.deepClone<AuditPlainObject | undefined>(
      request.body as AuditPlainObject | undefined,
    );

    return next.handle().pipe(
      tap((responseData) => {
        void this.logAuditEntry(
          context,
          request,
          responseData,
          rawNewValues,
          auditMeta,
          user,
          ip,
          userAgent,
        );
      }),
    );
  }

  private async fetchOldValues(
    context: ExecutionContext,
    resourceId?: string,
  ): Promise<AuditPlainObject | undefined> {
    const entityClass = this.reflector.get<AuditEntityClass>(
      AUDIT_ENTITY_KEY,
      context.getHandler(),
    );
    const idParam =
      this.reflector.get<string>(AUDIT_ID_PARAM_KEY, context.getHandler()) ??
      'id';

    if (!entityClass || !resourceId) return undefined;

    try {
      const repo = this.dataSource.getRepository(entityClass);
      const entity = await repo.findOne({
        where: { [idParam]: resourceId },
      });
      return entity ? this.toPlain(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  private async logAuditEntry(
    context: ExecutionContext,
    request: any,
    responseData: any,
    rawNewValues: AuditPlainObject | undefined,
    auditMeta: AuditMetadata,
    user: AuditUser | undefined,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    try {
      const resourceId =
        responseData?.id || responseData?.data?.id || undefined;
      const resourceName =
        responseData?.name ||
        responseData?.data?.name ||
        responseData?.data?.slug ||
        undefined;

      const oldValues = await this.fetchOldValues(context, resourceId);
      const maskedOld = oldValues
        ? AuditInterceptor.maskSensitive(oldValues)
        : undefined;
      const maskedNew = rawNewValues
        ? AuditInterceptor.maskSensitive(rawNewValues)
        : undefined;
      const changes = AuditInterceptor.computeDiff(maskedOld, maskedNew);

      await this.auditService.log({
        userId: user?.sub,
        userName: user?.name || user?.email || '',
        action: auditMeta.action,
        resource: auditMeta.resource,
        resourceId,
        resourceName,
        oldValues: maskedOld,
        newValues: maskedNew,
        changes,
        details: {
          method: request.method,
          path: request.url,
        },
        ip,
        userAgent,
      });
    } catch {
      // Audit failure must never affect the response.
    }
  }

  private toPlain(entity: any): AuditPlainObject {
    return JSON.parse(JSON.stringify(entity));
  }

  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  static maskSensitive(obj: AuditPlainObject): AuditPlainObject {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) =>
        typeof item === 'object' && item !== null
          ? AuditInterceptor.maskSensitive(item)
          : item,
      );
    }

    const masked: AuditPlainObject = {};
    for (const [key, value] of Object.entries(obj)) {
      if (AuditInterceptor.SENSITIVE_KEYS.has(key)) {
        masked[key] = '***';
      } else if (value && typeof value === 'object') {
        masked[key] = AuditInterceptor.maskSensitive(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  static computeDiff(
    oldValues?: AuditPlainObject,
    newValues?: AuditPlainObject,
  ): Record<string, { old: any; new: any }> | undefined {
    if (!oldValues && !newValues) return undefined;
    if (!oldValues) return undefined;

    const old = oldValues ?? {};
    const neo = newValues ?? {};
    const allKeys = new Set([...Object.keys(old), ...Object.keys(neo)]);
    const diff: Record<string, { old: any; new: any }> = {};

    for (const key of allKeys) {
      const previousValue = old[key];
      const nextValue = neo[key];
      if (JSON.stringify(previousValue) !== JSON.stringify(nextValue)) {
        diff[key] = { old: previousValue, new: nextValue };
      }
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';

/**
 * Metadata key used by @AuditAction() to specify the audit action type.
 */
export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_RESOURCE_KEY = 'audit_resource';

/**
 * Additional metadata: entity class + resource-id param name.
 * Used by the interceptor to fetch the "before" state for updates / deletes.
 */
export const AUDIT_ENTITY_KEY = 'audit_entity';
export const AUDIT_ID_PARAM_KEY = 'audit_id_param';

/**
 * Decorator to mark a controller method for audit logging.
 * Usage:
 *   @AuditAction('create', 'city')
 *   async createCity(...) { ... }
 */
import { SetMetadata } from '@nestjs/common';

export const AuditAction = (action: string, resource: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, resource });

/**
 * Decorator to attach entity class + id-param metadata so the interceptor
 * can fetch the "before" snapshot for update / delete audit entries.
 *
 * Usage:
 *   @AuditEntity(City, 'id')
 *   async update(...) { ... }
 *
 * The second argument defaults to 'id' when omitted.
 */
export const AuditEntity = (entityClass: Function, idParam = 'id') => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(AUDIT_ENTITY_KEY, entityClass)(target, propertyKey!, descriptor!);
    SetMetadata(AUDIT_ID_PARAM_KEY, idParam)(target, propertyKey!, descriptor!);
  };
};

/**
 * Interceptor that automatically logs create / update / delete actions
 * to the audit_logs table after the response succeeds.
 *
 * For update/delete actions, supply @AuditEntity(City, 'id') so the
 * interceptor can fetch the pre-change state and compute a field-level diff.
 *
 * To enable on a method, add:
 *   @UseInterceptors(AuditInterceptor)
 *   @AuditAction('update', 'city')
 *   @AuditEntity(City, 'id')
 *
 * The request object should carry `request['user']` (from JwtAuthGuard)
 * with at least { sub, email }.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  /** Fields that should be masked in stored values. */
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
    const auditMeta = this.reflector.getAllAndOverride<{
      action: string;
      resource: string;
    }>(AUDIT_ACTION_KEY, [context.getHandler(), context.getClass()]);

    // No audit metadata → skip silently
    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'] as
      | { sub?: string; email?: string; name?: string }
      | undefined;
    const ip =
      request.ip || request.headers?.['x-forwarded-for'] || '';
    const userAgent = request.headers?.['user-agent'] || '';

    // Capture the request body (newValues) before it gets mutated
    const rawNewValues = this.deepClone(request.body);

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          // Try to extract resource id / name from the response
          const resourceId =
            responseData?.id || responseData?.data?.id || undefined;
          const resourceName =
            responseData?.name ||
            responseData?.data?.name ||
            responseData?.data?.slug ||
            undefined;

          // For update / delete — fetch the pre-change entity state
          const oldValues = await this.fetchOldValues(
            context,
            request,
            resourceId,
          );

          // Mask sensitive fields in both snapshots
          const maskedOld = oldValues
            ? AuditInterceptor.maskSensitive(oldValues)
            : undefined;
          const maskedNew = rawNewValues
            ? AuditInterceptor.maskSensitive(rawNewValues)
            : undefined;

          // Compute field-level diff (only changed fields)
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
          // Audit failure must never affect the response
        }
      }),
    );
  }

  // ─── Private helpers ───────────────────────────────────────────────

  /**
   * For update / delete actions the caller can provide
   *   @AuditEntity(EntityClass, 'idParamName')
   * so we can load the entity's current state before the mutation.
   */
  private async fetchOldValues(
    context: ExecutionContext,
    request: any,
    resourceId?: string,
  ): Promise<Record<string, any> | undefined> {
    const entityClass = this.reflector.get<Function>(
      AUDIT_ENTITY_KEY,
      context.getHandler(),
    );
    const idParam =
      this.reflector.get<string>(
        AUDIT_ID_PARAM_KEY,
        context.getHandler(),
      ) ?? 'id';

    if (!entityClass || !resourceId) return undefined;

    try {
      const repo = this.dataSource.getRepository(entityClass);
      const entity = await repo.findOne({
        where: { [idParam]: resourceId } as any,
      });
      return entity ? this.toPlain(entity) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Convert a TypeORM entity to a plain object (strip methods / prototypes).
   */
  private toPlain(entity: any): Record<string, any> {
    return JSON.parse(JSON.stringify(entity));
  }

  /**
   * Deep-clone a value (handles request body that may be frozen).
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Recursively mask sensitive fields, replacing their values with `***`.
   */
  static maskSensitive(obj: Record<string, any>): Record<string, any> {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle arrays (e.g. nested DTOs)
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        typeof item === 'object' && item !== null
          ? AuditInterceptor.maskSensitive(item)
          : item,
      );
    }

    const masked: Record<string, any> = {};
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

  /**
   * Compare old vs new and return only the fields that changed.
   * Returns `undefined` if there are no differences.
   */
  static computeDiff(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Record<string, { old: any; new: any }> | undefined {
    if (!oldValues && !newValues) return undefined;
    if (!oldValues) return undefined; // create → no diff meaningful

    const old = oldValues ?? {};
    const neo = newValues ?? {};
    const allKeys = new Set([...Object.keys(old), ...Object.keys(neo)]);
    const diff: Record<string, { old: any; new: any }> = {};

    for (const key of allKeys) {
      const o = old[key];
      const n = neo[key];
      if (JSON.stringify(o) !== JSON.stringify(n)) {
        diff[key] = { old: o, new: n };
      }
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
  }
}

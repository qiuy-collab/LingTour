import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY, AppRole } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: AppRole;
}

/**
 * 角色守卫（全局注册）。
 *
 * 行为优先级:
 * 1. @Public() endpoint: 直接放行
 * 2. @Roles(...) 显式声明: 必须命中其中之一
 * 3. 隐式默认: 路径包含 /admin/ 的 endpoint 自动要求 admin 角色
 *    （这是兜底安全策略，避免新加 admin endpoint 时忘记加 @Roles）
 * 4. 其他: 仅依赖 JwtAuthGuard 验证登录
 *
 * 注意: 必须在 JwtAuthGuard 之后执行，依赖 request.user 已被填充。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 跳过 public endpoint
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    // 显式声明优先
    const explicitRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    let requiredRoles: AppRole[] | null = explicitRoles ?? null;

    // 没有显式声明，但路径是 admin 的：默认要求 admin
    if (!requiredRoles) {
      const url = request.url || '';
      if (this.isAdminPath(url)) {
        requiredRoles = ['admin'];
      }
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = request.user;
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: missing role');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied: requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }

  /**
   * 判断请求路径是否属于 admin 区域。
   * 兼容前缀 /api/v1/admin/... 和 /admin/...，
   * 同时忽略 querystring。
   */
  private isAdminPath(url: string): boolean {
    const path = url.split('?')[0] ?? '';
    return /\/admin(\/|$)/.test(path);
  }
}

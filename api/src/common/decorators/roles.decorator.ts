import { SetMetadata } from '@nestjs/common';

export type AppRole = 'admin' | 'editor';

export const ROLES_KEY = 'roles';

/**
 * 限制 endpoint 仅允许指定角色访问。
 * 用法: @Roles('admin')
 * 必须配合 RolesGuard 使用。RolesGuard 已在 AppModule 全局注册，
 * 没有 @Roles() 装饰的 endpoint 不会被它拦截。
 */
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

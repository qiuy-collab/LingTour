import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function contextFor(url: string, role?: string): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ url, user: role ? { sub: 'u1', email: 'a@b.c', role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

function guardFor(requiredRoles: string[] | undefined, isPublic = false) {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === 'roles' ? requiredRoles : isPublic ? true : undefined,
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('lets a public endpoint through without a role', () => {
    expect(guardFor(['admin'], true).canActivate(contextFor('/anything'))).toBe(
      true,
    );
  });

  it('treats an account holding both roles as staff and traveler', () => {
    const guard = guardFor(['admin', 'editor']);
    expect(
      guard.canActivate(contextFor('/api/v1/admin/users', 'admin,traveler')),
    ).toBe(true);
    expect(
      guard.canActivate(contextFor('/api/v1/admin/users', 'traveler,admin')),
    ).toBe(true);
  });

  it('still refuses a traveler on an admin-only endpoint', () => {
    const guard = guardFor(['admin']);
    expect(() =>
      guard.canActivate(contextFor('/api/v1/admin/users', 'traveler')),
    ).toThrow(ForbiddenException);
  });

  it('does not let an unknown role satisfy a requirement', () => {
    const guard = guardFor(['admin']);
    expect(() =>
      guard.canActivate(contextFor('/api/v1/admin/users', 'root')),
    ).toThrow(ForbiddenException);
  });

  it('keeps the implicit /admin/ fallback for multi-role values', () => {
    const guard = guardFor(undefined);
    expect(
      guard.canActivate(contextFor('/api/v1/admin/orders', 'admin,traveler')),
    ).toBe(true);
    // The fallback demands admin, so an editor who is also a traveler still
    // cannot reach an undeclared /admin/ endpoint.
    expect(() =>
      guard.canActivate(contextFor('/api/v1/admin/orders', 'editor,traveler')),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.canActivate(contextFor('/api/v1/admin/orders', 'traveler')),
    ).toThrow(ForbiddenException);
  });
});
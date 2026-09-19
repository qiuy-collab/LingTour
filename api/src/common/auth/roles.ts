import type { AppRole } from '../decorators/roles.decorator';

/**
 * Role sets.
 *
 * Requirement (2026-09-19, owner decision "A"): the back-office account and
 * the traveler account must be able to coexist on one subject, i.e. one
 * email/row may hold both a staff role and the traveler role.
 *
 * `users.role` is a VARCHAR(50) that has always held a single role. It now
 * carries a *comma-separated set* drawn from {@link APP_ROLES}, so a staff
 * member who also uses the public site is stored as `admin,traveler` — no
 * schema change and no migration is required, and every historical
 * single-value row (`admin`, `editor`, `traveler`) keeps its exact meaning.
 */

export const APP_ROLES: readonly AppRole[] = ['admin', 'editor', 'traveler'];

/** Staff roles are the ones that may enter the back office. */
export const STAFF_ROLES: readonly AppRole[] = ['admin', 'editor'];

/**
 * Ordered by authority: the primary role decides what the admin shell opens
 * on, so a `traveler,admin` account must resolve to `admin`.
 */
export function parseRoles(value: string | null | undefined): AppRole[] {
  if (!value) return [];
  const found = new Set<string>();
  for (const raw of value.split(',')) {
    const role = raw.trim().toLowerCase();
    if (role) found.add(role);
  }
  // Unknown values are dropped rather than throwing: a malformed row must not
  // lock an operator out, and it must never be treated as a valid role.
  return APP_ROLES.filter((role) => found.has(role));
}

export function serializeRoles(roles: readonly (AppRole | string)[]): string {
  const known = parseRoles(roles.join(','));
  if (!known.length) {
    throw new Error('A role set must contain at least one known role');
  }
  return known.join(',');
}

export function hasRole(
  value: string | null | undefined,
  role: AppRole,
): boolean {
  return parseRoles(value).includes(role);
}

export function hasAnyRole(
  value: string | null | undefined,
  roles: readonly AppRole[],
): boolean {
  const parsed = parseRoles(value);
  return roles.some((role) => parsed.includes(role));
}

export function isStaff(value: string | null | undefined): boolean {
  return hasAnyRole(value, STAFF_ROLES);
}

/** The role that represents the account in single-value consumers. */
export function primaryRole(
  value: string | null | undefined,
): AppRole | null {
  return parseRoles(value)[0] ?? null;
}

/**
 * LIKE pattern matching "the column holds this role", for the raw queries and
 * query builders that cannot use {@link hasRole}. The padding with commas
 * keeps `traveler` from matching inside a longer value. Callers pair it with
 * `(',' || column || ',') LIKE :theirParamName`.
 */
export function roleSetLike(role: AppRole | string): string {
  return `%,${role},%`;
}
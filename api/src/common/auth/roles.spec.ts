import {
  hasAnyRole,
  hasRole,
  isStaff,
  parseRoles,
  primaryRole,
  roleSetLike,
  serializeRoles,
} from './roles';

describe('role sets', () => {
  it('keeps every historical single value working unchanged', () => {
    expect(parseRoles('traveler')).toEqual(['traveler']);
    expect(parseRoles('editor')).toEqual(['editor']);
    expect(parseRoles('admin')).toEqual(['admin']);
    expect(hasRole('admin', 'admin')).toBe(true);
    expect(hasRole('admin', 'traveler')).toBe(false);
    expect(hasAnyRole('editor', ['admin', 'editor'])).toBe(true);
    expect(isStaff('traveler')).toBe(false);
    expect(isStaff('editor')).toBe(true);
  });

  it('reads a comma-separated set and orders it by authority', () => {
    expect(parseRoles('traveler,admin')).toEqual(['admin', 'traveler']);
    expect(parseRoles('editor,traveler')).toEqual(['editor', 'traveler']);
    expect(hasRole('admin,traveler', 'traveler')).toBe(true);
    expect(hasRole('admin,traveler', 'admin')).toBe(true);
    expect(hasAnyRole('admin,traveler', ['editor'])).toBe(false);
    expect(isStaff('admin,traveler')).toBe(true);
  });

  it('resolves the primary role that single-value clients render', () => {
    expect(primaryRole('traveler,admin')).toBe('admin');
    expect(primaryRole('traveler,editor')).toBe('editor');
    expect(primaryRole('traveler')).toBe('traveler');
    expect(primaryRole('')).toBeNull();
    expect(primaryRole(null)).toBeNull();
    expect(primaryRole(undefined)).toBeNull();
  });

  it('drops unknown values instead of granting access', () => {
    expect(parseRoles('superuser')).toEqual([]);
    expect(parseRoles('admin,root')).toEqual(['admin']);
    expect(hasAnyRole('root', ['admin'])).toBe(false);
    expect(hasRole(' traveler , admin ', 'admin')).toBe(true);
    expect(parseRoles('')).toEqual([]);
    expect(parseRoles(null)).toEqual([]);
  });

  it('serializes a set without duplicates or unknown values', () => {
    expect(serializeRoles(['traveler', 'admin'])).toBe('admin,traveler');
    expect(serializeRoles(['editor', 'editor'])).toBe('editor');
    expect(serializeRoles(['admin', 'traveler', 'traveler'])).toBe(
      'admin,traveler',
    );
    expect(() => serializeRoles(['root'])).toThrow();
    expect(() => serializeRoles([])).toThrow();
  });

  it('builds a LIKE pattern that cannot match a longer role value', () => {
    expect(roleSetLike('traveler')).toBe('%,traveler,%');
    // The pattern is matched against a comma-padded column value, so the
    // fragment 'traveler' inside another role cannot produce a false hit.
    expect(roleSetLike('admin')).toBe('%,admin,%');
  });
});
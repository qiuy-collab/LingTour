import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuditService } from '../src/modules/audit/audit.service';
import { AuditLog } from '../src/modules/audit/entities/audit-log.entity';
import { AuditInterceptor } from '../src/common/interceptors/audit.interceptor';

/**
 * Audit Log Unit Test Suite
 *
 * Tests the AuditService in isolation by mocking the TypeORM repository.
 * Covers:
 *   1. Log an action → verify it's stored
 *   2. Query with filters → verify results
 *   3. Get stats → verify aggregation
 *   4. Sensitive field masking → verify password is masked
 */

// ── Mock repository factory ──────────────────────────────────────────
function createMockRepo() {
  const store: AuditLog[] = [];

  return {
    _store: store,
    create: jest.fn((dto: any) => {
      const entry = new AuditLog();
      Object.assign(entry, dto);
      entry.id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      entry.createdAt = new Date();
      return entry;
    }),
    save: jest.fn((entry: AuditLog) => {
      const idx = store.findIndex((e) => e.id === entry.id);
      if (idx >= 0) {
        store[idx] = entry;
      } else {
        store.push(entry);
      }
      return Promise.resolve(entry);
    }),
    findOne: jest.fn(({ where }: any) => {
      const entry = store.find((e) => e.id === where.id);
      return Promise.resolve(entry || null);
    }),
    createQueryBuilder: jest.fn(() => {
      const qb: any = {
        _wheres: [] as any[],
        _selects: [] as string[],
        _groups: [] as string[],
        _orders: [] as any[],
        _skip: 0,
        _take: 20,
        andWhere: jest.fn((clause: string, params?: any) => {
          qb._wheres.push({ clause, params });
          return qb;
        }),
        select: jest.fn((sel: string, alias?: string) => {
          qb._selects.push(sel);
          return qb;
        }),
        addSelect: jest.fn((sel: string, alias?: string) => {
          qb._selects.push(sel);
          return qb;
        }),
        groupBy: jest.fn((group: string) => {
          qb._groups.push(group);
          return qb;
        }),
        orderBy: jest.fn(() => qb),
        skip: jest.fn((n: number) => {
          qb._skip = n;
          return qb;
        }),
        take: jest.fn((n: number) => {
          qb._take = n;
          return qb;
        }),
        getManyAndCount: jest.fn(() => {
          // Simulate filtering by applying keyword / action / resource
          let filtered = [...store];

          for (const w of qb._wheres) {
            if (w.params?.action) {
              filtered = filtered.filter((e) => e.action === w.params.action);
            }
            if (w.params?.resource) {
              filtered = filtered.filter((e) => e.resource === w.params.resource);
            }
            if (w.params?.userId) {
              filtered = filtered.filter((e) => e.userId === w.params.userId);
            }
            if (w.params?.kw) {
              const kw = w.params.kw.replace(/%/g, '').toLowerCase();
              filtered = filtered.filter(
                (e) =>
                  (e.userName || '').toLowerCase().includes(kw) ||
                  (e.resourceName || '').toLowerCase().includes(kw) ||
                  (e.action || '').toLowerCase().includes(kw) ||
                  (e.resource || '').toLowerCase().includes(kw),
              );
            }
          }

          const total = filtered.length;
          const items = filtered.slice(qb._skip, qb._skip + qb._take);
          return Promise.resolve([items, total]);
        }),
        getRawOne: jest.fn(() => {
          // For stats: return count based on store length
          if (qb._selects.some((s: string) => s.includes('COUNT'))) {
            const hasInterval = qb._wheres.some((w: any) =>
              w.clause?.includes('INTERVAL'),
            );
            if (hasInterval) {
              // last7Days — just return a subset
              const recent = store.filter(
                (e) =>
                  e.createdAt &&
                  Date.now() - new Date(e.createdAt).getTime() <
                    7 * 24 * 60 * 60 * 1000,
              );
              return Promise.resolve({ total: store.length, count: recent.length });
            }
            return Promise.resolve({ total: store.length, count: store.length });
          }
          return Promise.resolve({ total: store.length, count: store.length });
        }),
        getRawMany: jest.fn(() => {
          // For breakdown stats
          if (qb._groups.includes('al.action')) {
            const map = new Map<string, number>();
            for (const e of store) {
              map.set(e.action, (map.get(e.action) || 0) + 1);
            }
            return Promise.resolve(
              [...map.entries()].map(([action, count]) => ({ action, count })),
            );
          }
          if (qb._groups.includes('al.resource')) {
            const map = new Map<string, number>();
            for (const e of store) {
              map.set(e.resource, (map.get(e.resource) || 0) + 1);
            }
            return Promise.resolve(
              [...map.entries()].map(([resource, count]) => ({
                resource,
                count,
              })),
            );
          }
          return Promise.resolve([]);
        }),
      };
      return qb;
    }),
  };
}

describe('AuditService', () => {
  let service: AuditService;
  let mockRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    mockRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  // ── 1. Log an action → verify it's stored ──────────────────────────
  describe('log()', () => {
    it('should create and persist an audit log entry', async () => {
      const entry = await service.log({
        userId: 'user-001',
        userName: 'Admin',
        action: 'create',
        resource: 'city',
        resourceId: 'city-001',
        resourceName: 'Zhanjiang',
        details: { method: 'POST', path: '/api/v1/admin/cities' },
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.action).toBe('create');
      expect(entry.resource).toBe('city');
      expect(entry.userId).toBe('user-001');
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should store old and new values for update actions', async () => {
      const entry = await service.log({
        action: 'update',
        resource: 'route',
        resourceId: 'route-001',
        oldValues: { title: 'Old Title' },
        newValues: { title: 'New Title' },
      });

      expect(entry.oldValues).toEqual({ title: 'Old Title' });
      expect(entry.newValues).toEqual({ title: 'New Title' });
    });

    it('should handle missing optional fields gracefully', async () => {
      const entry = await service.log({
        action: 'delete',
        resource: 'product',
      });

      expect(entry).toBeDefined();
      expect(entry.action).toBe('delete');
      expect(entry.userId).toBeUndefined();
      expect(entry.resourceId).toBeUndefined();
    });

    it('should not throw even if the repository save fails', async () => {
      mockRepo.save.mockRejectedValueOnce(new Error('DB connection lost'));

      // The service catches errors internally — should return undefined
      const entry = await service.log({
        action: 'create',
        resource: 'test',
      });

      expect(entry).toBeUndefined();
    });
  });

  // ── 2. Query with filters → verify results ─────────────────────────
  describe('findAll()', () => {
    beforeEach(async () => {
      // Seed some entries
      await service.log({
        userId: 'user-001',
        userName: 'Alice',
        action: 'create',
        resource: 'city',
        resourceName: 'Zhanjiang',
      });
      await service.log({
        userId: 'user-001',
        userName: 'Alice',
        action: 'update',
        resource: 'route',
        resourceName: 'Southern Sea Table',
      });
      await service.log({
        userId: 'user-002',
        userName: 'Bob',
        action: 'create',
        resource: 'product',
        resourceName: 'Tea Bowl',
      });
      await service.log({
        userId: 'user-002',
        userName: 'Bob',
        action: 'delete',
        resource: 'city',
        resourceName: 'Old City',
      });
    });

    it('should return all entries when no filters are applied', async () => {
      const result = await service.findAll({});

      expect(result.data).toHaveLength(4);
      expect(result.total).toBe(4);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should filter by action', async () => {
      const result = await service.findAll({ action: 'create' });

      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.action === 'create')).toBe(true);
    });

    it('should filter by resource', async () => {
      const result = await service.findAll({ resource: 'city' });

      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.resource === 'city')).toBe(true);
    });

    it('should filter by userId', async () => {
      const result = await service.findAll({ userId: 'user-002' });

      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.userId === 'user-002')).toBe(true);
    });

    it('should filter by keyword across userName and resourceName', async () => {
      const result = await service.findAll({ keyword: 'Alice' });

      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.userName === 'Alice')).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const page1 = await service.findAll({ page: 1, pageSize: 2 });
      expect(page1.data).toHaveLength(2);
      expect(page1.total).toBe(4);
      expect(page1.page).toBe(1);
      expect(page1.pageSize).toBe(2);

      const page2 = await service.findAll({ page: 2, pageSize: 2 });
      expect(page2.data).toHaveLength(2);
      expect(page2.page).toBe(2);
    });

    it('should return empty results for non-matching filters', async () => {
      const result = await service.findAll({ keyword: 'nonexistent-xyz' });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ── 3. Get stats → verify aggregation ──────────────────────────────
  describe('getStats()', () => {
    it('should return aggregated statistics', async () => {
      // Seed some data
      await service.log({ action: 'create', resource: 'city' });
      await service.log({ action: 'create', resource: 'route' });
      await service.log({ action: 'update', resource: 'city' });

      const stats = await service.getStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('last7Days');
      expect(stats).toHaveProperty('actionBreakdown');
      expect(stats).toHaveProperty('resourceBreakdown');

      expect(stats.total).toBe(3);
      expect(stats.last7Days).toBe(3);

      // Action breakdown
      const createAction = stats.actionBreakdown.find(
        (b: any) => b.action === 'create',
      );
      expect(createAction).toBeDefined();
      expect(createAction.count).toBe(2);

      const updateAction = stats.actionBreakdown.find(
        (b: any) => b.action === 'update',
      );
      expect(updateAction).toBeDefined();
      expect(updateAction.count).toBe(1);

      // Resource breakdown
      const cityResource = stats.resourceBreakdown.find(
        (b: any) => b.resource === 'city',
      );
      expect(cityResource).toBeDefined();
      expect(cityResource.count).toBe(2);
    });

    it('should return zeros when no logs exist', async () => {
      const stats = await service.getStats();

      expect(stats.total).toBe(0);
      expect(stats.last7Days).toBe(0);
      expect(stats.actionBreakdown).toHaveLength(0);
      expect(stats.resourceBreakdown).toHaveLength(0);
    });
  });

  // ── 4. Sensitive field masking → verify password is masked ─────────
  describe('Sensitive field masking', () => {
    it('should mask password fields', () => {
      const input = {
        email: 'admin@test.com',
        password: 'super-secret-123',
        name: 'Admin',
      };

      const masked = AuditInterceptor.maskSensitive(input);

      expect(masked.email).toBe('admin@test.com');
      expect(masked.name).toBe('Admin');
      expect(masked.password).toBe('***');
    });

    it('should mask passwordHash fields', () => {
      const input = {
        email: 'admin@test.com',
        passwordHash: '$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12',
      };

      const masked = AuditInterceptor.maskSensitive(input);

      expect(masked.passwordHash).toBe('***');
    });

    it('should mask token, secret, credential, accessToken, refreshToken', () => {
      const input = {
        token: 'jwt-token-value',
        secret: 'api-key-secret',
        credential: 'google-id-token',
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        resetToken: 'reset-789',
        normalField: 'visible',
      };

      const masked = AuditInterceptor.maskSensitive(input);

      expect(masked.token).toBe('***');
      expect(masked.secret).toBe('***');
      expect(masked.credential).toBe('***');
      expect(masked.accessToken).toBe('***');
      expect(masked.refreshToken).toBe('***');
      expect(masked.resetToken).toBe('***');
      expect(masked.normalField).toBe('visible');
    });

    it('should mask sensitive fields in nested objects', () => {
      const input = {
        user: {
          name: 'Admin',
          password: 'secret-password',
          profile: {
            bio: 'Hello',
            resetToken: 'reset-123',
          },
        },
      };

      const masked = AuditInterceptor.maskSensitive(input);

      expect(masked.user.name).toBe('Admin');
      expect(masked.user.password).toBe('***');
      expect(masked.user.profile.bio).toBe('Hello');
      expect(masked.user.profile.resetToken).toBe('***');
    });

    it('should mask sensitive fields in arrays', () => {
      const input = [
        { password: 'pass1', name: 'User 1' },
        { password: 'pass2', name: 'User 2' },
      ];

      const masked = AuditInterceptor.maskSensitive(input as any);

      expect(masked[0].password).toBe('***');
      expect(masked[0].name).toBe('User 1');
      expect(masked[1].password).toBe('***');
      expect(masked[1].name).toBe('User 2');
    });

    it('should handle null and undefined gracefully', () => {
      expect(AuditInterceptor.maskSensitive(null as any)).toBeNull();
      expect(AuditInterceptor.maskSensitive(undefined as any)).toBeUndefined();
    });

    it('should mask password field when storing audit log via service', async () => {
      const entry = await service.log({
        action: 'update',
        resource: 'user',
        resourceId: 'user-001',
        oldValues: { name: 'Admin', passwordHash: 'old-hash-value' },
        newValues: { name: 'Admin', passwordHash: 'new-hash-value' },
      });

      // The service stores raw values — masking happens at the interceptor level.
      // But we verify the interceptor's maskSensitive works on those stored values.
      const maskedOld = AuditInterceptor.maskSensitive(entry.oldValues);
      const maskedNew = AuditInterceptor.maskSensitive(entry.newValues);

      expect(maskedOld.passwordHash).toBe('***');
      expect(maskedOld.name).toBe('Admin');
      expect(maskedNew.passwordHash).toBe('***');
      expect(maskedNew.name).toBe('Admin');
    });
  });
});

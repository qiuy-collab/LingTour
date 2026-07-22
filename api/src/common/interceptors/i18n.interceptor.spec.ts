import { I18nInterceptor } from './i18n.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('I18nInterceptor', () => {
  let interceptor: I18nInterceptor;

  beforeEach(() => {
    interceptor = new I18nInterceptor();
  });

  const createMockContext = (
    lang?: string,
    acceptLang?: string,
  ): ExecutionContext => {
    const request: any = {
      query: lang ? { lang } : {},
      headers: acceptLang ? { 'accept-language': acceptLang } : {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  const createMockHandler = (data: any): CallHandler => ({
    handle: () => of(data),
  });

  describe('language resolution', () => {
    it('should default to "en" when no language specified', (done) => {
      const ctx = createMockContext();
      const handler = createMockHandler({
        name: { en: 'Zhanjiang', zh: '湛江' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ name: 'Zhanjiang' });
        done();
      });
    });

    it('should ignore a non-English query parameter', (done) => {
      const ctx = createMockContext('zh');
      const handler = createMockHandler({
        name: { en: 'Zhanjiang', zh: '湛江' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ name: 'Zhanjiang' });
        done();
      });
    });

    it('should ignore a non-English Accept-Language header', (done) => {
      const ctx = createMockContext(undefined, 'zh-CN,zh;q=0.9');
      const handler = createMockHandler({
        title: { en: 'Hello', zh: '你好' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ title: 'Hello' });
        done();
      });
    });

    it('should fallback to "en" when language is unavailable', (done) => {
      const ctx = createMockContext('fr');
      const handler = createMockHandler({
        name: { en: 'Zhanjiang', zh: '湛江' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ name: 'Zhanjiang' });
        done();
      });
    });
  });

  describe('response transformation', () => {
    it('should flatten i18n objects in nested structures', (done) => {
      const ctx = createMockContext('zh');
      const handler = createMockHandler({
        city: {
          name: { en: 'Guangzhou', zh: '广州' },
          region: { en: 'Bay Area', zh: '大湾区' },
          slug: 'guangzhou',
        },
        tags: [
          { en: 'Coast', zh: '滨海' },
          { en: 'Seafood', zh: '海鲜' },
        ],
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          city: { name: 'Guangzhou', region: 'Bay Area', slug: 'guangzhou' },
          tags: ['Coast', 'Seafood'],
        });
        done();
      });
    });

    it('should leave non-i18n objects untouched', (done) => {
      const ctx = createMockContext('en');
      const handler = createMockHandler({
        id: 'uuid-123',
        price: 32.0,
        published: true,
        createdAt: '2026-05-12T00:00:00Z',
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          id: 'uuid-123',
          price: 32.0,
          published: true,
          createdAt: '2026-05-12T00:00:00Z',
        });
        done();
      });
    });

    it('should serialize Date values as ISO timestamps', (done) => {
      const ctx = createMockContext('en');
      const handler = createMockHandler({
        createdAt: new Date('2026-07-23T01:02:03.000Z'),
        title: { en: 'Route', zh: '路线' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          createdAt: '2026-07-23T01:02:03.000Z',
          title: 'Route',
        });
        done();
      });
    });

    it('should handle arrays of i18n objects', (done) => {
      const ctx = createMockContext('en');
      const handler = createMockHandler({
        sections: [
          { title: { en: 'Section 1', zh: '第一部分' }, sortOrder: 0 },
          { title: { en: 'Section 2', zh: '第二部分' }, sortOrder: 1 },
        ],
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          sections: [
            { title: 'Section 1', sortOrder: 0 },
            { title: 'Section 2', sortOrder: 1 },
          ],
        });
        done();
      });
    });

    it('should handle null and undefined gracefully', (done) => {
      const ctx = createMockContext('en');
      const handler = createMockHandler({
        name: null,
        optional: undefined,
        valid: { en: 'Hello', zh: '你好' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          name: null,
          optional: undefined,
          valid: 'Hello',
        });
        done();
      });
    });

    it('should handle string arrays (non-i18n) correctly', (done) => {
      const ctx = createMockContext('zh');
      const handler = createMockHandler({
        images: ['url1', 'url2', 'url3'],
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ images: ['url1', 'url2', 'url3'] });
        done();
      });
    });

    it('should handle en-only i18n object (missing zh)', (done) => {
      const ctx = createMockContext('zh');
      const handler = createMockHandler({
        legacy: { en: 'Only English' },
      });

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({ legacy: 'Only English' });
        done();
      });
    });
  });
});

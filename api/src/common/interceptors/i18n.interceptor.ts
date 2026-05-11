import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SupportedLang = 'en' | 'zh';

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang: SupportedLang = this.resolveLanguage(request);

    return next
      .handle()
      .pipe(map((data) => this.transformResponse(data, lang)));
  }

  /**
   * Resolve target language from request.
   * Priority: ?lang= query > Accept-Language header > default 'en'
   */
  private resolveLanguage(request: any): SupportedLang {
    const queryLang = request.query?.lang;
    if (queryLang === 'zh' || queryLang === 'en') {
      return queryLang;
    }

    const acceptLanguage = request.headers?.['accept-language'] ?? '';
    if (acceptLanguage.toLowerCase().startsWith('zh')) {
      return 'zh';
    }

    return 'en';
  }

  /**
   * Recursively transform response data:
   * - Objects with shape { en: string, zh: string } → plain string in target language
   * - Other values (numbers, dates, non-i18n objects) → pass through unchanged
   */
  private transformResponse(data: any, lang: SupportedLang): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle arrays: transform each element
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item, lang));
    }

    // Handle objects
    if (typeof data === 'object') {
      // Check if this is an i18n object { en: string, zh: string }
      if (this.isI18nObject(data)) {
        return data[lang] ?? data.en ?? '';
      }

      // Regular object: transform each property
      const result: Record<string, any> = {};
      for (const key of Object.keys(data)) {
        result[key] = this.transformResponse(data[key], lang);
      }
      return result;
    }

    // Primitives: pass through
    return data;
  }

  /**
   * Check if an object is an i18n container { en: ..., zh: ... }
   */
  private isI18nObject(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    const keys = Object.keys(obj);
    // Must have at least 'en' key with string value
    if (!keys.includes('en') || typeof obj.en !== 'string') {
      return false;
    }
    // Should have 'zh' key (optional for some legacy data)
    return keys.includes('zh') || keys.length === 1;
  }
}

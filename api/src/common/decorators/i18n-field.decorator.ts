import { SetMetadata } from '@nestjs/common';

export const I18N_FIELD_KEY = 'i18n_field';

/**
 * Decorator to mark DTO fields that require { en, zh } JSONB format.
 * Used by I18nInterceptor for validation on write and extraction on read.
 */
export const I18nField = () => SetMetadata(I18N_FIELD_KEY, true);

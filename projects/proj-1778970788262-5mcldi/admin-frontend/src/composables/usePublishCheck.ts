/**
 * usePublishCheck — Pre-publish validation composable
 *
 * Runs a set of rules against an entity's form data before publishing.
 * Returns errors (blocking) and warnings (confirm-dialog) so callers
 * can decide how to present them.
 *
 * Usage:
 *   const { check } = usePublishCheck()
 *   const result = check('route', formData)
 *   if (!result.canPublish) { showErrors(result.errors) }
 *   else if (result.warnings.length) { showConfirmDialog(result.warnings) }
 *   else { proceedWithPublish() }
 */

import { computed, type Ref } from 'vue'

// ── Types ────────────────────────────────────────────────────────────

export type EntityType = 'city' | 'route' | 'product' | 'event'

export interface CheckResult {
  errors: string[]
  warnings: string[]
  canPublish: boolean
}

interface I18nField {
  zh?: string
  en?: string
}

interface StopLike {
  stopName?: I18nField
  [key: string]: any
}

interface FormData {
  slug?: string
  title?: I18nField
  name?: I18nField
  coverImage?: string
  heroImage?: string
  image?: string
  published?: boolean
  sections?: any[]
  stops?: StopLike[]
  routeSlugs?: string[]
  routeRegionKey?: string
  [key: string]: any
}

// ── Helpers ──────────────────────────────────────────────────────────

function isNonEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'object') {
    // i18n object: at least one locale has content
    const i18n = value as I18nField
    return Boolean(
      (i18n.zh && i18n.zh.trim()) || (i18n.en && i18n.en.trim()),
    )
  }
  return true
}

function getI18nText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const i18n = value as I18nField
    return i18n.zh || i18n.en || ''
  }
  return ''
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function isValidSlug(slug: string | undefined): boolean {
  if (!slug) return false
  return SLUG_PATTERN.test(slug)
}

// ── Per-entity rule definitions ──────────────────────────────────────

type RuleFn = (data: FormData) => { errors: string[]; warnings: string[] }

const rulesByType: Record<EntityType, RuleFn> = {
  city: checkCity,
  route: checkRoute,
  product: checkProduct,
  event: checkEvent,
}

// ─── City rules ──────────────────────────────────────────────────────

function checkCity(data: FormData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!isNonEmpty(data.name)) {
    errors.push('城市名称不能为空')
  }
  if (!isValidSlug(data.slug)) {
    errors.push(
      data.slug
        ? `Slug "${data.slug}" 格式无效，必须为 kebab-case（如 zhanjiang）`
        : 'Slug 不能为空',
    )
  }

  // Cover image
  if (!data.heroImage) {
    errors.push('请上传城市封面图（Hero Image）')
  }

  // At least one content section
  if (!data.sections || data.sections.length === 0) {
    errors.push('至少需要一个内容板块（Section）')
  }

  // Bilingual consistency
  if (data.name) {
    checkBilingual(data.name, '城市名称', warnings)
  }

  return { errors, warnings }
}

// ─── Route rules ─────────────────────────────────────────────────────

function checkRoute(data: FormData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!isNonEmpty(data.title)) {
    errors.push('路线标题不能为空')
  }
  if (!isValidSlug(data.slug)) {
    errors.push(
      data.slug
        ? `Slug "${data.slug}" 格式无效，必须为 kebab-case（如 southern-sea-table）`
        : 'Slug 不能为空',
    )
  }

  // Cover image
  if (!data.coverImage) {
    errors.push('请上传路线封面图')
  }

  // At least one stop (content section for routes)
  if (!data.stops || data.stops.length === 0) {
    errors.push('至少需要一个站点（Stop）')
  }

  // Bilingual consistency
  if (data.title) {
    checkBilingual(data.title, '路线标题', warnings)
  }
  if (data.summary) {
    checkBilingual(data.summary, '路线摘要', warnings)
  }

  // Validate routeSlugs reference (basic format check)
  if (data.routeSlugs && data.routeSlugs.length > 0) {
    for (const slug of data.routeSlugs) {
      if (!isValidSlug(slug)) {
        warnings.push(`关联路线 Slug "${slug}" 格式可能无效`)
      }
    }
  }

  return { errors, warnings }
}

// ─── Product rules ───────────────────────────────────────────────────

function checkProduct(data: FormData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields — products use "name" instead of "title"
  if (!isNonEmpty(data.name || data.title)) {
    errors.push('商品名称不能为空')
  }
  if (!isValidSlug(data.slug)) {
    errors.push(
      data.slug
        ? `Slug "${data.slug}" 格式无效，必须为 kebab-case`
        : 'Slug 不能为空',
    )
  }

  // Cover image
  if (!data.image && !data.coverImage) {
    errors.push('请上传商品图片')
  }

  // Bilingual consistency
  const nameField = data.name || data.title
  if (nameField) {
    checkBilingual(nameField, '商品名称', warnings)
  }
  if (data.story) {
    checkBilingual(data.story, '商品故事', warnings)
  }

  return { errors, warnings }
}

// ─── Event rules ─────────────────────────────────────────────────────

function checkEvent(data: FormData): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!isNonEmpty(data.title)) {
    errors.push('活动标题不能为空')
  }
  if (!isValidSlug(data.slug)) {
    errors.push(
      data.slug
        ? `Slug "${data.slug}" 格式无效，必须为 kebab-case`
        : 'Slug 不能为空',
    )
  }

  // Cover image
  if (!data.image && !data.coverImage) {
    errors.push('请上传活动封面图')
  }

  // Bilingual consistency
  if (data.title) {
    checkBilingual(data.title, '活动标题', warnings)
  }
  if (data.summary) {
    checkBilingual(data.summary, '活动摘要', warnings)
  }

  // Validate related route slugs
  if (data.relatedRouteSlugs && data.relatedRouteSlugs.length > 0) {
    for (const slug of data.relatedRouteSlugs) {
      if (!isValidSlug(slug)) {
        warnings.push(`关联路线 Slug "${slug}" 格式可能无效`)
      }
    }
  }

  return { errors, warnings }
}

// ─── Bilingual consistency check ─────────────────────────────────────

function checkBilingual(
  value: unknown,
  fieldName: string,
  warnings: string[],
): void {
  if (!value || typeof value !== 'object') return

  const i18n = value as I18nField
  const hasZh = Boolean(i18n.zh && i18n.zh.trim())
  const hasEn = Boolean(i18n.en && i18n.en.trim())

  if (hasZh && !hasEn) {
    warnings.push(`${fieldName} 已填写中文但缺少英文翻译`)
  } else if (!hasZh && hasEn) {
    warnings.push(`${fieldName} 已填写英文但缺少中文翻译`)
  }
}

// ── Composable ───────────────────────────────────────────────────────

export function usePublishCheck() {
  /**
   * Run publish pre-checks for the given entity type and form data.
   *
   * @param entityType  The entity type being published
   * @param formData    The current form data object
   * @returns           { errors, warnings, canPublish }
   *                    - errors: blocking issues that prevent publish
   *                    - warnings: non-blocking issues for confirm dialogs
   *                    - canPublish: true when errors.length === 0
   */
  function check(entityType: EntityType, formData: FormData): CheckResult {
    const ruleFn = rulesByType[entityType]
    if (!ruleFn) {
      return {
        errors: [`未知的实体类型: ${entityType}`],
        warnings: [],
        canPublish: false,
      }
    }

    const { errors, warnings } = ruleFn(formData)

    return {
      errors,
      warnings,
      canPublish: errors.length === 0,
    }
  }

  return { check }
}

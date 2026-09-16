import api from './index'
import type { ApiResponse } from '@/types/common'
import { readContentValue } from '@/types/common'
import type { HomeConfig } from '@/types/home'
import { DEFAULT_ROUTE_REGIONS } from '@/constants/guangdongRegions'

function fromApi(raw: any): HomeConfig {
  return {
    hero: {
      image: raw.hero?.image || '',
      caption: readContentValue(raw.hero?.caption),
      ctaImage: raw.hero?.ctaImage || '',
      interpretingImage: raw.hero?.interpretingImage || '',
      interpretingLabel: readContentValue(raw.hero?.interpretingLabel),
      badgeValue: raw.hero?.badge?.value || '',
      badgeLabel: readContentValue(raw.hero?.badge?.label),
      video: {
        url: raw.hero?.video?.url || '',
        poster: raw.hero?.video?.poster || '',
        title: readContentValue(raw.hero?.video?.title),
        description: readContentValue(raw.hero?.video?.description),
        duration: raw.hero?.video?.duration || '',
        resolution: raw.hero?.video?.resolution || '',
      },
    },
    heroStats: (raw.hero?.stats || raw.heroStats || []).map((s: any) => ({
      title: readContentValue(s.title),
      description: readContentValue(s.description ?? s.body ?? s.label),
    })),
    trustMetrics: (raw.trustMetrics || []).map((m: any) => ({
      value: m.value || '',
      label: readContentValue(m.label),
    })),
    entryCards: (raw.entryCards || []).map((c: any) => ({
      title: readContentValue(c.title),
      description: readContentValue(c.description ?? c.body),
      image: c.image || '',
      link: c.link || c.href || '',
    })),
    featuredRoutes: raw.featuredRoutes || raw.featuredRouteSlugs || [],
    cultureHighlights: (raw.cultureHighlights || []).map((h: any) => ({
      title: readContentValue(h.title),
      description: readContentValue(h.description ?? h.body),
      image: h.image || '',
      citySlug: h.citySlug || h.slug || '',
    })),
    routeRegions: (raw.routeRegions || []).map((region: any) => ({
      key: region.key || '',
      title: readContentValue(region.title),
      note: readContentValue(region.note),
      adcodes: Array.isArray(region.adcodes)
        ? region.adcodes.map((item: any) => Number(item)).filter(Number.isFinite)
        : [],
    })),
    testimonials: (raw.testimonials || []).map((t: any) => ({
      quote: readContentValue(t.quote),
      author: readContentValue(t.author ?? t.name),
      avatar: t.avatar || '',
    })),
  }
}

function toApi(data: HomeConfig) {
  return {
    hero: {
      image: data.hero.image,
      caption: data.hero.caption,
      ctaImage: data.hero.ctaImage,
      interpretingImage: data.hero.interpretingImage,
      interpretingLabel: data.hero.interpretingLabel,
      badge: {
        value: data.hero.badgeValue,
        label: data.hero.badgeLabel,
      },
      video: {
        url: data.hero.video.url,
        poster: data.hero.video.poster,
        title: data.hero.video.title,
        description: data.hero.video.description,
        duration: data.hero.video.duration,
        resolution: data.hero.video.resolution,
      },
      stats: data.heroStats.map((s) => ({
        title: s.title,
        description: s.description,
      })),
    },
    trustMetrics: data.trustMetrics,
    entryCards: data.entryCards.map((c, index) => ({
      id: String(index + 1).padStart(2, '0'),
      title: c.title,
      body: c.description,
      href: c.link,
      image: c.image,
    })),
    featuredRouteSlugs: data.featuredRoutes,
    cultureHighlights: data.cultureHighlights.map((h) => ({
      slug: h.citySlug,
      title: h.title,
      body: h.description,
      image: h.image,
    })),
    routeRegions: data.routeRegions.map((region) => ({
      key: region.key,
      title: region.title,
      note: region.note,
      adcodes: region.adcodes,
    })),
    testimonials: data.testimonials.map((t) => ({
      quote: t.quote,
      name: t.author,
      avatar: t.avatar,
    })),
  }
}

export const homeApi = {
  async getHomeConfig() {
    const res = await api.get<ApiResponse<any>>('/home')
    ;(res as any).data.data = fromApi(res.data.data)
    if (!(res as any).data.data.routeRegions?.length) {
      ;(res as any).data.data.routeRegions = DEFAULT_ROUTE_REGIONS.map((item) => ({ ...item }))
    }
    return res as any
  },

  updateHomeConfig(data: HomeConfig) {
    return api.put<ApiResponse<HomeConfig>>('/home', toApi(data))
  },
}

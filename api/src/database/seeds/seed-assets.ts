export const SEED_ASSET_BASE = '/uploads/seed';

export const SEED_ASSETS = {
  zhanjiangHero1200: `${SEED_ASSET_BASE}/zhanjiang-hero-1200.jpg`,
  zhanjiangHero1400: `${SEED_ASSET_BASE}/zhanjiang-hero-1400.jpg`,
  zhanjiangHero1400Shop: `${SEED_ASSET_BASE}/zhanjiang-hero-1400-shop.jpg`,
  southernCoast1200: `${SEED_ASSET_BASE}/southern-coast-1200.jpg`,
  southernCoast1400: `${SEED_ASSET_BASE}/southern-coast-1400.jpg`,
  volcanicLandscape800: `${SEED_ASSET_BASE}/volcanic-landscape-800.jpg`,
  volcanicLandscape1200: `${SEED_ASSET_BASE}/volcanic-landscape-1200.jpg`,
  volcanicLandscape1400: `${SEED_ASSET_BASE}/volcanic-landscape-1400.jpg`,
  seafoodDishes800: `${SEED_ASSET_BASE}/seafood-dishes-800.jpg`,
  bowl900: `${SEED_ASSET_BASE}/volcanic-soil-bowl-900.jpg`,
  bowl1200: `${SEED_ASSET_BASE}/volcanic-soil-bowl-1200.jpg`,
  pottery1200: `${SEED_ASSET_BASE}/pottery-workshop-1200.jpg`,
  routeCover: `${SEED_ASSET_BASE}/southern-sea-table-cover.jpg`,
  routeHuguangyan: `${SEED_ASSET_BASE}/route-huguangyan.jpg`,
  routeDongfeng: `${SEED_ASSET_BASE}/route-dongfeng.jpg`,
  routeXiashan: `${SEED_ASSET_BASE}/route-xiashan.jpg`,
  routeJinsha: `${SEED_ASSET_BASE}/route-jinsha.jpg`,
} as const;

export const SEED_ASSET_SOURCES: Record<
  (typeof SEED_ASSETS)[keyof typeof SEED_ASSETS],
  string
> = {
  [SEED_ASSETS.zhanjiangHero1200]:
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.zhanjiangHero1400]:
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
  [SEED_ASSETS.zhanjiangHero1400Shop]:
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82',
  [SEED_ASSETS.southernCoast1200]:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.southernCoast1400]:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  [SEED_ASSETS.volcanicLandscape800]:
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
  [SEED_ASSETS.volcanicLandscape1200]:
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.volcanicLandscape1400]:
    'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1400&q=80',
  [SEED_ASSETS.seafoodDishes800]:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  [SEED_ASSETS.bowl900]:
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82',
  [SEED_ASSETS.bowl1200]:
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82',
  [SEED_ASSETS.pottery1200]:
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82',
  [SEED_ASSETS.routeCover]:
    'https://picsum.photos/seed/zhanjiang-coast/1400/900',
  [SEED_ASSETS.routeHuguangyan]:
    'https://picsum.photos/seed/huguangyan-lake/1200/800',
  [SEED_ASSETS.routeDongfeng]:
    'https://picsum.photos/seed/dongfeng-market/1200/800',
  [SEED_ASSETS.routeXiashan]:
    'https://picsum.photos/seed/xiashan-french/1200/800',
  [SEED_ASSETS.routeJinsha]: 'https://picsum.photos/seed/jinsha-bay/1200/800',
};

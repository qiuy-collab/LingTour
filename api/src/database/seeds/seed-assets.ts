export const SEED_ASSET_BASE = '/uploads/seed';

export const SEED_ASSETS = {
  // Zhanjiang
  zhanjiangHero1200: `${SEED_ASSET_BASE}/zhanjiang-hero-1200.jpg`,
  southernCoast1200: `${SEED_ASSET_BASE}/southern-coast-1200.jpg`,
  volcanicLandscape800: `${SEED_ASSET_BASE}/volcanic-landscape-800.jpg`,
  volcanicLandscape1200: `${SEED_ASSET_BASE}/volcanic-landscape-1200.jpg`,
  seafoodDishes800: `${SEED_ASSET_BASE}/seafood-dishes-800.jpg`,
  // Chaozhou
  chaozhouHero1200: `${SEED_ASSET_BASE}/chaozhou-hero-1200.jpg`,
  chaozhouTea1200: `${SEED_ASSET_BASE}/chaozhou-tea-1200.jpg`,
  chaozhouTea800: `${SEED_ASSET_BASE}/chaozhou-tea-800.jpg`,
  chaozhouFood800: `${SEED_ASSET_BASE}/chaozhou-food-800.jpg`,
  // Guangzhou
  guangzhouHero1200: `${SEED_ASSET_BASE}/guangzhou-hero-1200.jpg`,
  guangzhouQilou1200: `${SEED_ASSET_BASE}/guangzhou-qilou-1200.jpg`,
  guangzhouDimsum800: `${SEED_ASSET_BASE}/guangzhou-dimsum-800.jpg`,
  guangzhouMarket800: `${SEED_ASSET_BASE}/guangzhou-market-800.jpg`,
  // Products
  bowl900: `${SEED_ASSET_BASE}/volcanic-soil-bowl-900.jpg`,
  bowl1200: `${SEED_ASSET_BASE}/volcanic-soil-bowl-1200.jpg`,
  pottery1200: `${SEED_ASSET_BASE}/pottery-workshop-1200.jpg`,
  // Routes
  routeCover: `${SEED_ASSET_BASE}/southern-sea-table-cover.jpg`,
  routeHuguangyan: `${SEED_ASSET_BASE}/route-huguangyan.jpg`,
  routeDongfeng: `${SEED_ASSET_BASE}/route-dongfeng.jpg`,
  routeXiashan: `${SEED_ASSET_BASE}/route-xiashan.jpg`,
  routeJinsha: `${SEED_ASSET_BASE}/route-jinsha.jpg`,
} as const;

export const SEED_ASSET_SOURCES: Record<string, string> = {
  // Zhanjiang
  [SEED_ASSETS.zhanjiangHero1200]: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.southernCoast1200]: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.volcanicLandscape800]: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80',
  [SEED_ASSETS.volcanicLandscape1200]: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.seafoodDishes800]: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  // Chaozhou
  [SEED_ASSETS.chaozhouHero1200]: 'https://images.unsplash.com/photo-1545579133-99bb5ab189bd?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.chaozhouTea1200]: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.chaozhouTea800]: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
  [SEED_ASSETS.chaozhouFood800]: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  // Guangzhou
  [SEED_ASSETS.guangzhouHero1200]: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.guangzhouQilou1200]: 'https://images.unsplash.com/photo-1517309230475-6736d926b979?auto=format&fit=crop&w=1200&q=80',
  [SEED_ASSETS.guangzhouDimsum800]: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  [SEED_ASSETS.guangzhouMarket800]: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  // Products
  [SEED_ASSETS.bowl900]: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82',
  [SEED_ASSETS.bowl1200]: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82',
  [SEED_ASSETS.pottery1200]: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82',
  // Routes
  [SEED_ASSETS.routeCover]: 'https://picsum.photos/seed/zhanjiang-coast/1400/900',
  [SEED_ASSETS.routeHuguangyan]: 'https://picsum.photos/seed/huguangyan-lake/1200/800',
  [SEED_ASSETS.routeDongfeng]: 'https://picsum.photos/seed/dongfeng-market/1200/800',
  [SEED_ASSETS.routeXiashan]: 'https://picsum.photos/seed/xiashan-french/1200/800',
  [SEED_ASSETS.routeJinsha]: 'https://picsum.photos/seed/jinsha-bay/1200/800',
};

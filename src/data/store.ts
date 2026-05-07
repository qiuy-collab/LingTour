export type StoreCollection = {
  title: string;
  route: string;
  href: string;
  image: string;
  body: string;
};

export type StoreProduct = {
  slug: string;
  name: string;
  collection: string;
  price: number;
  currency: "SGD";
  tag: string;
  image: string;
  story: string;
};

export const storeCollections: StoreCollection[] = [
  {
    title: "Guangfu Craft Desk",
    route: "Craft, Stage, and Family Halls",
    href: "/routes/craft-stage-family-halls",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nanfeng%20Kiln%2039101-Foshan%20%2849021028018%29.jpg?width=1600",
    body: "Objects inspired by Foshan ceramics, lion dance color, opera stages, and the tactility of workshop culture.",
  },
  {
    title: "Chaoshan Tea Table",
    route: "Where Drums, Tea, and Tides Meet",
    href: "/routes/drums-tea-and-tides",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=82",
    body: "Tea-led gifts for visitors who want to carry the ritual pace of eastern Guangdong home.",
  },
  {
    title: "Hakka Home Archive",
    route: "Behind the Walled Village",
    href: "/routes/behind-the-walled-village",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=82",
    body: "Memory objects shaped by walled villages, mountain tables, migration stories, and family rituals.",
  },
];

export const storeProducts: StoreProduct[] = [
  {
    slug: "shiwan-clay-travel-cup",
    name: "Shiwan Clay Travel Cup",
    collection: "Guangfu Craft Desk",
    price: 36,
    currency: "SGD",
    tag: "Ceramic",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nanfeng%20Kiln%2039101-Foshan%20%2849021028018%29.jpg?width=900",
    story: "A compact ceramic cup inspired by Shiwan kiln texture, designed for tea, hotel rooms, and slow route pauses.",
  },
  {
    slug: "lion-dance-color-postcard-set",
    name: "Lion Dance Color Postcard Set",
    collection: "Guangfu Craft Desk",
    price: 12,
    currency: "SGD",
    tag: "Paper goods",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Foshan%20Ancestral%20Temple%200.jpg?width=900",
    story: "A set of route postcards using lion dance color blocks, temple-stage motifs, and Foshan movement notes.",
  },
  {
    slug: "gongfu-tea-starter-cloth",
    name: "Gongfu Tea Starter Cloth",
    collection: "Chaoshan Tea Table",
    price: 26,
    currency: "SGD",
    tag: "Tea ritual",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=82",
    story: "A soft table cloth printed with a simple gongfu tea sequence for visitors learning the rhythm for the first time.",
  },
  {
    slug: "harbor-letter-notebook",
    name: "Harbor Letter Notebook",
    collection: "Chaoshan Tea Table",
    price: 15,
    currency: "SGD",
    tag: "Notebook",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=82",
    story: "A notebook for route stamps and travel notes, inspired by Shantou harbor memory and overseas family letters.",
  },
  {
    slug: "hakka-walled-house-puzzle",
    name: "Hakka Walled House Puzzle",
    collection: "Hakka Home Archive",
    price: 32,
    currency: "SGD",
    tag: "Object",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=82",
    story: "A small assembly object that explains courtyard, enclosure, family, and mountain settlement through play.",
  },
  {
    slug: "southern-sea-market-tote",
    name: "Southern Sea Market Tote",
    collection: "Coastal Route Goods",
    price: 21,
    currency: "SGD",
    tag: "Travel utility",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=82",
    story: "A durable market tote for seafood streets, island walks, and the everyday coastal rhythm of western Guangdong.",
  },
];

export function getStoreProduct(slug: string) {
  return storeProducts.find((product) => product.slug === slug);
}

export function formatStorePrice(product: Pick<StoreProduct, "currency" | "price">) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

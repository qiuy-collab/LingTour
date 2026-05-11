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
  details?: {
    material: string;
    dimensions: string;
    origin: string;
    care: string;
  };
  gallery?: string[];
  originTrace?: {
    location: string;
    citySlug: string;
    cityName: string;
    materialSource: string;
    craftTradition: string;
    process: string;
    mapAdcode: number;
  };
};

export const storeCollections: StoreCollection[] = [
  {
    title: "Coastal Life Kit",
    route: "A Southern Sea Table",
    href: "/routes/southern-sea-table",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=82",
    body: "Objects from the Zhanjiang coast. Volcanic clay ceramics, maritime tools, and textiles tied to local craft traditions.",
  },
];

export const storeProducts: StoreProduct[] = [
  {
    slug: "volcanic-soil-bowl",
    name: "Volcanic Soil Tea Bowl",
    collection: "Coastal Life Kit",
    price: 32,
    currency: "SGD",
    tag: "Handcrafted",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82",
    story:
      "A bowl fired using clay from the Leizhou Peninsula volcanic fields, carrying the dark, rich texture of the southern coast.",
    details: {
      material: "Natural volcanic clay, lead-free matte glaze",
      dimensions: "9cm diameter, 5cm height",
      origin: "Leizhou Peninsula, Zhanjiang",
      care: "Hand wash only. Not recommended for microwave use.",
    },
    originTrace: {
      location: "Leizhou Peninsula, Zhanjiang",
      citySlug: "zhanjiang",
      cityName: "Zhanjiang",
      mapAdcode: 440800,
      materialSource:
        "Volcanic clay from Naozhou Island's basalt fields, formed during Pleistocene eruptions over 1 million years ago. The dark, mineral-rich soil retains the memory of ancient fire — each bowl carries the geological signature of the Leizhou Peninsula.",
      craftTradition:
        "Hand-thrown using Lingnan wheel techniques passed through four generations of potters along the Leizhou coast. The matte glaze formula was developed to preserve the raw texture of the volcanic clay rather than mask it.",
      process:
        "Clay is dug by hand from the dark volcanic soil, aged for six months to reach workable plasticity, thrown on a foot-powered wheel, bisque-fired at 900°C, glazed with lead-free matte finish, and fired again at 1,200°C. Each piece takes roughly three weeks from raw earth to finished bowl.",
    },
    gallery: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1594910413523-d2391693c004?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=82",
    ],
  },
];

export function getStoreProduct(slug: string) {
  return storeProducts.find((product) => product.slug === slug);
}

export function formatStorePrice(product: Pick<StoreProduct, "currency" | "price">) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

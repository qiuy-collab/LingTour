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
  materialNotes?: string;
  story: string;
  gallery?: string[];
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
    materialNotes: "Natural volcanic clay, lead-free matte glaze",
    story:
      "A bowl fired using clay from the Leizhou Peninsula volcanic fields, carrying the dark, rich texture of the southern coast.",
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

export function formatStorePrice(
  product: Pick<StoreProduct, "currency" | "price">,
) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

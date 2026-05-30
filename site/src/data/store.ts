/**
 * Type-only module: shape definitions for store collections and products.
 *
 * The hardcoded fixtures that used to live here have been removed; everything
 * is now sourced from the backend via `lib/api-data`. Components keep
 * importing the types only.
 */

export type StoreCollection = {
  title: string;
  route: string;
  href: string;
  image: string;
  body: string;
};

export type StoreProduct = {
  id?: string;
  slug: string;
  name: string;
  collection: string;
  price: number;
  currency: "CNY";
  tag: string;
  image: string;
  materialNotes?: string;
  story: string;
  gallery?: string[];
};

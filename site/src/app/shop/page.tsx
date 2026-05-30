import {
  fetchStoreCollectionsServer,
  fetchStoreProductsServer,
} from "@/lib/server-data";
import ShopPageClient from "./ShopPageClient";

export const revalidate = 60;

export default async function ShopPage() {
  const [collections, products] = await Promise.all([
    fetchStoreCollectionsServer("en"),
    fetchStoreProductsServer("en"),
  ]);

  return (
    <ShopPageClient
      initialCollections={collections}
      initialProducts={products}
    />
  );
}

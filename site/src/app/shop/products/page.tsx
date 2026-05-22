"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreProducts } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { AllProductsClient } from "@/components/store/AllProductsClient";
import { EditorialIntro } from "@/components/ui/EditorialIntro";

export default function ProductsPage() {
  const { locale } = useLocale();
  const { data: storeProducts, loading, error, refetch } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Arranging the shelf..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const products = storeProducts ?? [];
  const collections = Array.from(
    new Set(
      products.map((product) => product.collection ?? "").filter(Boolean),
    ),
  );
  const tags = Array.from(new Set(products.map((product) => product.tag)));

  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="All products"
          title="The full shelf of carried memory."
          description={
            <>
              <p>
                Browse the complete Lingnan store: pieces selected for their craft lineage, route connection, and quiet usefulness after the trip ends.
              </p>
              <Link href="/shop" className="mt-6 inline-block text-sm font-semibold text-[var(--cinnabar)]">
                Back to store
              </Link>
            </>
          }
        />
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <AllProductsClient products={products} collections={collections} tags={tags} />
        </div>
      </section>
    </div>
  );
}

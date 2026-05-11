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

  if (loading) return <LoadingSpinner text="Loading products…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const products = storeProducts ?? [];
  const collections = Array.from(new Set(products.map((product) => product.collection)));
  const tags = Array.from(new Set(products.map((product) => product.tag)));

  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="All products"
          title={locale === "zh" ? "浏览完整的岭南文创货架。" : "Search the full Lingnan store shelf."}
          description={
            <>
              <p>
                {locale === "zh"
                  ? "浏览每一件文创产品。按路线合集或产品类型筛选。"
                  : "Browse every cultural object. Narrow by route collection or product type."}
              </p>
              <Link href="/shop" className="mt-6 inline-block text-sm font-semibold text-[var(--cinnabar)]">
                {locale === "zh" ? "返回文创" : "Back to store"}
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

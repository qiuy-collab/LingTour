import Link from "next/link";
import { fetchStoreProductsServer } from "@/lib/server-data";
import { AllProductsClient } from "@/components/store/AllProductsClient";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await fetchStoreProductsServer("en");
  const collections = Array.from(
    new Set(products.map((product) => product.collection ?? "").filter(Boolean)),
  );
  const tags = Array.from(new Set(products.map((product) => product.tag).filter(Boolean)));

  return (
    <div className="bg-[var(--paper-deep)] bg-grain">
      <section className="relative isolate overflow-hidden bg-[var(--night)] py-14 text-white sm:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(197,160,57,0.16),transparent_30%),radial-gradient(circle_at_86%_22%,rgba(83,131,147,0.18),transparent_34%)]" />
        <div className="site-container relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--gold)]">Full object registry</p>
            <h1 className="mt-6 max-w-[11ch] font-[family:var(--font-display)] text-5xl leading-[0.88] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              The full shelf of carried memory.
            </h1>
            <p className="mt-7 max-w-[42rem] text-base leading-8 text-white/62">
              Browse pieces selected for craft lineage, route connection, and quiet usefulness after the journey ends.
            </p>
          </div>
          <div className="flex items-end justify-between gap-5 border-t border-white/12 pt-5 lg:block lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div>
              <p className="font-[family:var(--font-display)] text-4xl">{String(products.length).padStart(2, "0")}</p>
              <p className="mt-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/38">Objects online</p>
            </div>
            <Link href="/shop" className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)] transition hover:text-white lg:mt-7 lg:inline-flex">
              Back to gallery →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <div className="site-container">
          <AllProductsClient products={products} collections={collections} tags={tags} />
        </div>
      </section>
    </div>
  );
}

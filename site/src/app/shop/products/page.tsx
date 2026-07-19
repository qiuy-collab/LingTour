import Link from "next/link";
import { fetchStoreProductsServer } from "@/lib/server-data";
import { AllProductsClient } from "@/components/store/AllProductsClient";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { Reveal } from "@/components/ui/Reveal";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await fetchStoreProductsServer("en");
  const collections = Array.from(
    new Set(products.map((product) => product.collection ?? "").filter(Boolean)),
  );
  const tags = Array.from(new Set(products.map((product) => product.tag).filter(Boolean)));

  return (
    <div>
      <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-28">
        <Reveal>
          <EditorialIntro
            eyebrow={`${String(products.length).padStart(2, "0")} field objects / All products`}
            title="The full shelf of carried memory."
            description={
              <>
                <p>
                  Browse the complete Lingnan store: pieces selected for their craft lineage,
                  route connection, and quiet usefulness after the trip ends.
                </p>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex min-h-11 items-center font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)] transition hover:translate-x-1 hover:text-[var(--river-deep)]"
                >
                  Back to store →
                </Link>
              </>
            }
          />
        </Reveal>
      </section>

      <section className="bg-[var(--paper-deep)] bg-grain py-12 sm:py-16 lg:py-24">
        <div className="site-container">
          <AllProductsClient products={products} collections={collections} tags={tags} />
        </div>
      </section>
    </div>
  );
}

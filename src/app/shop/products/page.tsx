import Link from "next/link";
import { AllProductsClient } from "@/components/store/AllProductsClient";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { storeProducts } from "@/data/store";

export default function ProductsPage() {
  const collections = Array.from(new Set(storeProducts.map((product) => product.collection)));
  const tags = Array.from(new Set(storeProducts.map((product) => product.tag)));

  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="All products"
          title="Search the full Lingnan store shelf."
          description={
            <>
              <p>
                Browse every cultural object, then narrow by route collection or product type. Each
                card keeps the same image-led hover interaction as the recommended shelf.
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
          <AllProductsClient products={storeProducts} collections={collections} tags={tags} />
        </div>
      </section>
    </div>
  );
}

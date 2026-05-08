import Link from "next/link";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { storeCollections, storeProducts } from "@/data/store";

const bundles = [
  {
    title: "Route Memory Kit",
    body: "A postcard set, city map card, route stamp card, and one small object connected to the visitor chosen route.",
  },
  {
    title: "International Guest Gift",
    body: "A lightweight cultural gift pack for exchange students, company guests, and study visit participants.",
  },
  {
    title: "After-Trip Delivery",
    body: "Visitors can buy small route objects after returning home, keeping the cultural story alive beyond the visit.",
  },
];

export default function ShopPage() {
  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="Lingnan store"
          title="Cultural products that continue the route after travel."
          description="The store is not separated from travel. Each product is attached to a city culture, story route, or visitor use case, so buying becomes another way to remember Guangdong."
        />
      </section>

      <section className="site-container py-12 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Collections</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl">
              Shop by cultural route.
            </h2>
          </div>
          <Link href="/routes" className="text-sm text-[var(--cinnabar)]">
            Browse routes before choosing
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {storeCollections.map((collection) => (
            <Link key={collection.title} href={collection.href} className="group relative min-h-[25rem] overflow-hidden bg-[var(--night)] text-white sm:min-h-[32rem]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-72 transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${collection.image})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.1),rgba(17,25,35,0.9))]" />
              <div className="relative z-10 flex min-h-[25rem] flex-col justify-end p-5 sm:min-h-[32rem] sm:p-7">
                <p className="text-label text-white/58">{collection.route}</p>
                <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight sm:text-4xl">{collection.title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/74">{collection.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-label text-[var(--cinnabar)]">Recommended shelf</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl">
                Starter cultural objects.
              </h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-base leading-8 text-[var(--muted)]">
                A small recommendation shelf for visitors who want a fast starting point. Open all
                products when you need search, collection filters, or a fuller view.
              </p>
              <Link href="/shop/products" className="mt-5 inline-block text-sm font-semibold text-[var(--cinnabar)]">
                View all products
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {storeProducts.slice(0, 3).map((product) => (
              <StoreProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr]">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Gift logic</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Built for travel memory, not random souvenirs.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
            {bundles.map((bundle) => (
              <article key={bundle.title} className="bg-white p-6">
                <h3 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{bundle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{bundle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--night)] py-16 text-white lg:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-label text-white/48">Store next step</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight">
              Connect products with booking and route pages.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/checkout" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white">
              Checkout cart
            </Link>
            <Link href="/culture" className="border border-white/16 px-6 py-4 text-center text-sm text-white/82">
              Read city culture
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

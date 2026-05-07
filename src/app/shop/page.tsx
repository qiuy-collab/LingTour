import Link from "next/link";

const collections = [
  {
    title: "Guangfu Craft Desk",
    route: "Craft, Stage, and Family Halls",
    href: "/routes/craft-stage-family-halls",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nanfeng%20Kiln%2039101-Foshan%20%2849021028018%29.jpg?width=1600",
    body: "Objects inspired by Foshan ceramics, lion dance color, opera stages, and the tactility of workshop culture.",
  },
  {
    title: "Chaoshan Tea Table",
    route: "Where Drums, Tea, and Tides Meet",
    href: "/routes/drums-tea-and-tides",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=82",
    body: "Tea-led gifts for visitors who want to carry the ritual pace of eastern Guangdong home.",
  },
  {
    title: "Hakka Home Archive",
    route: "Behind the Walled Village",
    href: "/routes/behind-the-walled-village",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=82",
    body: "Memory objects shaped by walled villages, mountain tables, migration stories, and family rituals.",
  },
];

const products = [
  {
    name: "Shiwan Clay Travel Cup",
    collection: "Guangfu Craft Desk",
    price: "RMB 168",
    tag: "Ceramic",
    story: "A compact ceramic cup inspired by Shiwan kiln texture, designed for tea, hotel rooms, and slow route pauses.",
  },
  {
    name: "Lion Dance Color Postcard Set",
    collection: "Guangfu Craft Desk",
    price: "RMB 48",
    tag: "Paper goods",
    story: "A set of route postcards using lion dance color blocks, temple-stage motifs, and Foshan movement notes.",
  },
  {
    name: "Gongfu Tea Starter Cloth",
    collection: "Chaoshan Tea Table",
    price: "RMB 96",
    tag: "Tea ritual",
    story: "A soft table cloth printed with a simple gongfu tea sequence for visitors learning the rhythm for the first time.",
  },
  {
    name: "Harbor Letter Notebook",
    collection: "Chaoshan Tea Table",
    price: "RMB 58",
    tag: "Notebook",
    story: "A notebook for route stamps and travel notes, inspired by Shantou harbor memory and overseas family letters.",
  },
  {
    name: "Hakka Walled House Puzzle",
    collection: "Hakka Home Archive",
    price: "RMB 138",
    tag: "Object",
    story: "A small assembly object that explains courtyard, enclosure, family, and mountain settlement through play.",
  },
  {
    name: "Southern Sea Market Tote",
    collection: "Coastal Route Goods",
    price: "RMB 88",
    tag: "Travel utility",
    story: "A durable market tote for seafood streets, island walks, and the everyday coastal rhythm of western Guangdong.",
  },
];

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
        <div className="site-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Lingnan store</p>
            <h1 className="mt-5 max-w-5xl font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] md:text-7xl">
              Cultural products that continue the route after travel.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            The store is not separated from travel. Each product is attached to a city culture,
            story route, or visitor use case, so buying becomes another way to remember Guangdong.
          </p>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
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
          {collections.map((collection) => (
            <Link key={collection.title} href={collection.href} className="group relative min-h-[32rem] overflow-hidden bg-[var(--night)] text-white">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-72 transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${collection.image})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.1),rgba(17,25,35,0.9))]" />
              <div className="relative z-10 flex min-h-[32rem] flex-col justify-end p-7">
                <p className="text-label text-white/58">{collection.route}</p>
                <h3 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight">{collection.title}</h3>
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
              <p className="text-label text-[var(--cinnabar)]">Product shelf</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl">
                Starter cultural objects.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
              These are front-end product concepts for the MVP store. Later each item can become a
              product detail page with inventory, checkout, and fulfillment rules.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.name} className="bg-[var(--paper)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-label text-[var(--muted)]">{product.tag}</p>
                  <p className="text-sm text-[var(--cinnabar)]">{product.price}</p>
                </div>
                <h3 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{product.collection}</p>
                <p className="mt-5 min-h-28 text-sm leading-7 text-[var(--muted)]">{product.story}</p>
                <button type="button" className="mt-7 w-full border border-[var(--line)] bg-white px-5 py-3 text-sm transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]">
                  Add to basket preview
                </button>
              </article>
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
            <Link href="/interpreting" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white">
              Book a route
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

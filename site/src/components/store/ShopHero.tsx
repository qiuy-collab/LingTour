"use client";

import { Reveal } from "@/components/ui/Reveal";

export function ShopHero() {
  return (
    <section className="relative flex min-h-[60svh] items-center overflow-hidden bg-[var(--night)] text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=82)" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,25,35,0.7),rgba(17,25,35,0.4)_50%,rgba(17,25,35,0.95))]" />
      
      <div className="site-container relative z-10 py-20">
        <div className="max-w-4xl">
          <Reveal>
            <p className="text-label text-[var(--gold)]">Lingnan Store</p>
            <h1 className="mt-8 font-[family:var(--font-display)] text-[4rem] leading-[0.92] sm:text-7xl md:text-8xl lg:text-[9.5rem]">
              Objects of <br className="hidden sm:block" /> Memory.
            </h1>
            <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
              <p className="max-w-xl text-lg leading-8 text-white/70 md:text-xl">
                Each piece in the collection is tied to a route — crafted to carry the texture, weight,
                and cultural origin of its place in Guangdong.
              </p>
              <div className="hidden h-px w-20 bg-white/20 lg:mt-4 lg:block" />
              <p className="max-w-xs text-sm italic leading-7 text-white/40">
                &quot;The store is not separate from the journey. It is the journey, held in your hands.&quot;
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

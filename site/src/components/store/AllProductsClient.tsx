"use client";

import { useMemo, useState } from "react";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import type { StoreProduct } from "@/data/store";

type AllProductsClientProps = {
  products: StoreProduct[];
  collections: string[];
  tags: string[];
};

export function AllProductsClient({ products, collections, tags }: AllProductsClientProps) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("All collections");
  const [tag, setTag] = useState("All types");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const productCollection = product.collection ?? "";
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, productCollection, product.tag, product.story]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCollection = collection === "All collections" || productCollection === collection;
      const matchesTag = tag === "All types" || product.tag === tag;

      return matchesQuery && matchesCollection && matchesTag;
    });
  }, [collection, products, query, tag]);

  return (
    <div>
      <div className="bg-[var(--paper)] bg-grain p-6 lg:p-10 scrapbook-shadow border border-[var(--line)] rotate-[-0.5deg] mb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_14rem_12rem]">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">Search Registry</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Product, route, or story..."
              className="w-full border-b border-[var(--line)] bg-transparent py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] handwritten"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">Collection</span>
            <select
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
              className="w-full border-b border-[var(--line)] bg-transparent py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] appearance-none"
            >
              <option>All collections</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">Type</span>
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="w-full border-b border-[var(--line)] bg-transparent py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--cinnabar)] appearance-none"
            >
              <option>All types</option>
              {tags.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-12">
        <p>
          Showing {filteredProducts.length} <span className="text-[var(--gold)]">/</span> {products.length} Field Objects
        </p>
        {(query || collection !== "All collections" || tag !== "All types") && (
          <button
            type="button"
            className="text-[var(--cinnabar)] hover:underline"
            onClick={() => {
              setQuery("");
              setCollection("All collections");
              setTag("All types");
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid gap-x-12 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <StoreProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="mt-24 text-center py-20 border border-[var(--line)] bg-white/30 scrapbook-shadow rotate-1">
          <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] italic">
            Registry empty.
          </p>
          <p className="mt-4 text-sm text-[var(--muted)] handwritten">No matching field objects found in this archive.</p>
          <button
            onClick={() => { setQuery(""); setCollection("All collections"); setTag("All types"); }}
            className="mt-8 btn-outline px-8 py-3"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

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
      <div className="mb-10 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/52 p-5 shadow-[0_16px_52px_rgba(17,25,35,0.06)] backdrop-blur-sm sm:mb-12 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_14rem_12rem]">
          <label className="block">
            <span className="mb-2 block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Search registry</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Product, route, or story..."
              className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Collection</span>
            <select
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
              className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)]"
            >
              <option>All collections</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Type</span>
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)]"
            >
              <option>All types</option>
              {tags.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between gap-4 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] sm:mb-10">
        <p>
          Showing {filteredProducts.length} <span className="text-[var(--gold)]">/</span> {products.length} Field Objects
        </p>
        {(query || collection !== "All collections" || tag !== "All types") && (
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-full px-3 text-[var(--cinnabar)] hover:bg-[var(--cinnabar)]/8"
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

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <StoreProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="mt-16 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white/44 px-6 py-16 text-center shadow-[0_18px_60px_rgba(17,25,35,0.07)]">
          <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] italic">
            Registry empty.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">No matching field objects found in this archive.</p>
          <button
            onClick={() => { setQuery(""); setCollection("All collections"); setTag("All types"); }}
            className="lt-action lt-action-secondary mt-8"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

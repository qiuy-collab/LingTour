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
      const productCollection = typeof product.collection === 'string' ? product.collection : (product.collection as any)?.title;
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
      <div className="grid gap-3 border border-[var(--line)] bg-white p-4 lg:grid-cols-[1fr_14rem_12rem]">
        <label className="block">
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, route, or story"
            className="h-12 w-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--cinnabar)]"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter by collection</span>
          <select
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            className="h-12 w-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--cinnabar)]"
          >
            <option>All collections</option>
            {collections.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Filter by product type</span>
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="h-12 w-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--cinnabar)]"
          >
            <option>All types</option>
            {tags.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
        <p>
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {(query || collection !== "All collections" || tag !== "All types") && (
          <button
            type="button"
            className="text-[var(--cinnabar)]"
            onClick={() => {
              setQuery("");
              setCollection("All collections");
              setTag("All types");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <StoreProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="mt-10 border border-[var(--line)] bg-white p-10 text-center">
          <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
            No products found.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">Try another keyword, collection, or product type.</p>
        </div>
      )}
    </div>
  );
}

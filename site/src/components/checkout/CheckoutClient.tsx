"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import type { StoreProduct } from "@/data/store";

type CheckoutItem = StoreProduct & {
  quantity: number;
};

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const { locale } = useLocale();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Try fetching the specific product by slug
        if (productSlug) {
          const p = await fetchStoreProductBySlug(productSlug, locale);
          if (!cancelled && p) {
            setProduct(p);
            setLoading(false);
            return;
          }
        }

        // Fallback: get first product
        const products = await fetchStoreProducts(locale);
        if (!cancelled && products.length > 0) {
          // Try cart-based fallback
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem("lingtour-cart");
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const cartItem = products.find((p) => p.slug === parsed[0]?.slug);
                  if (cartItem) {
                    setProduct(cartItem);
                    setLoading(false);
                    return;
                  }
                }
              } catch { /* ignore */ }
            }
          }
          setProduct(products[0]);
        }
      } catch {
        // Graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [productSlug, locale]);

  const [quantity] = useState(1);

  const item: CheckoutItem | null = useMemo(() => {
    if (!product) return null;
    return { ...product, quantity };
  }, [product, quantity]);

  const totals = useMemo(() => {
    if (!item) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = item.price * item.quantity;
    const tax = subtotal * 0.076;
    return { subtotal, tax, total: subtotal + tax };
  }, [item]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-[#777]">Loading checkout...</p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-sm text-[#777]">No product found.</p>
          <Link href="/shop" className="text-sm text-[#2f8ac4] underline">Return to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-white px-6 py-10 lg:px-12 lg:py-14">
          <Link href="/shop" className="mb-9 inline-block text-sm text-[#4f6f8f]">
            LingTour Store
          </Link>

          <div className="mx-auto max-w-[39rem]">
            <p className="mb-5 text-center text-sm text-[#6f6f6f]">Express checkout</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="h-12 rounded-lg bg-[#ffc439] text-xl font-bold text-[#003087]" type="button">
                PayPal
              </button>
              <button className="h-12 rounded-lg bg-black text-xl font-semibold text-white" type="button">
                <span className="text-[#4285f4]">G</span>
                <span className="text-[#ea4335]">o</span>
                <span className="text-[#fbbc05]">o</span>
                <span className="text-[#4285f4]">g</span>
                <span className="text-[#34a853]">l</span>
                <span className="text-[#ea4335]">e</span> Pay
              </button>
            </div>

            <div className="my-7 flex items-center gap-4 text-sm text-[#777]">
              <span className="h-px flex-1 bg-[#dedede]" />
              or
              <span className="h-px flex-1 bg-[#dedede]" />
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Contact</h1>
                <button type="button" className="text-sm text-[#2f8ac4]">
                  Sign in
                </button>
              </div>
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Email" />
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#32a5d0]" />
                Email me with news and offers
              </label>
            </section>

            <section className="mt-8 space-y-4">
              <h2 className="text-2xl font-bold">Delivery</h2>
              <div className="grid grid-cols-2 rounded-xl bg-[#f2f2f2] p-1">
                <button className="rounded-lg bg-white py-3 text-sm font-semibold shadow" type="button">
                  Ship
                </button>
                <button className="py-3 text-sm font-semibold" type="button">
                  Pick up
                </button>
              </div>
              <select className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4">
                <option>Singapore</option>
                <option>United States</option>
                <option>China</option>
                <option>Malaysia</option>
              </select>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="h-13 rounded-lg border border-[#d8d8d8] px-4" placeholder="First name" />
                <input className="h-13 rounded-lg border border-[#d8d8d8] px-4" placeholder="Last name" />
              </div>
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Company (optional)" />
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Address" />
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Apartment, suite, etc. (optional)" />
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Postal code" />
              <input className="h-13 w-full rounded-lg border border-[#d8d8d8] px-4" placeholder="Phone" />
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[#32a5d0]" />
                Save this information for next time
              </label>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-bold">Shipping method</h2>
              <div className="mt-3 rounded-lg bg-[#f2f2f2] px-5 py-5 text-center text-sm text-[#777]">
                Enter your shipping address to view available shipping methods.
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold">Payment</h2>
              <p className="mt-1 text-sm text-[#777]">All transactions are secure and encrypted.</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-[#32a5d0]">
                <div className="flex items-center justify-between bg-[#e9f7fc] px-4 py-3">
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-[#32a5d0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    Credit card
                  </label>
                  <div className="flex gap-1 text-[0.62rem] font-bold">
                    <span className="rounded border bg-white px-2 py-1 text-[#1434cb]">VISA</span>
                    <span className="rounded border bg-white px-2 py-1 text-[#eb001b]">MC</span>
                    <span className="rounded border bg-white px-2 py-1 text-[#2e77bb]">AMEX</span>
                    <span className="rounded border bg-white px-2 py-1 text-[#0077a6]">UP</span>
                  </div>
                </div>
                <div className="grid gap-4 bg-[#f7f7f7] p-4">
                  <input className="h-13 rounded-lg border border-[#d8d8d8] bg-white px-4" placeholder="Card number" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="h-13 rounded-lg border border-[#d8d8d8] bg-white px-4" placeholder="Expiration date (MM / YY)" />
                    <input className="h-13 rounded-lg border border-[#d8d8d8] bg-white px-4" placeholder="Security code" />
                  </div>
                  <input className="h-13 rounded-lg border border-[#d8d8d8] bg-white px-4" placeholder="Name on card" />
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#32a5d0]" />
                    Use shipping address as billing address
                  </label>
                </div>
                <div className="flex items-center justify-between border-t border-[#d8d8d8] px-4 py-4 text-sm">
                  <label className="flex items-center gap-3">
                    <span className="h-4 w-4 rounded-full border border-[#d8d8d8]" />
                    PayPal
                  </label>
                  <span className="font-bold italic text-[#003087]">PayPal</span>
                </div>
              </div>
              <button type="button" className="mt-8 h-14 w-full rounded-lg bg-[#32a5d0] text-lg font-bold text-white">
                Pay now
              </button>
            </section>
          </div>
        </section>

        <aside className="border-l border-[#dedede] bg-[#f3f3f3] px-6 py-10 lg:px-12 lg:py-14">
          <div className="sticky top-28 mx-auto max-w-[31rem]">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#d8c7e7] bg-white">
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <span className="absolute -right-1 -top-2 grid h-6 w-6 place-items-center rounded-full bg-black text-xs text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-[#777]">{item.collection}</p>
              </div>
              <p className="text-sm">{formatStorePrice(item.price, item.currency)}</p>
            </div>

            <div className="mt-6 flex gap-2">
              <input className="h-12 flex-1 rounded-lg border border-[#d8d8d8] bg-white px-4" placeholder="Discount code or gift card" />
              <button type="button" className="rounded-lg bg-[#e6e6e6] px-5 text-sm font-semibold text-[#666]">
                Apply
              </button>
            </div>

            <div className="mt-9 space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>SGD ${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Shipping</span>
                <span>Enter shipping address</span>
              </div>
              <div className="flex justify-between text-[#666]">
                <span>Taxes</span>
                <span>SGD ${totals.tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="text-xl font-bold">Total</p>
                <p className="mt-1 text-sm text-[#777]">Includes estimated tax</p>
              </div>
              <p className="text-2xl font-bold">
                <span className="mr-2 text-sm font-normal text-[#777]">SGD</span>${totals.total.toFixed(2)}
              </p>
            </div>

            <div className="mt-10 rounded-2xl bg-white p-5 text-sm leading-7 text-[#666]">
              This is a front-end payment demo. It reproduces the checkout experience and can connect to Stripe, PayPal, or a local payment provider in production.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import { readStoredUser, type LocalUser } from "@/lib/auth-client";
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

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("express");
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

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
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--muted)] handwritten">Preparing dispatch...</p>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
          <p className="text-xl font-[family:var(--font-display)] text-[var(--river-deep)]">No items in the registry.</p>
          <Link href="/shop" className="btn-outline px-8 py-3">Return to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)] pb-20">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden border-r border-[var(--line)]/40 bg-[linear-gradient(180deg,rgba(247,245,240,0.96),rgba(242,240,234,0.98))] px-6 py-10 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.12]" />
          <div className="relative z-10 flex items-center gap-4 mb-12">
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)] hover:text-[var(--cinnabar)] transition-colors">
              LingTour Store
            </Link>
            <span className="text-[var(--line)]">/</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">Checkout Registry</span>
          </div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-12 relative">
              <div className="absolute -left-12 top-0 text-7xl font-serif text-[var(--gold)]/10 select-none">ID</div>
              <h1 className="font-[family:var(--font-display)] text-5xl italic mb-4">Master Dispatch Registry</h1>
              <p className="text-sm text-[var(--muted)] handwritten">Confirm your field selection and finalize the logistical thread.</p>
            </div>

            <div className="space-y-16">
              {/* 1. Contact & Traveler Identity */}
              <section className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--river-deep)] text-[10px] font-bold text-white">01</span>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">Traveler Identity</h2>
                </div>

                <div className="bg-[var(--paper)] p-8 scrapbook-shadow border border-[var(--line)] rotate-[-0.5deg]">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Contact Registry</p>
                    {!user && (
                      <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] hover:underline">
                        Sign in for member benefits
                      </Link>
                    )}
                  </div>
                  <div className="grid gap-8">
                    <div className="grid gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Email for Dispatch Manifest</span>
                      <input
                        className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)] transition-colors"
                        placeholder="you@field-explorer.com"
                        defaultValue={user?.email}
                      />
                    </div>
                    <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] cursor-pointer hover:text-[var(--river-deep)] transition-colors">
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--cinnabar)]" />
                      Notify me with real-time field updates & signals
                    </label>
                  </div>
                </div>
              </section>

              {/* 2. Delivery Logistics */}
              <section className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--river-deep)] text-[10px] font-bold text-white">02</span>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">Logistics & Coordinates</h2>
                </div>

                <div className="bg-[var(--paper)] p-8 scrapbook-shadow border border-[var(--line)] rotate-[0.5deg]">
                  <div className="grid gap-10">
                    <div className="grid grid-cols-2 rounded-sm border border-[var(--line)] p-1 bg-[var(--paper-deep)]/40">
                      <button
                        onClick={() => setShippingMethod("express")}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${shippingMethod === "express" ? "bg-white shadow-md text-[var(--river-deep)]" : "text-[var(--muted)] hover:text-[var(--river-deep)]"}`}
                        type="button"
                      >
                        Global Express
                      </button>
                      <button
                        onClick={() => setShippingMethod("pickup")}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${shippingMethod === "pickup" ? "bg-white shadow-md text-[var(--river-deep)]" : "text-[var(--muted)] hover:text-[var(--river-deep)]"}`}
                        type="button"
                      >
                        Local Field Pickup
                      </button>
                    </div>

                    {shippingMethod === "express" ? (
                      <div className="grid gap-8 animate-reveal">
                        <div className="grid gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Destination Country</span>
                          <select className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)] appearance-none cursor-pointer">
                            <option>Singapore</option>
                            <option>China (Mainland)</option>
                            <option>Hong Kong SAR</option>
                            <option>United Kingdom</option>
                            <option>United States</option>
                          </select>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">
                          <div className="grid gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">First Name</span>
                            <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="Explorer First Name" />
                          </div>
                          <div className="grid gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Last Name</span>
                            <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="Last Name" />
                          </div>
                        </div>

                        <div className="grid gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Detailed Coordinates (Address)</span>
                          <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="Street, Building, Unit" />
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2">
                          <div className="grid gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Postal Index</span>
                            <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="Postal code" />
                          </div>
                          <div className="grid gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Field Contact (Phone)</span>
                            <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="+ Country Code ..." />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-[var(--gold)]/30 bg-[var(--gold)]/5 animate-reveal">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-4">Selected Pickup Point</p>
                        <p className="font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">LingTour Guangzhou Hub</p>
                        <p className="mt-2 text-sm text-[var(--muted)] handwritten">No. 20 Liwan Road, Guangzhou. Dispatch available within 48 hours of verification.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 3. Field Dispatch Note */}
              <section className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--river-deep)] text-[10px] font-bold text-white">03</span>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">Field Dispatch Note</h2>
                </div>
                <div className="bg-[var(--paper)] p-8 scrapbook-shadow border border-[var(--line)] rotate-[-0.3deg]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] mb-6">Special Instructions for the Handler</p>
                  <textarea
                    className="w-full min-h-[120px] bg-transparent border border-[var(--line)] p-4 text-sm handwritten outline-none focus:border-[var(--gold)] transition-colors"
                    placeholder="E.g. Fragile handling requested, please leave at the concierge if I'm on a field trip..."
                  ></textarea>
                </div>
              </section>

              {/* 4. Secure Settlement */}
              <section className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--river-deep)] text-[10px] font-bold text-white">04</span>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">Secure Settlement</h2>
                </div>

                <div className="bg-[var(--paper)] p-8 scrapbook-shadow border border-[var(--line)] rotate-[0.2deg]">
                  <div className="grid gap-8">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "card", label: "Card", sub: "Global" },
                        { id: "wechat", label: "WeChat", sub: "Pay" },
                        { id: "alipay", label: "Alipay", sub: "Connect" }
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col items-center justify-center py-4 border transition-all ${paymentMethod === method.id ? "bg-[var(--river-deep)] border-[var(--river-deep)] text-white shadow-xl scale-[1.02]" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)]"}`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">{method.label}</span>
                          <span className="text-[8px] opacity-60 uppercase mt-1">{method.sub}</span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-sm border border-[var(--gold)]/20 overflow-hidden bg-white/50 p-8">
                      {paymentMethod === "card" && (
                        <div className="grid gap-8 animate-reveal">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Credit / Debit Settlement</p>
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 border border-[var(--line)] text-[8px] font-bold opacity-40">VISA</span>
                              <span className="px-2 py-0.5 border border-[var(--line)] text-[8px] font-bold opacity-40">AMEX</span>
                            </div>
                          </div>
                          <div className="grid gap-6">
                            <div className="grid gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Card Identity Number</span>
                              <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="XXXX XXXX XXXX XXXX" />
                            </div>
                            <div className="grid gap-8 sm:grid-cols-2">
                              <div className="grid gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Validity (MM/YY)</span>
                                <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="MM / YY" />
                              </div>
                              <div className="grid gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Security Verification (CVV)</span>
                                <input className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]" placeholder="CVV" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(paymentMethod === "wechat" || paymentMethod === "alipay") && (
                        <div className="flex flex-col items-center py-6 animate-reveal">
                          <div className="w-48 h-48 border-4 border-white scrapbook-shadow bg-[var(--paper-deep)] flex items-center justify-center mb-6">
                            <div className="text-center p-6">
                              <div className="w-12 h-12 border-2 border-dashed border-[var(--gold)]/40 rounded-full mx-auto mb-4 animate-spin-slow" />
                              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Generating Secure QR Code...</p>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--muted)] handwritten text-center max-w-[200px]">QR Code will be verified upon dispatch confirmation.</p>
                        </div>
                      )}
                    </div>

                    <button type="button" className="btn-primary w-full py-6 text-sm flex items-center justify-center gap-4 group">
                      <span className="relative z-10">Sign & Secure Dispatch</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:translate-x-2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <aside className="border-l border-[var(--line)] bg-[var(--paper-deep)]/40 px-6 py-10 lg:px-16 lg:py-20 relative">
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
          <div className="sticky top-28 mx-auto max-w-md relative z-10">
            {/* Field Agent Badge */}
            {user && (
              <div className="mb-12 bg-[var(--river-deep)] p-6 shadow-2xl rotate-[-2deg] flex items-center gap-5 border border-white/20">
                <div className="h-16 w-16 bg-[var(--gold)] flex items-center justify-center text-white font-[family:var(--font-display)] text-2xl border-2 border-white/40">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Verified Field Agent</p>
                  <p className="text-lg text-white font-[family:var(--font-display)] italic">{user.name}</p>
                  <p className="text-[8px] font-mono text-white/50 mt-1 uppercase tracking-tighter">ID: {user.accountId}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-8 mb-12 border-b border-[var(--line)] pb-12">
              <div className="relative rotate-[-4deg] scrapbook-shadow border-[8px] border-white group shrink-0">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--gold)] flex items-center justify-center font-bold text-xs text-white z-10 shadow-lg rotate-12">
                  {item.quantity}
                </div>
                <div className="h-28 w-28 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent_60%)]" />
              </div>
              <div className="flex-1 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] mb-1">Collection</p>
                <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] leading-[1.1]">{item.name}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)] handwritten line-clamp-2">{item.story}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>Field Valuation</span>
                <span className="text-[var(--river-deep)]">SGD ${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>Logistics & Handling</span>
                <span className="text-[var(--river-deep)]">SGD ${totals.tax.toFixed(2)}</span>
              </div>

              <div className="pt-8 border-t border-[var(--line)]">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">Registry Total</p>
                    <p className="mt-2 text-[11px] text-[var(--muted)] handwritten">Final settlement amount</p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-[family:var(--font-display)] text-[var(--river-deep)] tracking-tighter">
                      <span className="mr-3 text-sm font-bold opacity-30">SGD</span>${totals.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stamp Overlay */}
            <div className="mt-20 relative opacity-40 select-none">
              <div className="w-32 h-32 border-4 border-dashed border-[var(--gold)] rounded-full flex items-center justify-center text-[var(--gold)] font-bold text-center rotate-[-15deg] p-4 text-[10px] uppercase tracking-widest">
                Field Registry<br />Verified 2026
              </div>
            </div>

            <div className="mt-16 bg-white/60 p-8 border border-[var(--line)] scrapbook-shadow rotate-[1.5deg]">
              <p className="text-[11px] leading-relaxed text-[var(--muted)] handwritten italic">
                "Objects carry the memory of the route. This dispatch ensures the thread continues from our field to your hands."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--jade)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Secure Dispatch Tunnel Active</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

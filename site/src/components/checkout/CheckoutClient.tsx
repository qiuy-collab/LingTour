"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiPost } from "@/lib/api-client";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import { readStoredUser, type LocalUser } from "@/lib/auth-client";
import { readCart } from "@/lib/cart";
import type { StoreProduct } from "@/data/store";

type CheckoutItem = StoreProduct & {
  quantity: number;
};

type CheckoutForm = {
  email: string;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  note: string;
  paymentMethod: string;
};

type CheckoutResponse = {
  orderId: string;
  orderNo: string;
  totalAmount: number;
  status: string;
  stripeClientSecret: string;
};

const INITIAL_FORM: CheckoutForm = {
  email: "",
  recipientName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  note: "",
  paymentMethod: "card",
};

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const { locale } = useLocale();

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CheckoutResponse | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);

  useEffect(() => {
    const storedUser = readStoredUser();
    setUser(storedUser);
    if (storedUser) {
      setForm((current) => ({
        ...current,
        email: storedUser.email || current.email,
        recipientName: storedUser.name || current.recipientName,
        city: storedUser.homeBase || storedUser.country || current.city,
        state: storedUser.homeBase || current.state,
        country: storedUser.country || current.country,
        phone: current.phone,
      }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const storedCart = typeof window !== "undefined" ? readCart() : [];
        const selectedCart = storedCart.filter((item) => item.selected !== false);

        if (selectedCart.length > 0) {
          const products = await fetchStoreProducts(locale);
          const itemMap = new Map(products.map((item) => [item.slug, item]));
          const selectedItems = selectedCart.map((cartItem) => {
            const matchedProduct = itemMap.get(cartItem.slug);
            if (matchedProduct) {
              return {
                ...matchedProduct,
                id: matchedProduct.id ?? cartItem.productId,
                quantity: cartItem.quantity,
              };
            }

            return {
              id: cartItem.productId,
              slug: cartItem.slug,
              name: cartItem.name,
              collection: "",
              price: cartItem.price,
              currency: (cartItem.currency as StoreProduct["currency"]) ?? "SGD",
              image: cartItem.image ?? "",
              story: "",
              tag: "",
              quantity: cartItem.quantity,
            };
          });

          if (!cancelled) {
            setItems(selectedItems);
            setLoading(false);
          }
          return;
        }

        if (productSlug) {
          const product = await fetchStoreProductBySlug(productSlug, locale);
          if (!cancelled && product) {
            setItems([{ ...product, quantity: 1 }]);
            setLoading(false);
            return;
          }
        }

        const products = await fetchStoreProducts(locale);
        if (!cancelled && products.length > 0) {
          setItems([{ ...products[0], quantity: 1 }]);
        }
      } catch {
        setError("We could not load the current checkout selection.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale, productSlug]);

  const totals = useMemo(() => {
    if (items.length === 0) return { subtotal: 0, handling: 0, total: 0 };
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const handling = subtotal > 0 ? Math.max(8, subtotal * 0.06) : 0;
    return { subtotal, handling, total: subtotal + handling };
  }, [items]);

  const canSubmit = useMemo(() => {
    return Boolean(
      items.length &&
        form.email.trim() &&
        form.recipientName.trim() &&
        form.street.trim() &&
        form.city.trim() &&
        form.state.trim() &&
        form.postalCode.trim() &&
        form.country.trim(),
    );
  }, [form, items.length]);

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitOrder = async () => {
    if (!canSubmit || submitting) return;

    const incomplete = items.find((item) => !item.id);
    if (incomplete) {
      setError(`"${incomplete.name}" is not yet mapped to a live catalog item. Re-add it from the store before checkout.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        userId: user?.id || undefined,
        guestEmail: user?.id ? undefined : form.email.trim(),
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        shippingAddress: {
          recipientName: form.recipientName.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
          phone: form.phone.trim() || undefined,
        },
        paymentMethod: form.paymentMethod,
      };

      const created = await apiPost<CheckoutResponse>("/orders/checkout", payload);
      setOrderResult(created);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not create your order right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain">
        <div className="flex min-h-screen items-center justify-center">
          <p className="handwritten text-lg text-[var(--muted)]">
            Preparing your order summary...
          </p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
          <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
            Your bag is empty.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Add a live catalog item before starting checkout.
          </p>
          <Link href="/shop" className="btn-paper px-8 py-3 text-xs">
            Return to store
          </Link>
        </div>
      </main>
    );
  }

  if (orderResult) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-6 py-16 text-[var(--river-deep)] lg:px-16">
        <div className="mx-auto max-w-3xl border border-[var(--line)] bg-[var(--paper)] p-10 scrapbook-shadow">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
            Order logged
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-5xl italic">
            Registry confirmed.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Your order is now in the system as a live pending request. We have
            created the order record and the operations team can continue from
            the admin console with payment follow-up and fulfillment.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Order no.
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
                {orderResult.orderNo}
              </p>
            </div>
            <div className="border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Status
              </p>
              <p className="mt-2 text-lg font-bold capitalize text-[var(--river-deep)]">
                {orderResult.status}
              </p>
            </div>
            <div className="border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Total
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
                SGD ${orderResult.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-primary px-8 py-4 text-xs">
              Continue browsing
            </Link>
            <Link href="/community" className="btn-paper px-8 py-4 text-xs">
              Visit community
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="border-r border-[var(--line)]/40 px-6 py-10 lg:px-16 lg:py-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
                Store checkout
              </p>
              <h1 className="mt-4 font-[family:var(--font-display)] text-5xl italic">
                Finalize delivery details.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                This checkout now creates a live order record. Enter delivery
                details that the operations team can actually ship against.
              </p>
            </div>

            {error ? (
              <div className="mb-8 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/6 px-4 py-3 text-sm text-[var(--cinnabar)]">
                {error}
              </div>
            ) : null}

            <div className="space-y-10">
              <section className="border border-[var(--line)] bg-[var(--paper)] p-8 scrapbook-shadow">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                  Contact
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Email
                    </span>
                    <input
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="you@company.com"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Recipient name
                    </span>
                    <input
                      value={form.recipientName}
                      onChange={(event) => updateField("recipientName", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="Full delivery name"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Phone
                    </span>
                    <input
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="+65 ..."
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Payment method
                    </span>
                    <select
                      value={form.paymentMethod}
                      onChange={(event) => updateField("paymentMethod", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                    >
                      <option value="card">Card</option>
                      <option value="wechat">WeChat Pay</option>
                      <option value="alipay">Alipay</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="border border-[var(--line)] bg-[var(--paper)] p-8 scrapbook-shadow">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                  Delivery address
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Street address
                    </span>
                    <input
                      value={form.street}
                      onChange={(event) => updateField("street", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="Street, building, unit"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      City
                    </span>
                    <input
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="City"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      State / region
                    </span>
                    <input
                      value={form.state}
                      onChange={(event) => updateField("state", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="State or region"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Postal code
                    </span>
                    <input
                      value={form.postalCode}
                      onChange={(event) => updateField("postalCode", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="Postal code"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Country
                    </span>
                    <input
                      value={form.country}
                      onChange={(event) => updateField("country", event.target.value)}
                      className="border-b border-[var(--line)] bg-transparent py-3 text-sm outline-none focus:border-[var(--gold)]"
                      placeholder="Country"
                    />
                  </label>
                </div>
              </section>

              <section className="border border-[var(--line)] bg-[var(--paper)] p-8 scrapbook-shadow">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                  Handling note
                </p>
                <textarea
                  value={form.note}
                  onChange={(event) => updateField("note", event.target.value)}
                  className="mt-5 min-h-[120px] w-full border border-[var(--line)] bg-transparent p-4 text-sm leading-7 outline-none focus:border-[var(--gold)]"
                  placeholder="Anything the fulfillment team should know before packing or dispatching."
                />
              </section>
            </div>
          </div>
        </section>

        <aside className="bg-[var(--paper-deep)]/40 px-6 py-10 lg:px-16 lg:py-20">
          <div className="sticky top-24 mx-auto max-w-md">
            <div className="border border-[var(--line)] bg-white/70 p-8 scrapbook-shadow">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
                Order summary
              </p>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--line)]/70 bg-white/60 px-4 py-4"
                  >
                    <div
                      className="h-16 w-16 shrink-0 rounded-2xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--river-deep)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--river-deep)]">
                      {formatStorePrice(item.price * item.quantity, item.currency)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4 border-t border-[var(--line)] pt-6">
                <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>Items subtotal</span>
                  <span className="font-semibold text-[var(--river-deep)]">
                    SGD ${totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>Handling estimate</span>
                  <span className="font-semibold text-[var(--river-deep)]">
                    SGD ${totals.handling.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-[var(--line)] pt-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                      Order total
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Stored as a live order record for operations follow-up.
                    </p>
                  </div>
                  <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
                    ${totals.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={submitOrder}
                disabled={!canSubmit || submitting}
                className={`mt-8 w-full px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition ${
                  canSubmit && !submitting
                    ? "bg-[var(--river-deep)] text-white hover:bg-[var(--cinnabar)]"
                    : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {submitting ? "Creating order..." : "Create live order"}
              </button>

              <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
                This checkout creates a real pending order in the backend and
                makes it available in the admin panel. Payment capture is still
                handled as a follow-up operational step.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

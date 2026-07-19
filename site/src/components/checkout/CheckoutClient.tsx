"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiPost } from "@/lib/api-client";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { useLocale } from "@/lib/locale-context";
import { readStoredUser, type LocalUser } from "@/lib/auth-client";
import { readCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/region-currency";
import { countryName } from "@/lib/country-list";
import { StripePaymentForm } from "./StripePaymentForm";
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

const CHECKOUT_FIELD_CLASS =
  "min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/68 px-4 py-3 text-sm text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]";

const CHECKOUT_PANEL_CLASS =
  "min-w-0 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_16px_52px_rgba(17,25,35,0.06)] sm:p-7";

function formatStorePrice(price: number, currency = "CNY") {
  return formatCurrency(price, currency);
}

function fillTemplate(
  template: string,
  replacements: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    replacements[key] === undefined ? `{${key}}` : String(replacements[key]),
  );
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const { locale, t } = useLocale();

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<CheckoutResponse | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);

  useEffect(() => {
    const storedUser = readStoredUser();
    setUser(storedUser);
    if (storedUser) {
      const displayCountry = countryName(storedUser.country, locale);
      setForm((current) => ({
        ...current,
        email: storedUser.email || current.email,
        recipientName: storedUser.name || current.recipientName,
        city: storedUser.homeBase || displayCountry || current.city,
        state: storedUser.homeBase || current.state,
        country: displayCountry || current.country,
        phone: current.phone,
      }));
    }
  }, [locale]);

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
              currency: (cartItem.currency as StoreProduct["currency"]) ?? "CNY",
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
        setError(t("checkout.error.loadSelection"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locale, productSlug, t]);

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

  const formatOrderStatus = useCallback(
    (status: string) => {
      const statusKeyMap: Record<string, string> = {
        pending: "checkout.success.statusPending",
        confirmed: "checkout.success.statusConfirmed",
        shipped: "checkout.success.statusShipped",
        delivered: "checkout.success.statusDelivered",
        cancelled: "checkout.success.statusCancelled",
      };

      const key = statusKeyMap[status];
      return key ? t(key) : status.replace(/_/g, " ");
    },
    [t],
  );

  const isSandboxSecret = (secret: string) => secret.startsWith("pi_sandbox_");

  const handlePaymentSuccess = useCallback(() => {
    setPaymentComplete(true);
  }, []);

  const handlePaymentError = useCallback((message: string) => {
    setError(message);
  }, []);

  const submitOrder = async () => {
    if (!canSubmit || submitting) return;

    const incomplete = items.find((item) => !item.id);
    if (incomplete) {
      setError(
        fillTemplate(t("checkout.error.itemUnavailable"), {
          item: incomplete.name,
        }),
      );
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
          : t("checkout.error.createOrder"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-base text-[var(--muted)]">
            {t("checkout.empty.loading")}
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
            {t("checkout.empty.bagTitle")}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {t("checkout.empty.bagBody")}
          </p>
          <Link href="/shop" className="lt-action lt-action-secondary">
            {t("checkout.empty.returnToStore")}
          </Link>
        </div>
      </main>
    );
  }

  if (orderResult && !isSandboxSecret(orderResult.stripeClientSecret) && !paymentComplete) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-6 py-16 text-[var(--river-deep)] lg:px-16">
        <div className="mx-auto max-w-xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_80px_rgba(17,25,35,0.1)] sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
            {t("checkout.page.paymentEyebrow")}
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-4xl leading-[0.96] tracking-[-0.04em]">
            {t("checkout.page.paymentTitle")}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {fillTemplate(t("checkout.page.paymentBody"), {
              orderNo: orderResult.orderNo,
            }).split(orderResult.orderNo).map((segment, index, arr) => (
              <span key={`${segment}-${index}`}>
                {segment}
                {index < arr.length - 1 ? (
                  <span className="font-bold">{orderResult.orderNo}</span>
                ) : null}
              </span>
            ))}
          </p>

          <div className="mt-6 mb-2 flex items-end justify-between border-b border-[var(--line)] pb-4">
            <span className="text-sm text-[var(--muted)]">{t("checkout.summary.total")}</span>
            <span className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {formatStorePrice(orderResult.totalAmount, items[0]?.currency)}
            </span>
          </div>

          {error && (
            <div className="my-4 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/6 px-4 py-3 text-sm text-[var(--cinnabar)]">
              {error}
            </div>
          )}

          <div className="mt-6">
            <StripePaymentForm
              clientSecret={orderResult.stripeClientSecret}
              orderNo={orderResult.orderNo}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </main>
    );
  }

  if (orderResult) {
    return (
      <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-6 py-16 text-[var(--river-deep)] lg:px-16">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_24px_80px_rgba(17,25,35,0.1)] sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
            {paymentComplete ? t("checkout.success.paymentConfirmed") : t("checkout.success.orderLogged")}
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-5xl leading-[0.94] tracking-[-0.04em]">
            {paymentComplete ? t("checkout.success.thankYou") : t("checkout.success.registryConfirmed")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
            {paymentComplete
              ? t("checkout.success.paymentMessage")
              : t("checkout.success.orderMessage")}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {t("checkout.success.orderNo")}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
                {orderResult.orderNo}
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {t("checkout.success.status")}
              </p>
              <p className="mt-2 text-lg font-bold capitalize text-[var(--river-deep)]">
                {formatOrderStatus(orderResult.status)}
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/65 p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {t("checkout.success.total")}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
                {formatStorePrice(orderResult.totalAmount, items[0]?.currency)}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shop" className="lt-action lt-action-primary">
              {t("checkout.success.continueBrowsing")}
            </Link>
            <Link href="/community" className="lt-action lt-action-secondary">
              {t("checkout.success.visitCommunity")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
        <section className="min-w-0 border-r border-[var(--line)]/40 px-4 py-10 sm:px-6 lg:px-16 lg:py-20">
          <div className="mx-auto min-w-0 max-w-2xl">
            <div className="mb-10 sm:mb-12">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--cinnabar)]">
                {t("checkout.page.eyebrow")}
              </p>
              <h1 className="mt-5 max-w-[11ch] font-[family:var(--font-display)] text-[clamp(3.2rem,11vw,5.4rem)] leading-[0.9] tracking-[-0.055em]">
                {t("checkout.page.heading")}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {t("checkout.page.body")}
              </p>
              <div className="mt-7 flex items-center gap-3 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                <span className="text-[var(--cinnabar)]">01 Details</span>
                <span className="h-px flex-1 bg-[var(--line)]" />
                <span>02 Review</span>
                <span className="h-px flex-1 bg-[var(--line)]" />
                <span>03 Payment</span>
              </div>
            </div>

            {error ? (
              <div className="mb-8 border-l-2 border-[var(--cinnabar)] bg-[var(--cinnabar)]/6 px-4 py-3 text-sm text-[var(--cinnabar)]">
                {error}
              </div>
            ) : null}

            <div className="grid min-w-0 gap-5 sm:gap-6">
              <section className={CHECKOUT_PANEL_CLASS}>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  {t("checkout.form.contactSection")}
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label htmlFor="checkout-email" className="grid gap-2 sm:col-span-2">
                    <span className="sr-only">{t("checkout.form.email")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.email")}
                    </span>
                    <input
                      id="checkout-email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.emailPlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-recipient-name" className="grid gap-2 sm:col-span-2">
                    <span className="sr-only">{t("checkout.form.recipientName")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.recipientName")}
                    </span>
                    <input
                      id="checkout-recipient-name"
                      value={form.recipientName}
                      onChange={(event) => updateField("recipientName", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.namePlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-phone" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.phone")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.phone")}
                    </span>
                    <input
                      id="checkout-phone"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.phonePlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-payment-method" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.paymentMethod")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.paymentMethod")}
                    </span>
                    <select
                      id="checkout-payment-method"
                      value={form.paymentMethod}
                      onChange={(event) => updateField("paymentMethod", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                    >
                      <option value="card">{t("checkout.form.paymentOption.card")}</option>
                      <option value="wechat">{t("checkout.form.paymentOption.wechat")}</option>
                      <option value="alipay">{t("checkout.form.paymentOption.alipay")}</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className={CHECKOUT_PANEL_CLASS}>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  {t("checkout.form.addressSection")}
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <label htmlFor="checkout-street" className="grid gap-2 sm:col-span-2">
                    <span className="sr-only">{t("checkout.form.streetAddress")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.streetAddress")}
                    </span>
                    <input
                      id="checkout-street"
                      value={form.street}
                      onChange={(event) => updateField("street", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.addressPlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-city" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.city")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.city")}
                    </span>
                    <input
                      id="checkout-city"
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.cityPlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-state" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.state")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.state")}
                    </span>
                    <input
                      id="checkout-state"
                      value={form.state}
                      onChange={(event) => updateField("state", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.statePlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-postal-code" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.postalCode")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.postalCode")}
                    </span>
                    <input
                      id="checkout-postal-code"
                      value={form.postalCode}
                      onChange={(event) => updateField("postalCode", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.postalCodePlaceholder")}
                    />
                  </label>
                  <label htmlFor="checkout-country" className="grid gap-2">
                    <span className="sr-only">{t("checkout.form.country")}</span>
                    <span aria-hidden="true" className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {t("checkout.form.country")}
                    </span>
                    <input
                      id="checkout-country"
                      value={form.country}
                      onChange={(event) => updateField("country", event.target.value)}
                      className={CHECKOUT_FIELD_CLASS}
                      placeholder={t("checkout.form.countryPlaceholder")}
                    />
                  </label>
                </div>
              </section>

              <section className={CHECKOUT_PANEL_CLASS}>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                  {t("checkout.form.handlingNote")}
                </p>
                <label htmlFor="checkout-note" className="mt-5 block">
                  <span className="sr-only">{t("checkout.form.handlingNote")}</span>
                  <textarea
                    id="checkout-note"
                    value={form.note}
                    onChange={(event) => updateField("note", event.target.value)}
                    className="min-h-[120px] w-full resize-y rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/68 p-4 text-sm leading-7 outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]"
                    placeholder={t("checkout.form.notesPlaceholder")}
                  />
                </label>
              </section>
            </div>
          </div>
        </section>

        <aside className="min-w-0 border-t border-[var(--line)] bg-[var(--paper)]/52 px-4 py-10 sm:px-6 lg:border-t-0 lg:px-12 lg:py-20">
          <div className="sticky top-24 mx-auto max-w-md">
            <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_22px_72px_rgba(17,25,35,0.09)] sm:p-7">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("checkout.summary.title")}
              </p>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--line)]/70 bg-white/60 px-4 py-4"
                  >
                    <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-[var(--radius-sm)] object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--river-deep)]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                        {fillTemplate(t("checkout.summary.quantity"), {
                          count: item.quantity,
                        })}
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
                  <span>{t("checkout.summary.subtotal")}</span>
                  <span className="font-semibold text-[var(--river-deep)]">
                    {formatStorePrice(totals.subtotal, items[0]?.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>{t("checkout.summary.shipping")}</span>
                  <span className="font-semibold text-[var(--river-deep)]">
                    {formatStorePrice(totals.handling, items[0]?.currency)}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-[var(--line)] pt-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                      {t("checkout.summary.orderTotal")}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {t("checkout.summary.operationsNote")}
                    </p>
                  </div>
                  <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
                    {formatStorePrice(totals.total, items[0]?.currency)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={submitOrder}
                disabled={!canSubmit || submitting}
                className={`mt-8 min-h-[3.25rem] w-full rounded-full px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition ${
                  canSubmit && !submitting
                    ? "bg-[var(--river-deep)] text-white hover:bg-[var(--cinnabar)]"
                    : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {submitting ? t("checkout.form.creatingOrder") : t("checkout.form.placeOrder")}
              </button>

              <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
                {t("checkout.payment.nextStep")}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

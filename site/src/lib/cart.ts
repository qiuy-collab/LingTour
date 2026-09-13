"use client";

export type CartItem = {
  productId?: string;
  slug: string;
  name: string;
  quantity: number;
  price: number;
  currency?: string;
  image?: string;
  selected?: boolean;
};

type LegacyCartItem = CartItem & {
  productSlug?: string;
};

const CART_STORAGE_KEY = "lingtour-cart";
const CHECKOUT_ITEMS_STORAGE_KEY = "lingtour-checkout-items";

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const merged = new Map<string, CartItem>();

  for (const entry of raw) {
    if (!isObjectLike(entry)) continue;

    const legacyEntry = entry as LegacyCartItem;
    const slug = typeof legacyEntry.slug === "string"
      ? legacyEntry.slug
      : typeof legacyEntry.productSlug === "string"
        ? legacyEntry.productSlug
        : "";

    if (!slug) continue;

    const quantity = Math.max(1, Number(legacyEntry.quantity) || 1);
    const existing = merged.get(slug);

    if (existing) {
      existing.quantity += quantity;
      existing.selected = existing.selected || legacyEntry.selected !== false;
      if (!existing.image && typeof legacyEntry.image === "string") existing.image = legacyEntry.image;
      if (!existing.currency && typeof legacyEntry.currency === "string") existing.currency = legacyEntry.currency;
      continue;
    }

    merged.set(slug, {
      productId: typeof legacyEntry.productId === "string" ? legacyEntry.productId : undefined,
      slug,
      name: typeof legacyEntry.name === "string" ? legacyEntry.name : slug,
      quantity,
      price: Number(legacyEntry.price) || 0,
      currency: typeof legacyEntry.currency === "string" ? legacyEntry.currency : undefined,
      image: typeof legacyEntry.image === "string" ? legacyEntry.image : undefined,
      selected: legacyEntry.selected !== false,
    });
  }

  return Array.from(merged.values());
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return normalizeCartItems(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("lingtour-cart"));
}

export function rememberCheckoutItems(orderNo: string, slugs: string[]) {
  if (typeof window === "undefined" || !orderNo) return;
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  const all = readCheckoutItems();
  all[orderNo] = uniqueSlugs;
  window.localStorage.setItem(CHECKOUT_ITEMS_STORAGE_KEY, JSON.stringify(all));
}

export function consumeCheckoutItems(orderNo: string) {
  if (typeof window === "undefined" || !orderNo) return [];
  const all = readCheckoutItems();
  const slugs = all[orderNo] ?? [];
  if (Object.prototype.hasOwnProperty.call(all, orderNo)) {
    delete all[orderNo];
    window.localStorage.setItem(CHECKOUT_ITEMS_STORAGE_KEY, JSON.stringify(all));
  }
  return slugs;
}

function readCheckoutItems(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHECKOUT_ITEMS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (!isObjectLike(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([orderNo, value]) => [
        orderNo,
        Array.isArray(value)
          ? value.filter((slug): slug is string => typeof slug === "string")
          : [],
      ]),
    );
  } catch {
    return {};
  }
}

export function addToCart(item: Omit<CartItem, "quantity" | "selected">, quantity = 1) {
  const cart = readCart();
  const existing = cart.find((entry) => entry.slug === item.slug);

  if (existing) {
    existing.quantity += Math.max(1, quantity);
    existing.selected = true;
    if (!existing.productId && item.productId) existing.productId = item.productId;
    if (!existing.image && item.image) existing.image = item.image;
    if (!existing.currency && item.currency) existing.currency = item.currency;
  } else {
    cart.push({
      ...item,
      quantity: Math.max(1, quantity),
      selected: true,
    });
  }

  writeCart(cart);
}

export function setCartItemQuantity(slug: string, quantity: number) {
  if (!Number.isFinite(quantity)) return readCart();
  const cart = readCart();
  const item = cart.find((entry) => entry.slug === slug);
  if (!item) return cart;

  item.quantity = Math.max(1, Math.floor(quantity));
  writeCart(cart);
  return cart;
}

export function setCartItemSelected(slug: string, selected: boolean) {
  const cart = readCart();
  const item = cart.find((entry) => entry.slug === slug);
  if (!item) return cart;

  item.selected = selected;
  writeCart(cart);
  return cart;
}

export function removeCartItem(slug: string) {
  const cart = readCart();
  const next = cart.filter((entry) => entry.slug !== slug);
  if (next.length !== cart.length) writeCart(next);
  return next;
}

export function removeCartItems(slugs: string[]) {
  const targets = new Set(slugs);
  if (targets.size === 0) return readCart();

  const cart = readCart();
  const next = cart.filter((entry) => !targets.has(entry.slug));
  if (next.length !== cart.length) writeCart(next);
  return next;
}

export function finalizePaidCheckout(
  orderNo: string,
  orderType: "shop" | "interpreting_deposit" | string,
) {
  if (orderType !== "shop") return readCart();
  return removeCartItems(consumeCheckoutItems(orderNo));
}

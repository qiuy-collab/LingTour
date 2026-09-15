import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToCart,
  normalizeCartItems,
  readCart,
  rememberCheckoutItems,
  consumeCheckoutItems,
  finalizePaidCheckout,
  removeCartItem,
  removeCartItems,
  setCartItemQuantity,
  setCartItemSelected,
  writeCart,
} from "../cart";

const STORAGE_KEY = "culvoy-cart";

const teaCup = {
  productId: "tea-id",
  slug: "tea-cup",
  name: "Canton Tea Cup",
  price: 46,
  currency: "SGD",
};

const silkScarf = {
  productId: "scarf-id",
  slug: "silk-scarf",
  name: "Lingnan Silk Scarf",
  price: 88,
  currency: "SGD",
};

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns an empty cart for invalid storage", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(readCart()).toEqual([]);
  });

  it("normalizes legacy productSlug entries and merges duplicate slugs", () => {
    expect(
      normalizeCartItems([
        { productSlug: "tea-cup", name: "Tea Cup", quantity: 1, price: 46 },
        { slug: "tea-cup", name: "Tea Cup", quantity: 2, price: 46, selected: false },
        null,
      ]),
    ).toEqual([
      expect.objectContaining({
        slug: "tea-cup",
        quantity: 3,
        selected: true,
      }),
    ]);
  });

  it("adds duplicate products by increasing quantity and selecting them", () => {
    addToCart(teaCup, 1);
    setCartItemSelected(teaCup.slug, false);
    addToCart(teaCup, 2);

    expect(readCart()).toEqual([
      expect.objectContaining({ slug: teaCup.slug, quantity: 3, selected: true }),
    ]);
  });

  it("updates quantity with a minimum of one", () => {
    addToCart(teaCup, 2);

    setCartItemQuantity(teaCup.slug, 0);
    expect(readCart()[0].quantity).toBe(1);

    setCartItemQuantity(teaCup.slug, 3.8);
    expect(readCart()[0].quantity).toBe(3);
  });

  it("does not create a product when updating an unknown slug", () => {
    addToCart(teaCup);
    setCartItemQuantity("unknown", 4);
    setCartItemSelected("unknown", false);

    expect(readCart()).toHaveLength(1);
    expect(readCart()[0].slug).toBe(teaCup.slug);
  });

  it("persists item selection", () => {
    addToCart(teaCup);
    setCartItemSelected(teaCup.slug, false);

    expect(readCart()[0].selected).toBe(false);
  });

  it("removes one item without changing the remaining item", () => {
    addToCart(teaCup);
    addToCart(silkScarf, 2);

    removeCartItem(teaCup.slug);

    expect(readCart()).toEqual([
      expect.objectContaining({ slug: silkScarf.slug, quantity: 2 }),
    ]);
  });

  it("removes only the requested group of items", () => {
    addToCart(teaCup);
    addToCart(silkScarf);

    removeCartItems([teaCup.slug]);

    expect(readCart().map((item) => item.slug)).toEqual([silkScarf.slug]);
  });

  it("remembers and consumes the items associated with one checkout", () => {
    rememberCheckoutItems("LT123", [teaCup.slug, teaCup.slug, silkScarf.slug]);

    expect(consumeCheckoutItems("LT123")).toEqual([
      teaCup.slug,
      silkScarf.slug,
    ]);
    expect(consumeCheckoutItems("LT123")).toEqual([]);
  });

  it("removes only the paid shop order items and consumes the mapping once", () => {
    addToCart(teaCup);
    addToCart(silkScarf);
    rememberCheckoutItems("LT123", [teaCup.slug]);

    finalizePaidCheckout("LT123", "shop");
    finalizePaidCheckout("LT123", "shop");

    expect(readCart().map((item) => item.slug)).toEqual([silkScarf.slug]);
    expect(consumeCheckoutItems("LT123")).toEqual([]);
  });

  it("does not clear cart items for an interpreting deposit", () => {
    addToCart(teaCup);
    rememberCheckoutItems("LT123", [teaCup.slug]);

    finalizePaidCheckout("LT123", "interpreting_deposit");

    expect(readCart().map((item) => item.slug)).toEqual([teaCup.slug]);
    expect(consumeCheckoutItems("LT123")).toEqual([teaCup.slug]);
  });

  it("dispatches the cart event after a write", () => {
    const listener = vi.fn();
    window.addEventListener("culvoy-cart", listener);

    writeCart([{ ...teaCup, quantity: 1, selected: true }]);

    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("culvoy-cart", listener);
  });
});

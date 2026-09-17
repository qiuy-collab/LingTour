import { StrictMode, type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CheckoutSuccessPage from "./page";

const apiGet = vi.fn();
const apiPost = vi.fn();
const finalizePaidCheckout = vi.fn();
const verifyPaymentResult = vi.fn();
let query = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => query,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api-client", () => ({
  apiGet: (...args: unknown[]) => apiGet(...args),
  apiPost: (...args: unknown[]) => apiPost(...args),
}));

vi.mock("@/lib/cart", () => ({
  consumeCheckoutItems: vi.fn(),
  removeCartItems: vi.fn(),
  finalizePaidCheckout: (...args: unknown[]) => finalizePaidCheckout(...args),
}));

vi.mock("@/lib/locale-context", () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));

vi.mock("@/lib/payment-result", () => ({
  verifyPaymentResult: (...args: unknown[]) => verifyPaymentResult(...args),
}));

describe("checkout success page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query = new URLSearchParams({
      orderNo: "LT123",
      statusToken: "status-token",
      status: "confirmed",
    });
  });

  it("ignores a forged confirmed URL status and shows the trusted API result", async () => {
    apiGet.mockResolvedValue({
      orderNo: "LT123",
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "paypal",
      totalAmount: 54,
      currency: "SGD",
      orderType: "shop",
    });
    verifyPaymentResult.mockImplementation(async (input, dependencies) => {
      const order = await dependencies.getStatus(input.orderNo, input.statusToken);
      dependencies.onPending(order);
      return { state: "timeout", order };
    });

    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(screen.getByText("checkout.success.timeoutTitle")).toBeInTheDocument();
    });
    expect(apiGet).toHaveBeenCalledWith("/orders/status", {
      orderNo: "LT123",
      token: "status-token",
    });
    expect(
      screen.queryByText("checkout.success.paymentConfirmed"),
    ).not.toBeInTheDocument();
    expect(finalizePaidCheckout).not.toHaveBeenCalled();
  });

  it("clears the paid shop order once under Strict Mode", async () => {
    apiGet.mockResolvedValue({
      orderNo: "LT123",
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "paypal",
      totalAmount: 54,
      currency: "SGD",
      orderType: "shop",
    });
    verifyPaymentResult.mockImplementation(async (input, dependencies) => {
      const order = await dependencies.getStatus(input.orderNo, input.statusToken);
      return { state: "confirmed", order };
    });

    render(
      <StrictMode>
        <CheckoutSuccessPage />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByText("checkout.success.paymentConfirmed")).toBeInTheDocument();
    });
    expect(finalizePaidCheckout).toHaveBeenCalledTimes(1);
    expect(finalizePaidCheckout).toHaveBeenCalledWith("LT123", "shop");
  });
});

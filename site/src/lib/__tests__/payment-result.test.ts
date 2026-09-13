import { describe, expect, it, vi } from "vitest";

import { verifyPaymentResult } from "../payment-result";

const unpaidOrder = {
  orderNo: "LT123",
  status: "pending",
  paymentStatus: "unpaid" as const,
  paymentMethod: "stripe",
  totalAmount: 54,
  currency: "SGD",
  orderType: "shop" as const,
};

describe("verifyPaymentResult", () => {
  it("rejects a result URL without a capability token", async () => {
    const getStatus = vi.fn();

    const result = await verifyPaymentResult(
      { orderNo: "LT123", statusToken: null },
      { getStatus },
    );

    expect(result.state).toBe("failed");
    expect(getStatus).not.toHaveBeenCalled();
  });

  it("does not treat an unpaid order as confirmed", async () => {
    const result = await verifyPaymentResult(
      { orderNo: "LT123", statusToken: "status-token" },
      {
        getStatus: vi.fn().mockResolvedValue(unpaidOrder),
        delays: [0, 0],
        wait: vi.fn().mockResolvedValue(undefined),
      },
    );

    expect(result.state).toBe("timeout");
  });

  it("confirms only after the local API reports the order paid", async () => {
    const paidOrder = {
      ...unpaidOrder,
      status: "confirmed",
      paymentStatus: "paid" as const,
    };

    const result = await verifyPaymentResult(
      { orderNo: "LT123", statusToken: "status-token" },
      {
        getStatus: vi.fn().mockResolvedValue(paidOrder),
        delays: [0],
        wait: vi.fn().mockResolvedValue(undefined),
      },
    );

    expect(result).toEqual({ state: "confirmed", order: paidOrder });
  });

  it.each(["failed", "refunded"] as const)(
    "reports %s payments as failed instead of success",
    async (paymentStatus) => {
      const order = { ...unpaidOrder, paymentStatus };
      const result = await verifyPaymentResult(
        { orderNo: "LT123", statusToken: "status-token" },
        {
          getStatus: vi.fn().mockResolvedValue(order),
          delays: [0],
          wait: vi.fn().mockResolvedValue(undefined),
        },
      );

      expect(result).toEqual({ state: "failed", order });
    },
  );

  it("captures PayPal first but trusts only the following local status", async () => {
    const paidOrder = {
      ...unpaidOrder,
      status: "confirmed",
      paymentStatus: "paid" as const,
      paymentMethod: "paypal",
    };
    const capturePayPal = vi.fn().mockResolvedValue({ paymentStatus: "paid" });
    const getStatus = vi
      .fn()
      .mockResolvedValueOnce({ ...unpaidOrder, paymentMethod: "paypal" })
      .mockResolvedValueOnce(paidOrder);

    const result = await verifyPaymentResult(
      {
        orderNo: "LT123",
        statusToken: "status-token",
        provider: "paypal",
        paypalOrderId: "PAYPAL123",
      },
      {
        capturePayPal,
        getStatus,
        delays: [0, 0],
        wait: vi.fn().mockResolvedValue(undefined),
      },
    );

    expect(capturePayPal).toHaveBeenCalledWith("PAYPAL123");
    expect(getStatus).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ state: "confirmed", order: paidOrder });
  });

  it("fails closed when the status capability is rejected", async () => {
    const error = Object.assign(new Error("Order status is unavailable"), {
      statusCode: 404,
    });

    const result = await verifyPaymentResult(
      { orderNo: "LT123", statusToken: "wrong-token" },
      {
        getStatus: vi.fn().mockRejectedValue(error),
        delays: [0],
        wait: vi.fn().mockResolvedValue(undefined),
      },
    );

    expect(result.state).toBe("failed");
  });
});

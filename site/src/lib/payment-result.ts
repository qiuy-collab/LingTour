export type PublicOrderStatus = {
  orderNo: string;
  status: string;
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
  paymentMethod: string | null;
  totalAmount: number;
  currency: string;
  orderType: "shop" | "interpreting_deposit" | string;
};

export type PaymentVerificationResult =
  | { state: "confirmed"; order: PublicOrderStatus }
  | { state: "failed"; order?: PublicOrderStatus; error?: string }
  | { state: "timeout"; order?: PublicOrderStatus; error?: string };

type PaymentResultInput = {
  orderNo: string | null;
  statusToken: string | null;
  provider?: string | null;
  paypalOrderId?: string | null;
};

type PaymentResultDependencies = {
  getStatus: (
    orderNo: string,
    statusToken: string,
  ) => Promise<PublicOrderStatus>;
  capturePayPal?: (paypalOrderId: string) => Promise<unknown>;
  delays?: number[];
  wait?: (delay: number) => Promise<void>;
  onPending?: (order: PublicOrderStatus) => void;
};

const DEFAULT_STATUS_DELAYS = [0, 1000, 2000, 3000, 5000];
const paypalCaptureRequests = new Map<string, Promise<unknown>>();

function defaultWait(delay: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delay));
}

function getStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : undefined;
}

async function capturePayPalOnce(
  paypalOrderId: string,
  capture: (paypalOrderId: string) => Promise<unknown>,
) {
  const existing = paypalCaptureRequests.get(paypalOrderId);
  if (existing) return existing;

  const request = capture(paypalOrderId).catch((error) => {
    paypalCaptureRequests.delete(paypalOrderId);
    throw error;
  });
  paypalCaptureRequests.set(paypalOrderId, request);
  return request;
}

export async function verifyPaymentResult(
  input: PaymentResultInput,
  dependencies: PaymentResultDependencies,
): Promise<PaymentVerificationResult> {
  const orderNo = input.orderNo?.trim();
  const statusToken = input.statusToken?.trim();
  if (!orderNo || !statusToken) {
    return { state: "failed", error: "Payment verification details are missing." };
  }

  let captureError: string | undefined;
  if (input.provider === "paypal") {
    const paypalOrderId = input.paypalOrderId?.trim();
    if (!paypalOrderId || !dependencies.capturePayPal) {
      return { state: "failed", error: "PayPal confirmation details are missing." };
    }
    try {
      await capturePayPalOnce(paypalOrderId, dependencies.capturePayPal);
    } catch (error) {
      captureError = getErrorMessage(error);
    }
  }

  const delays = dependencies.delays ?? DEFAULT_STATUS_DELAYS;
  const wait = dependencies.wait ?? defaultWait;
  let lastOrder: PublicOrderStatus | undefined;
  let lastError = captureError;

  for (const delay of delays) {
    if (delay > 0) await wait(delay);
    try {
      const order = await dependencies.getStatus(orderNo, statusToken);
      if (order.orderNo !== orderNo) {
        return { state: "failed", error: "Order verification did not match." };
      }
      lastOrder = order;
      if (order.paymentStatus === "paid") {
        return { state: "confirmed", order };
      }
      if (
        order.paymentStatus === "failed" ||
        order.paymentStatus === "refunded"
      ) {
        return { state: "failed", order };
      }
      dependencies.onPending?.(order);
    } catch (error) {
      lastError = getErrorMessage(error) ?? lastError;
      if (getStatusCode(error) === 404) {
        return { state: "failed", error: lastError };
      }
    }
  }

  return { state: "timeout", order: lastOrder, error: lastError };
}

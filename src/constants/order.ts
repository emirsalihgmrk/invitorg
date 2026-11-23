// A `pending` order is the temporary hold on seats, valid until `expiresAt`.
export const ORDER_STATUSES = ["pending", "paid", "expired", "cancelled", "refunded"] as const;

export const PAYMENT_STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

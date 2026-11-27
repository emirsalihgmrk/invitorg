// A `pending` order is the temporary hold on seats, valid until `expiresAt`.
export const ORDER_STATUSES = ["pending", "paid", "expired", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "succeeded", "failed", "refunded"] as const;

// Long enough to pay, short enough that abandoned checkouts free seats quickly.
export const ORDER_HOLD_MINUTES = 10;

// Small events: one guest should not be able to take a large share of the seats.
export const MAX_SEATS_PER_ORDER = 10;

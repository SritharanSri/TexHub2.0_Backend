const ROLES = {
  CUSTOMER: 'customer',
  TAILOR: 'tailor',
  ADMIN: 'admin',
};

const ORDER_STATUSES = {
  PENDING_QUOTATION: 'pending_quotation',
  QUOTATION_RECEIVED: 'quotation_received',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  IN_WORK: 'in_work',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ORDER_STATUS_TRANSITIONS = {
  pending_quotation: ['quotation_received', 'cancelled'],
  quotation_received: ['payment_pending', 'cancelled'],
  payment_pending: ['confirmed', 'cancelled'],
  confirmed: ['in_work'],
  in_work: ['dispatched', 'delivered'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

const QUOTATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

const PAYMENT_METHODS = {
  BANK_DEPOSIT: 'bank_deposit',
  CARD: 'card',
};

const PAYMENT_STATUSES = {
  PENDING_VERIFICATION: 'pending_verification',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const ESCROW_STATUSES = {
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
};

const COMPLAINT_STATUSES = {
  OPEN: 'open',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const OTP_PURPOSES = {
  EMAIL_VERIFY: 'email_verify',
  LOGIN_2FA: 'login_2fa',
  PASSWORD_RESET: 'password_reset',
};

const DELIVERY_OPTIONS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  CUSTOM: 'custom',
};

const IMAGE_TYPES = {
  REFERENCE: 'reference',
  DESIGN: 'design',
};

module.exports = {
  ROLES,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  QUOTATION_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  ESCROW_STATUSES,
  COMPLAINT_STATUSES,
  VERIFICATION_STATUSES,
  OTP_PURPOSES,
  DELIVERY_OPTIONS,
  IMAGE_TYPES,
};

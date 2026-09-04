// ── Currency auto-derived from branch ────────────────────────────────────────
// NOTE: the "Uganda" key currently maps to KES because that branch is really
// Nairobi (Kenya) under a placeholder name — see Task 3 (branch rename).
// When that rename lands, swap this key to "Nairobi" and nothing else here
// needs to change.
export const BRANCH_CURRENCIES = {
  "Bujumbura HQ": "BIF",
  "Kampala": "UGX",
  "Uganda": "KES",
  "DRC": "CDF",
};

export const DEFAULT_CURRENCY = "BIF";

export const getCurrency = (branch) => BRANCH_CURRENCIES[branch] || DEFAULT_CURRENCY;

export const formatPrice = (amount, branch) => `${getCurrency(branch)} ${new Intl.NumberFormat("fr-RW").format(Math.round(amount || 0))}`;

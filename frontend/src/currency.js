// ── Currency auto-derived from branch ────────────────────────────────────────
export const BRANCH_CURRENCIES = {
  "Bujumbura HQ": "BIF",
  "Kampala": "UGX",
  "Nairobi": "KES",
  "DRC": "CDF",
};

export const DEFAULT_CURRENCY = "BIF";

export const getCurrency = (branch) => BRANCH_CURRENCIES[branch] || DEFAULT_CURRENCY;

export const formatPrice = (amount, branch) => `${getCurrency(branch)} ${new Intl.NumberFormat("fr-RW").format(Math.round(amount || 0))}`;

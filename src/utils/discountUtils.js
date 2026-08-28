/**
 * Discount and Promo Code Utility Helpers
 * Centralized to eliminate circular dependencies across Navbar, Prices, and Modals.
 */

export function isDiscountActive(d) {
  if (!d || !d.active) return false;
  if (!d.expires_at) return true;
  let expiryDate = new Date(d.expires_at);
  if (typeof d.expires_at === 'string' && d.expires_at.length === 10) {
    expiryDate = new Date(`${d.expires_at}T23:59:59`);
  }
  return !isNaN(expiryDate.getTime()) && expiryDate.getTime() > Date.now();
}

export function getDiscountExpiryDate(d) {
  if (!d?.expires_at) return null;
  if (typeof d.expires_at === 'string' && d.expires_at.length === 10) {
    return new Date(`${d.expires_at}T23:59:59`);
  }
  const date = new Date(d.expires_at);
  return isNaN(date.getTime()) ? null : date;
}

export function applyDiscount(plan, discounts, panelType) {
  if (!plan) return { label: 'VIP Plan', lkr: 0, days: 'Access', popular: false, crown: false };
  const discList = Array.isArray(discounts) ? discounts : [];
  const match = discList.find(d => {
    if (!isDiscountActive(d)) return false;
    const panelMatch = !d.panel_type || d.panel_type === 'both' || d.panel_type === panelType;
    const labelMatch = !d.plan_label || d.plan_label.toLowerCase() === plan.label?.toLowerCase();
    return panelMatch && labelMatch;
  });
  if (!match) return { ...plan, discount: null };
  const originalLkr = Number(plan.lkr) || 0;
  const val = Number(match.discount_value) || 0;
  const discountedLkr = match.discount_type === 'percentage'
    ? Math.round(originalLkr * (1 - val / 100))
    : Math.max(0, originalLkr - val);
  return { ...plan, originalLkr, lkr: discountedLkr, discount: match };
}

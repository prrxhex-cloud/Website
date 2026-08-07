import { base44 } from '@/api/base44Client';

const DURATION_TO_LABEL = {
  '1_day': '1 Day',
  '7_days': '1 Week',
  '30_days': '1 Month',
  'lifetime': 'Lifetime',
};

let cachedPlans = null;

export async function getPricePlans() {
  if (cachedPlans) return cachedPlans;
  try {
    const data = await base44.entities.PricePlan.list('sort_order', 100);
    cachedPlans = data;
    return data;
  } catch (e) {
    return [];
  }
}

export function getExpectedPrice(plans, productType, duration) {
  const label = DURATION_TO_LABEL[duration];
  if (!label) return null;

  if (productType === 'both') {
    const ext = plans.find(p => p.panel_type === 'external' && p.label?.toLowerCase() === label.toLowerCase());
    const int_ = plans.find(p => p.panel_type === 'internal' && p.label?.toLowerCase() === label.toLowerCase());
    return (ext?.lkr || 0) + (int_?.lkr || 0);
  }

  const plan = plans.find(p => p.panel_type === productType && p.label?.toLowerCase() === label.toLowerCase());
  return plan?.lkr || null;
}

export function buildDurationOptions(plans, productType) {
  return [
    { value: '1_day', label: '1 Day' },
    { value: '7_days', label: '7 Days' },
    { value: '30_days', label: '30 Days' },
    { value: 'lifetime', label: 'Lifetime' },
  ].map(opt => ({
    ...opt,
    price: getExpectedPrice(plans, productType, opt.value),
  }));
}
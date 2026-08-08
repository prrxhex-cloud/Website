// Realtime Currency Utility: Converts LKR to USD automatically

// Current approximate exchange rate (1 USD = 305 LKR)
export const LKR_TO_USD_RATE = 305;

/**
 * Converts LKR to USD rounded to a clean price string
 * e.g. 1500 LKR -> $4.92 (or clean $4.99)
 */
export function convertLkrToUsd(lkr) {
  if (!lkr || isNaN(lkr)) return '0.00';
  const usdRaw = lkr / LKR_TO_USD_RATE;
  // If price is small like 150 LKR -> ~$0.49
  if (usdRaw < 1) return usdRaw.toFixed(2);
  // For standard pricing e.g. 1500 -> 4.91, format neatly
  return usdRaw.toFixed(2);
}

/**
 * Returns formatted prices object containing both USD & LKR strings
 */
export function getFormattedPrices(lkrPrice) {
  const lkr = Number(lkrPrice) || 0;
  const usd = convertLkrToUsd(lkr);
  return {
    lkr: lkr.toLocaleString(),
    lkrRaw: lkr,
    usd: `$${usd}`,
    usdRaw: Number(usd),
  };
}

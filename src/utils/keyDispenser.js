import { supabase } from '@/lib/supabase';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';

/**
 * Automatically dispenses an available key from the Admin Key Bank via Supabase.
 */
export async function dispenseLicenseKey({ productType, duration, customerEmail, transactionId, receiptId }) {
  try {
    const normDuration = normalizeDurationKey(duration);
    
    // Query available keys
    const { data: keys, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('status', 'available')
      .limit(5000);

    if (error) throw error;

    if (!keys || keys.length === 0) {
      return { success: false, outOfStock: true, message: 'No keys available in Key Bank.' };
    }

    // Find first matching key by product type and duration
    const match = keys.find(k => {
      const matchProduct = !k.product_type || k.product_type === productType || k.product_type === 'both' || k.panel_type === productType;
      const matchDuration = normalizeDurationKey(k.duration || k.duration_normalized) === normDuration;
      return matchProduct && matchDuration;
    });

    if (!match) {
      return { success: false, outOfStock: true, message: `No available keys for duration: ${duration}` };
    }

    // Mark key as used in Key Bank
    const { error: updateError } = await supabase
      .from('license_keys')
      .update({
        status: 'used',
        used_by: customerEmail || 'VIP Customer',
        transaction_id: transactionId || '',
        receipt_id: receiptId || '',
        sold_date: new Date().toISOString(),
        verified_method: 'ai_automated_vision'
      })
      .eq('id', match.id);

    if (updateError) throw updateError;

    return {
      success: true,
      licenseKey: match.license_key || match.key,
      keyData: match
    };
  } catch (error) {
    console.error('Key dispense error:', error);
    return { success: false, error: error.message };
  }
}

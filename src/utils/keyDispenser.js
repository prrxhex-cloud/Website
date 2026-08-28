import { supabase } from '@/lib/supabase';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';

/**
 * Automatically dispenses an available key from the Admin Key Bank via Supabase.
 */
export async function dispenseLicenseKey({ productType, duration, customerEmail, transactionId, receiptId }) {
  try {
    const normDuration = normalizeDurationKey(duration);
    
    // 1. Primary: Use secure atomic PostgreSQL RPC function (Immune to race conditions and RLS restrictions)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('dispense_license_key', {
      p_product_type: productType || 'external',
      p_duration: duration || '1 Month',
      p_customer_email: customerEmail || 'VIP Customer',
      p_transaction_id: transactionId || '',
      p_receipt_id: receiptId || ''
    });

    if (!rpcError && rpcResult) {
      if (rpcResult.success) {
        return {
          success: true,
          licenseKey: rpcResult.licenseKey,
          keyData: { id: rpcResult.keyId, license_key: rpcResult.licenseKey }
        };
      } else {
        return {
          success: false,
          outOfStock: true,
          message: rpcResult.message || `No available keys for duration: ${duration}`
        };
      }
    }

    // 2. Fallback: Direct query (Used by Admins or legacy fallback)
    const { data: keys, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('status', 'available')
      .limit(5000);

    if (error) throw error;

    if (!keys || keys.length === 0) {
      return { success: false, outOfStock: true, message: 'No keys available in Key Bank.' };
    }

    const match = keys.find(k => {
      const matchProduct = !k.product_type || k.product_type === productType || k.product_type === 'both' || k.panel_type === productType;
      const matchDuration = normalizeDurationKey(k.duration || k.duration_normalized) === normDuration;
      return matchProduct && matchDuration;
    });

    if (!match) {
      return { success: false, outOfStock: true, message: `No available keys for duration: ${duration}` };
    }

    const { error: updateError } = await supabase
      .from('license_keys')
      .update({
        status: 'used',
        used_by: customerEmail || 'VIP Customer',
        buyer_email: customerEmail || 'VIP Customer',
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

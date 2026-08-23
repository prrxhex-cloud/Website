import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { normalizeDurationKey } from '@/components/dashboard/KeyBankTab';

/**
 * Automatically dispenses an available key from the Admin Key Bank.
 */
export async function dispenseLicenseKey({ productType, duration, customerEmail, transactionId, receiptId }) {
  try {
    const normDuration = normalizeDurationKey(duration);
    
    // Query available keys with large limit
    const keysQuery = query(
      collection(db, 'license_keys'),
      where('status', '==', 'available'),
      limit(5000)
    );
    const snap = await getDocs(keysQuery);

    if (snap.empty) {
      return { success: false, outOfStock: true, message: 'No keys available in Key Bank.' };
    }

    // Find first matching key by product type and duration
    const allAvailable = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const match = allAvailable.find(k => {
      const matchProduct = !k.product_type || k.product_type === productType || k.product_type === 'both';
      const matchDuration = normalizeDurationKey(k.duration || k.duration_normalized) === normDuration;
      return matchProduct && matchDuration;
    });

    if (!match) {
      return { success: false, outOfStock: true, message: `No available keys for duration: ${duration}` };
    }

    // Atomically mark key as used in Key Bank
    await updateDoc(doc(db, 'license_keys', match.id), {
      status: 'used',
      used_by: customerEmail || 'VIP Customer',
      transaction_id: transactionId || '',
      receipt_id: receiptId || '',
      sold_date: new Date().toISOString(),
      verified_method: 'ai_automated_vision'
    });

    return {
      success: true,
      licenseKey: match.license_key || match.key,
      keyData: match
    };
  } catch (error) {
    console.error("Key dispense error:", error);
    return { success: false, error: error.message };
  }
}

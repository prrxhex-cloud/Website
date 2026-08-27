import { computeSha256 } from './cryptoShield';
import { supabase } from '@/lib/supabase';

const GENESIS_BLOCK_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

class CryptographicHashLedger {
  async sealTransactionBlock({ transactionId, customerEmail, amountPaid, planTitle, licenseKey }) {
    try {
      let previousHash = GENESIS_BLOCK_HASH;
      let blockHeight = 1;

      try {
        const { data: latestRows, error } = await supabase
          .from('transaction_ledger')
          .select('*')
          .order('block_height', { ascending: false })
          .limit(1);

        if (latestRows && latestRows.length > 0 && !error) {
          const latestDoc = latestRows[0];
          previousHash = latestDoc.block_hash || GENESIS_BLOCK_HASH;
          blockHeight = (latestDoc.block_height || 0) + 1;
        }
      } catch (err) {
        console.warn('Ledger fetch fallback, using genesis seed:', err);
      }

      const timestamp = new Date().toISOString();
      const blockPayload = `${previousHash}|${transactionId}|${customerEmail}|${amountPaid}|${planTitle}`;
      const blockHash = await computeSha256(blockPayload);

      const blockDoc = {
        block_height: blockHeight,
        previous_hash: previousHash,
        block_hash: blockHash,
        transaction_id: transactionId,
        customer_email: customerEmail || 'VIP Guest',
        amount_paid: amountPaid,
        plan_title: planTitle,
        license_key_masked: licenseKey ? `${licenseKey.slice(0, 8)}...` : 'N/A',
        timestamp: timestamp,
        integrity_signature: 'PRRX-CRYPTO-SEAL-V5.8'
      };

      await supabase.from('transaction_ledger').insert(blockDoc);
      return { success: true, blockHash, blockHeight };
    } catch (e) {
      console.warn('Ledger append notice:', e);
      return { success: false, error: e.message };
    }
  }
}

export const hashLedger = new CryptographicHashLedger();

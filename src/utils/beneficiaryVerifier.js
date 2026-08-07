import { db } from '@/lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';

let cachedAccounts = null;

export async function getBeneficiaryAccounts() {
  if (cachedAccounts) return cachedAccounts;
  try {
    const q = query(collection(db, 'beneficiary_accounts'), where('active', '==', true));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    cachedAccounts = data;
    return cachedAccounts;
  } catch (e) {
    return [];
  }
}

export function clearBeneficiaryCache() {
  cachedAccounts = null;
}

export function normalizeAccountNumber(num) {
  if (!num) return '';
  return String(num).replace(/[\s\-]/g, '');
}

export async function verifyBeneficiaryAccount(extractedNumber) {
  if (!extractedNumber) {
    return { verified: false, reason: 'Could not extract a beneficiary account number from the receipt.' };
  }
  const accounts = await getBeneficiaryAccounts();
  if (accounts.length === 0) {
    return { verified: true, reason: 'No beneficiary accounts registered — skipping check.' };
  }
  const normalized = normalizeAccountNumber(extractedNumber);
  const match = accounts.find(a => normalizeAccountNumber(a.account_number) === normalized);
  if (match) {
    return {
      verified: true,
      matchedAccount: match,
      reason: `Account number matches registered ${match.owner_type}: ${match.owner_name || match.account_number}.`,
    };
  }
  return {
    verified: false,
    reason: `Beneficiary account number ${extractedNumber} does not match any registered team/reseller account.`,
  };
}
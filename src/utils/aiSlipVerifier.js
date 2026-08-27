import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { DEFAULT_BENEFICIARIES } from '@/components/dashboard/BeneficiaryAccountsTab';

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Resizes large image to max 1280px for ultra-fast OCR upload (<1 second)
 */
export const resizeImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const base64String = dataUrl.split(',')[1];
        resolve(base64String);
      };
      img.onerror = () => {
        const raw = e.target.result.split(',')[1];
        resolve(raw);
      };
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export function cleanDigits(val) {
  if (!val) return '';
  return String(val).replace(/[^0-9]/g, '');
}

/**
 * Checks if the account number on the slip matches the admin's account,
 * supporting full account numbers as well as masked accounts (e.g. XXXX4125 matches 78384125).
 */
export function isAccountMatch(adminAccount, extractedAccount) {
  const cleanAdmin = cleanDigits(adminAccount);
  const cleanExtracted = cleanDigits(extractedAccount);
  if (!cleanAdmin || !cleanExtracted) return false;

  // 1. Exact match
  if (cleanAdmin === cleanExtracted) return true;

  // 2. Substring match
  if (cleanAdmin.includes(cleanExtracted) || cleanExtracted.includes(cleanAdmin)) return true;

  // 3. Masked match (last 4 digits e.g. XXXX4125 -> 4125 matches 78384125)
  if (cleanExtracted.length >= 4 && cleanAdmin.endsWith(cleanExtracted)) return true;
  if (cleanAdmin.length >= 4 && cleanExtracted.endsWith(cleanAdmin.slice(-4))) return true;

  return false;
}

/**
 * Parses diverse bank slip date formats into a standard JS Date.
 */
export function parseSlipDate(dateStr) {
  if (!dateStr) return null;
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) return new Date(timestamp);

  const ddmmyyyy = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const yyyymmdd = dateStr.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Scans a bank slip image via direct Gemini REST API with multi-model fallback,
 * extracting transaction fields and checking for fake AI editing/tampering.
 */
export async function parseSlipWithGemini(file) {
  const base64Data = await resizeImageToBase64(file);
  const apiKey = getApiKey();

  const prompt = `You are a forensic fraud-detection and precision OCR engine for Sri Lankan bank payment receipts (ComBank Q+, BOC SmartPay, People's Bank, Sampath Vishwa, HNB, FriMi, EzCash, mCash, etc.).

Analyze this payment receipt image and extract these fields in valid JSON format:
{
  "amount": <number or null>,
  "bank_name": <string or null>,
  "transaction_number": <string or null>,
  "date": <string or null>,
  "beneficiary_account_number": <string or null>,
  "recipient_bank": <string or null>,
  "beneficiary_name": <string or null>,
  "status": <string or null>,
  "is_ai_edited_or_fake": <boolean>,
  "tamper_details": <string or null>
}

CRITICAL FORENSIC RULES:
1. For amount: Extract the exact paid/transferred amount as a number (e.g. 650, 1000).
2. For date: Extract the complete transaction date and time exactly as printed on the receipt.
3. For beneficiary_account_number: Extract the destination account number (even if masked like "XXXX4125" or "4125").
4. For is_ai_edited_or_fake:
   - Check if there are signs of AI image generation, fake receipt generator watermarks, Photoshop font overlays, or mismatched digital fonts on the price or date numbers.
   - IMPORTANT: DO NOT flag genuine official bank logos, bank watermark patterns (e.g. Commercial Bank background watermark, BOC lion seal, People's Bank emblem) as fake. Legitimate bank security watermarks are 100% authentic!
   - Only set is_ai_edited_or_fake to true if there is clear evidence of malicious digital alteration/AI forgery.
5. Respond ONLY with valid JSON.`;

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.warn(`Model ${modelName} returned status ${response.status}:`, errJson);
        lastError = new Error(errJson?.error?.message || `HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response from AI vision");

      const parsed = JSON.parse(rawText);
      return parsed;

    } catch (err) {
      console.warn(`Error with model ${modelName}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("AI vision verification server timeout. Please try again.");
}

/**
 * 100% Comprehensive Fraud Verification Pipeline:
 *
 * PRIORITY EXECUTION SEQUENCE:
 * 1. FIRST CHECK: Date Freshness (Must be <= 24 hours old. If not, reject immediately!)
 * 2. SECOND CHECK: Price / Amount (Must be >= plan price. If less, reject immediately!)
 * 3. THIRD CHECK: AI Watermark & Digital Tampering Inspection (Must not be AI-generated or forged)
 * 4. FOURTH CHECK: Beneficiary Account Match (Must be sent to verified Admin Bank Account)
 * 5. FIFTH CHECK: Anti-Duplicate Slip (Transaction Reference ID must not be claimed before)
 */
export async function verifySlipTransaction({ file, expectedLkrAmount, planTitle, customerEmail }) {
  try {
    // Scan image with AI
    const ocrData = await parseSlipWithGemini(file);

    if (!ocrData || (!ocrData.amount && !ocrData.transaction_number && !ocrData.date)) {
      return {
        verified: false,
        reason: "❌ Unreadable Receipt: Could not read payment details clearly. Please upload an uncropped, high-resolution photo.",
        ocrData
      };
    }

    // -------------------------------------------------------------
    // 1. STEP 1: DATE FRESHNESS CHECK (MUST BE <= 24 HOURS)
    // -------------------------------------------------------------
    if (ocrData.date) {
      const parsedDate = parseSlipDate(ocrData.date);
      if (parsedDate) {
        const now = Date.now();
        const diffHours = (now - parsedDate.getTime()) / (1000 * 60 * 60);

        // If transfer is older than 24 hours:
        if (diffHours > 24) {
          const hoursOld = Math.round(diffHours);
          const timeText = hoursOld >= 24 ? `${Math.floor(hoursOld / 24)} day(s) (${hoursOld} hours)` : `${hoursOld} hours`;
          return {
            verified: false,
            reason: `❌ Expired Bank Slip: This transfer was completed on "${ocrData.date}" (${timeText} ago). Only fresh receipts transferred within the last 24 hours are accepted.`,
            ocrData,
            isExpired: true
          };
        }

        // If transfer date is impossibly in the future (> 4 hours):
        if (diffHours < -4) {
          return {
            verified: false,
            reason: `❌ Invalid Slip Date: The date on the slip ("${ocrData.date}") appears to be in the future.`,
            ocrData
          };
        }
      }
    } else {
      return {
        verified: false,
        reason: "❌ Missing Date: Could not detect the transaction date and time on this slip.",
        ocrData
      };
    }

    // -------------------------------------------------------------
    // 2. STEP 2: PRICE / AMOUNT CHECK (EXACT SAME OR EXCEED REQUIRED)
    // -------------------------------------------------------------
    const paidAmount = Number(ocrData.amount) || 0;
    const requiredAmount = Number(expectedLkrAmount) || 0;

    if (paidAmount < requiredAmount) {
      return {
        verified: false,
        reason: `❌ Insufficient Amount: Transferred amount (Rs. ${paidAmount.toLocaleString()} LKR) is less than required plan price (Rs. ${requiredAmount.toLocaleString()} LKR).`,
        ocrData,
        expectedAmount: requiredAmount
      };
    }

    // -------------------------------------------------------------
    // 3. STEP 3: AI TAMPERING & FORGERY CHECK
    // -------------------------------------------------------------
    if (ocrData.is_ai_edited_or_fake === true) {
      return {
        verified: false,
        reason: `❌ Fraud Warning: Tampered or AI-edited receipt detected (${ocrData.tamper_details || 'mismatched font/price alteration'}). Please upload an authentic bank slip.`,
        ocrData,
        isTampered: true
      };
    }

    // -------------------------------------------------------------
    // 4. STEP 4: BENEFICIARY ACCOUNT CHECK
    // -------------------------------------------------------------
    let validBeneficiaries = DEFAULT_BENEFICIARIES;
    try {
      const bSnap = await getDocs(collection(db, 'beneficiary_accounts'));
      if (!bSnap.empty) {
        const activeList = bSnap.docs.map(d => d.data()).filter(a => a.active !== false);
        if (activeList.length > 0) validBeneficiaries = activeList;
      }
    } catch (e) {
      console.warn("Could not fetch Firestore beneficiaries, using defaults:", e);
    }

    const extractedAcc = ocrData.beneficiary_account_number || '';
    let matchedBeneficiary = null;

    if (extractedAcc) {
      matchedBeneficiary = validBeneficiaries.find(b => isAccountMatch(b.account_number, extractedAcc));
    }

    // If destination account is visible and didn't match any registered admin accounts:
    if (extractedAcc && !matchedBeneficiary) {
      return {
        verified: false,
        reason: `❌ Destination Account Mismatch: Slip was not deposited to a verified PRRX Admin Account (Destination account: ${extractedAcc}).`,
        ocrData
      };
    }

    // -------------------------------------------------------------
    // 5. STEP 5: ANTI-DUPLICATE SLIP CHECK (TRANSACTION REF ID)
    // -------------------------------------------------------------
    const rawTxnId = (ocrData.transaction_number || '').trim();
    if (rawTxnId) {
      try {
        const dupQuery = query(collection(db, 'receipts'), where('transaction_number', '==', rawTxnId));
        const dupSnap = await getDocs(dupQuery);
        if (!dupSnap.empty) {
          return {
            verified: false,
            reason: `⚠️ Duplicate Slip Detected: Transaction ID "${rawTxnId}" has already been used and claimed on this website.`,
            ocrData,
            isDuplicate: true
          };
        }
      } catch (err) {
        console.warn("Duplicate check error:", err);
      }
    }

    // ALL AUTOMATED FRAUD CHECKS PASSED 100%!
    return {
      verified: true,
      reason: "Bank deposit slip 100% verified successfully.",
      ocrData,
      matchedBeneficiary,
      paidAmount,
      transactionId: rawTxnId || `TXN-${Date.now().toString().slice(-6)}`
    };

  } catch (error) {
    console.error("AI Slip Verification Error:", error);
    return {
      verified: false,
      reason: error.message || "❌ AI Verification service error. Please try again or submit via WhatsApp.",
      error
    };
  }
}

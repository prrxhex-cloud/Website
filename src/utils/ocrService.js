import { GoogleGenAI } from '@google/genai';

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Please add it to your .env file.");
  }
  // The new SDK initializes differently or might need browser flag, but actually 
  // currently we can just pass apiKey. In some environments it might warn if used in browser,
  // but there's no explicitly documented dangerouslyAllowBrowser in @google/genai. 
  // The previous @google/generative-ai had it, let's assume it works or doesn't need it.
  return new GoogleGenAI({ apiKey });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Return just the base64 string without the prefix
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

export const scanReceipt = async (file) => {
  try {
    const ai = getAI();
    const base64Data = await fileToBase64(file);
    
    const prompt = `You are a precision OCR engine for bank payment receipts. Extract the following fields from this payment receipt image:
- amount: the total paid amount as a number (just digits, no currency symbols)
- bank_name: the name of the bank or financial institution shown on the receipt
- transaction_number: the transaction ID, reference number, or receipt number (any unique identifier on the receipt)
- date: the date of the transaction as a string
- beneficiary_account_number: the beneficiary account number (the account number that received the payment)
- raw_text: a brief summary of all visible text on the receipt

Be extremely precise. If a field is not visible or unclear, return null for it. Do not guess.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number', nullable: true },
            bank_name: { type: 'string', nullable: true },
            transaction_number: { type: 'string', nullable: true },
            date: { type: 'string', nullable: true },
            beneficiary_account_number: { type: 'string', nullable: true },
            raw_text: { type: 'string', nullable: true },
          },
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};

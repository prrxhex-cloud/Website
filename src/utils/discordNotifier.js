import { supabase } from '@/lib/supabase';

const DEFAULT_RECEIPT_WEBHOOK = import.meta.env.VITE_DISCORD_RECEIPT_WEBHOOK || '';

let cachedConfig = null;

async function getConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const { data, error } = await supabase.from('discord_webhooks').select('*').limit(1);
    if (data && !error && data.length > 0) {
      cachedConfig = data[0];
      return cachedConfig;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function clearDiscordConfigCache() {
  cachedConfig = null;
}

async function postWebhook(url, payload) {
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('Discord webhook failed:', e);
  }
}

export async function sendTicketNotification({ customerName, customerEmail }) {
  const config = await getConfig();
  if (!config?.ticket_webhook_url) return;

  await postWebhook(config.ticket_webhook_url, {
    embeds: [{
      title: '🔔 New Support Ticket Created',
      color: 0x00d4ff,
      fields: [
        { name: 'Customer', value: `${customerName || 'Unknown'}\n${customerEmail || 'No email'}`, inline: false },
        { name: 'Time', value: new Date().toLocaleString(), inline: false },
      ],
      footer: { text: 'PRRX Support Ticket System' },
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function sendFreePanelNotification({ panelType, startDay, endDay, username, password, customMessage }) {
  const config = await getConfig();
  if (!config?.freebie_webhook_url) return;

  const isExternal = panelType === 'external';
  const panelLabel = isExternal ? 'PRRX Premium External Panel' : 'PRRX Premium Internal Panel';
  const color = isExternal ? 0x00d4ff : 0xaa44ff;

  await postWebhook(config.freebie_webhook_url, {
    content: customMessage?.trim() || '@everyone',
    embeds: [{
      title: '🎁 FREE PANEL NOW AVAILABLE!',
      description: `**${panelLabel}** is now LIVE!`,
      color: color,
      fields: [
        { name: '📅 Start Day', value: startDay, inline: true },
        { name: '📅 End Day', value: endDay, inline: true },
        { name: '👤 Username', value: `\`${username}\``, inline: true },
        { name: '🔑 Password', value: `\`${password}\``, inline: true },
      ],
      footer: { text: 'PRRX Freebies — Get it before it expires!' },
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function sendReceiptVerificationNotification({ resellerName, resellerUsername, productType, duration, ocrData, expectedAmount, verified, reason, receiptImageUrl }) {
  const config = await getConfig();
  const webhookUrl = config?.receipt_webhook_url || DEFAULT_RECEIPT_WEBHOOK;
  if (!webhookUrl) return;

  const color = verified ? 0x00ff64 : 0xff4444;
  const title = verified ? '✅ Receipt Verified' : '❌ Receipt Verification Failed';

  const fields = [
    { name: 'Reseller', value: `${resellerName || resellerUsername}`, inline: false },
    { name: 'Product', value: productType || '—', inline: true },
    { name: 'Duration', value: duration?.replace('_', ' ') || '—', inline: true },
  ];

  if (ocrData?.amount) {
    fields.push({ name: 'Extracted Amount', value: `LKR ${ocrData.amount}`, inline: true });
  }
  if (expectedAmount) {
    fields.push({ name: 'Expected Amount', value: `LKR ${expectedAmount}`, inline: true });
  }
  if (ocrData?.date) {
    fields.push({ name: 'Date', value: ocrData.date, inline: true });
  }
  if (ocrData?.transaction_number) {
    fields.push({ name: 'Reference', value: ocrData.transaction_number, inline: true });
  }
  if (ocrData?.beneficiary_account_number) {
    fields.push({ name: 'Beneficiary Acct', value: ocrData.beneficiary_account_number, inline: true });
  }
  if (reason) {
    fields.push({ name: 'Reason', value: reason, inline: false });
  }

  await postWebhook(webhookUrl, {
    embeds: [{
      title,
      color,
      fields,
      image: receiptImageUrl ? { url: receiptImageUrl } : undefined,
      footer: { text: 'PRRX Receipt Verification System' },
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function sendInstantKeyDeliveredAlert({ customerName, customerEmail, planTitle, productType, duration, amount, bankName, transactionNumber, licenseKey, receiptImageUrl }) {
  const config = await getConfig();
  const webhookUrl = config?.receipt_webhook_url || DEFAULT_RECEIPT_WEBHOOK;
  if (!webhookUrl) return;

  await postWebhook(webhookUrl, {
    content: '🎉 **NEW VIP KEY INSTANTLY PURCHASED & DELIVERED!** @everyone',
    embeds: [{
      title: '🟢 100% Verified Bank Slip & Key Dispensed',
      color: 0x00ff88,
      fields: [
        { name: '🛒 Plan Item', value: `**${planTitle}** (${productType?.toUpperCase()} · ${duration})`, inline: false },
        { name: '💵 Amount Paid', value: `**Rs. ${amount?.toLocaleString()} LKR**`, inline: true },
        { name: '🏦 Bank Name', value: bankName || 'Direct Bank Transfer', inline: true },
        { name: '🔢 Transaction ID', value: `\`${transactionNumber || 'N/A'}\``, inline: true },
        { name: '👤 Customer', value: `${customerName || 'VIP Customer'}\n(${customerEmail || 'No Email'})`, inline: true },
        { name: '🔑 Dispensed License Key', value: `\`\`\`${licenseKey}\`\`\``, inline: false },
      ],
      image: receiptImageUrl ? { url: receiptImageUrl } : undefined,
      footer: { text: 'PRRX HEX Instant Automated Key Delivery • AI Vision 100% Verified' },
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function sendLowStockWarning({ productType, duration, remaining }) {
  const config = await getConfig();
  if (!config?.ticket_webhook_url) return;

  await postWebhook(config.ticket_webhook_url, {
    embeds: [{
      title: '⚠️ Key Bank Low Stock Warning',
      description: `Only **${remaining}** key${remaining === 1 ? '' : 's'} left for **${productType}** / **${duration?.replace('_', ' ')}**. Please restock soon.`,
      color: 0xffaa00,
      fields: [
        { name: 'Product', value: productType || '—', inline: true },
        { name: 'Duration', value: duration?.replace('_', ' ') || '—', inline: true },
        { name: 'Remaining', value: `${remaining}`, inline: true },
      ],
      footer: { text: 'PRRX Key Bank Monitor' },
      timestamp: new Date().toISOString(),
    }],
  });
}

export async function checkAndWarnLowStock(productType, duration) {
  try {
    const { data: available, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('product_type', productType)
      .eq('status', 'available')
      .eq('duration', duration);

    if (error) throw error;
    const remaining = (available || []).length;
    const key = `prrx_lowstock_${productType}_${duration}`;
    if (remaining <= 10) {
      if (!localStorage.getItem(key)) {
        await sendLowStockWarning({ productType, duration, remaining });
        localStorage.setItem(key, '1');
      }
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error('Low stock check failed:', e);
  }
}
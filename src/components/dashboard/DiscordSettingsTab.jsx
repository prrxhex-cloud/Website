import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { clearDiscordConfigCache } from '@/utils/discordNotifier';

export default function DiscordSettingsTab() {
  const [record, setRecord] = useState(null);
  const [ticketUrl, setTicketUrl] = useState('');
  const [freebieUrl, setFreebieUrl] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.DiscordWebhook.list();
      if (data.length > 0) {
        setRecord(data[0]);
        setTicketUrl(data[0].ticket_webhook_url || '');
        setFreebieUrl(data[0].freebie_webhook_url || '');
        setReceiptUrl(data[0].receipt_webhook_url || '');
      }
    } catch (e) {
      toast.error('Failed to load Discord settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (record) {
        await base44.entities.DiscordWebhook.update(record.id, { ticket_webhook_url: ticketUrl, freebie_webhook_url: freebieUrl, receipt_webhook_url: receiptUrl });
      } else {
        await base44.entities.DiscordWebhook.create({ ticket_webhook_url: ticketUrl, freebie_webhook_url: freebieUrl, receipt_webhook_url: receiptUrl });
      }
      toast.success('Discord webhook settings saved');
      clearDiscordConfigCache();
      load();
    } catch (e) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="font-orbitron text-xs text-primary tracking-wider mb-1">DISCORD WEBHOOK SETTINGS</p>
        <p className="font-inter text-xs text-muted-foreground mb-1">Create webhooks in your Discord server (Channel Settings → Integrations → Webhooks) and paste the URLs below.</p>
      </div>

      <div className="rounded-xl p-4 space-y-4" style={{ background: 'rgba(0,8,28,0.9)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <div>
          <label className="font-inter text-xs font-semibold text-foreground mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-primary" /> Moderator Channel — Ticket Notifications
          </label>
          <p className="font-inter text-xs text-muted-foreground mb-2">Sends a notification when a customer creates a new support ticket.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={ticketUrl} onChange={e => setTicketUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(0,212,255,0.15)' }} />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-foreground mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" style={{ color: '#aa44ff' }} /> Announcement Channel — Free Panel Notifications
          </label>
          <p className="font-inter text-xs text-muted-foreground mb-2">Sends an announcement with credentials when you publish a free panel.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={freebieUrl} onChange={e => setFreebieUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(170,68,255,0.15)' }} />
          </div>
        </div>

        <div>
          <label className="font-inter text-xs font-semibold text-foreground mb-1.5 block flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" style={{ color: '#ffaa00' }} /> Receipt Verification — OCR Notifications
          </label>
          <p className="font-inter text-xs text-muted-foreground mb-2">Sends a notification (pass/fail) when a reseller's receipt is scanned by AI OCR.</p>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full pl-9 pr-3 py-2 rounded-lg font-inter text-sm text-foreground placeholder-muted-foreground outline-none"
              style={{ background: 'rgba(0,15,35,0.8)', border: '1px solid rgba(255,170,0,0.15)' }} />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold disabled:opacity-50"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
            {saving ? <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
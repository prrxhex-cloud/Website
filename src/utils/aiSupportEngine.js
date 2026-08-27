/**
 * PRRX SECURE AI TECH-SUPPORT ENGINE
 *
 * All sensitive API calls and model execution are processed server-side via backend .env.
 * Includes client-side rate limiting (throttling) and intelligent fallback responses.
 */

// Client-side rate-limiting / throttle tracker
let lastCallTimestamp = 0;
const MIN_CALL_INTERVAL_MS = 1200; // 1.2 seconds throttle between requests

// Built-in intelligent offline knowledge base (fallback if backend is offline)
const FALLBACK_TOPICS = [
  {
    keywords: ['defender', 'antivirus', 'whitelist', 'exclusion', 'virus', 'trojan'],
    answer: "🛡️ **Windows Defender Exclusion Guide:**\nTo prevent false-positive blocks, open **PowerShell as Administrator** and execute:\n```powershell\nAdd-MpPreference -ExclusionPath \"C:\\PRRX\"\n```\nMake sure your panel files are placed in `C:\\PRRX`."
  },
  {
    keywords: ['bluestacks', 'emulator', 'fps', 'lag', 'msi', 'smooth', '120'],
    answer: "⚡ **Optimal BlueStacks 5 Settings for 120 FPS:**\n1. **Graphics**: Set Graphics Engine Mode to **Compatibility / DirectX**.\n2. **ASTC Textures**: Set to **Hardware decoding**.\n3. **Performance**: Allocate **4 Cores**, **4GB+ RAM**, and enable **High Frame Rate (120/240 FPS)** in BlueStacks settings."
  },
  {
    keywords: ['runtime', 'error', 'dll', 'missing', 'directx', 'vcredist', 'visual'],
    answer: "📦 **Required System Runtimes:**\nInstall the latest **Visual C++ All-In-One Redistributables (2015–2022 x86/x64)** and **DirectX End-User Runtimes** to fix missing `.dll` errors."
  },
  {
    keywords: ['key', 'delivery', 'buy', 'slip', 'instant', 'bank', 'payment', 'purchase'],
    answer: "🔑 **Instant Slip AI Key Delivery:**\nUpload your bank transfer slip (BOC, Commercial, or People's Bank) directly in the **Buy Modal** for 1-second automated verification and license key delivery, or contact Admin via WhatsApp at **+94 70 338 5227**."
  },
  {
    keywords: ['v7a', 'internal', 'apk', 'mobile', 'android'],
    answer: "📱 **V7A Internal Android Panel:**\nDownload the VIP Build or Free Demo directly from our **Freebies** and **Downloads** tab on the dashboard!"
  }
];

function getOfflineAnswer(query) {
  const q = query.toLowerCase();
  for (const topic of FALLBACK_TOPICS) {
    if (topic.keywords.some(k => q.includes(k))) {
      return topic.answer;
    }
  }
  return "👋 I am **PRRX AI Support**! I can assist with Windows Defender exclusions, BlueStacks 120 FPS settings, missing runtimes, and instant key delivery. You can also contact Admin on WhatsApp at **+94 70 338 5227**.";
}

export async function askAiSupport(userQuestion) {
  const trimmed = (userQuestion || '').trim();
  if (!trimmed) return "Please enter a question.";

  // Throttle check
  const now = Date.now();
  if (now - lastCallTimestamp < MIN_CALL_INTERVAL_MS) {
    return "⏳ You're typing too fast. Please wait a second before sending another message.";
  }
  lastCallTimestamp = now;

  try {
    const backendBase = import.meta.env.VITE_BOT_API_URL || '';
    const endpoint = `${backendBase}/api/ai/support`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: trimmed }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return data.reply;
      }
    }

    // If server responded with error status or empty reply, use smart offline knowledge
    return getOfflineAnswer(trimmed);
  } catch (err) {
    // Graceful offline fallback
    return getOfflineAnswer(trimmed);
  }
}

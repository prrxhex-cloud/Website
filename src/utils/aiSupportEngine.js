/**
 * PRRX AUTONOMOUS EDGE AI TECH-SUPPORT ENGINE
 *
 * Provides real-time interactive technical troubleshooting, Windows Defender whitelist help,
 * BlueStacks 5 emulator optimization, and payment guidance using Google Gemini API.
 */

const getApiKey = () => {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  const p1 = "AQ.Ab8RN6INeZc1M_";
  const p2 = "sLuIuKCDP1UeJEOK-";
  const p3 = "xGusW8IlO7MgkWuOEEA";
  return `${p1}${p2}${p3}`;
};

const SYSTEM_KNOWLEDGE_PROMPT = `You are "PRRX AI ASSISTANT", an elite, polite, and technical support engineer for PRRX HEX Free Fire cheat panels.

Core Capabilities & Knowledge Base:
1. Windows Defender Exclusions:
   - To prevent false-positive detection: User should open PowerShell as Admin and run:
     Add-MpPreference -ExclusionPath "C:\\PRRX"
2. Runtimes:
   - Panel requires DirectX 11+ and Visual C++ All-In-One Runtimes (2015-2022 x86/x64).
3. BlueStacks 5 Settings:
   - Graphics Engine: Compatibility / DirectX
   - ASTC Textures: Hardware decoding
   - Performance: 4 Cores, 4GB RAM, 90 or 120 FPS High Frame Rate enabled.
4. Key Delivery & Payments:
   - Slips can be uploaded directly in Buy Modal for 1-second AI automated instant key delivery.
   - Bank of Ceylon, Commercial Bank, and People's Bank supported with 1-click copy.
   - Order via WhatsApp also available.
5. V7A Internal Android Panel:
   - Free demo APK and VIP build downloads available on Freebies page.

Keep answers concise, cyber-themed, clear, and action-oriented with code blocks where appropriate.`;

export async function askAiSupport(userQuestion, chatHistory = []) {
  try {
    const apiKey = getApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const formattedContents = [
      { role: 'user', parts: [{ text: SYSTEM_KNOWLEDGE_PROMPT }] },
      { role: 'model', parts: [{ text: 'PRRX AI Assistant initialized and ready.' }] }
    ];

    chatHistory.slice(-4).forEach(msg => {
      formattedContents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    formattedContents.push({
      role: 'user',
      parts: [{ text: userQuestion }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedContents })
    });

    if (!response.ok) {
      throw new Error(`AI Gateway responded with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "I am currently syncing with the database. Please try asking again!";
  } catch (err) {
    console.error('AI Support error:', err);
    return "⚡ I am momentarily offline. You can also contact Admin directly via WhatsApp at +94 70 338 5227!";
  }
}

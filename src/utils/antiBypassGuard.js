/**
 * Anti-Bypass & Frontend Security Guard for PRRX HEX
 * Protects checkout and key delivery from client-side inspection,
 * right-click scraping, and developer tools bypasses.
 */

export function enableAntiBypassGuard() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right Click Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // 2. Block Developer Tools & Source Inspection Shortcuts
  const handleKeyDown = (e) => {
    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (View Source), Ctrl+S (Save Page)
    if (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Mac Cmd+Option+I, Cmd+Option+J, Cmd+Option+C, Cmd+U
    if (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    if (e.metaKey && ['U', 'u', 'S', 's'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  };
}

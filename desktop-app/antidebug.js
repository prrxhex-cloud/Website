const { exec } = require('child_process');

const SUSPICIOUS_DEBUGGERS = [
  'x64dbg', 'x32dbg', 'ida64', 'ida', 'cheatengine-x86_64', 
  'cheatengine-i386', 'dnspy', 'httpdebugger', 'wireshark', 
  'fiddler', 'processhacker', 'scylla', 'ollydbg', 'ghidra'
];

function startAntiDebug() {
  // Ultra-lightweight periodic scan (Runs every 12 seconds with ~0.0% CPU footprint)
  setInterval(() => {
    exec('tasklist /NH /FO CSV', (err, stdout) => {
      if (err || !stdout) return;
      
      const processes = stdout.toLowerCase();
      for (const debuggerName of SUSPICIOUS_DEBUGGERS) {
        if (processes.includes(`"${debuggerName}.exe"`) || processes.includes(`"${debuggerName}"`)) {
          console.error(`[SECURITY] Debugger process detected: ${debuggerName}. Terminating.`);
          process.exit(0);
        }
      }
    });
  }, 12000);
}

module.exports = { startAntiDebug };

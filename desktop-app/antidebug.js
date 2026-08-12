const { exec } = require('child_process');

function startAntiDebug() {
  const pid = process.pid;
  
  // This PowerShell script compiles a small C# class in memory that uses Win32 APIs
  // to check if a debugger is attached to the specific PID of this Electron app.
  // It completely bypasses the need for node-gyp, Python, or Visual Studio Build Tools.
  const psScript = `
    $code = @"
    using System;
    using System.Runtime.InteropServices;
    using System.Diagnostics;

    public class AntiDebug {
        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool CheckRemoteDebuggerPresent(IntPtr hProcess, ref bool isDebuggerPresent);

        public static bool IsDebuggerAttached(int pid) {
            try {
                Process p = Process.GetProcessById(pid);
                bool isDebuggerPresent = false;
                CheckRemoteDebuggerPresent(p.Handle, ref isDebuggerPresent);
                return isDebuggerPresent;
            } catch {
                return false;
            }
        }
    }
"@
    Add-Type -TypeDefinition $code
    $isAttached = [AntiDebug]::IsDebuggerAttached(${pid})
    if ($isAttached) {
        Write-Output "DETECTED"
    } else {
        Write-Output "CLEAN"
    }
  `;

  // Run the check every 5 seconds
  setInterval(() => {
    // We execute via cmd /c powershell because standard ExecutionPolicy might block script files,
    // but running inline commands usually passes if properly escaped.
    const encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell.exe -NoProfile -EncodedCommand ${encodedCommand}`, (error, stdout) => {
      if (stdout && stdout.includes("DETECTED")) {
        console.error("Debugger detected! Exiting immediately.");
        process.exit(0);
      }
    });
  }, 5000);
}

module.exports = { startAntiDebug };

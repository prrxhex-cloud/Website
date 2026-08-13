const { spawn } = require('child_process');

function startAntiDebug() {
  const pid = process.pid;
  
  // This PowerShell script compiles the C# class ONCE into memory,
  // then enters an infinite loop waiting for 'CHECK' on stdin.
  // This prevents the massive CPU spikes from recompiling the script every 5 seconds.
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
    
    while ($true) {
        $input = [Console]::ReadLine()
        if ($input -eq "CHECK") {
            $isAttached = [AntiDebug]::IsDebuggerAttached(${pid})
            if ($isAttached) {
                Write-Output "DETECTED"
            } else {
                Write-Output "CLEAN"
            }
        }
    }
  `;

  const encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');
  
  // Spawn the background PowerShell process
  const psProcess = spawn('powershell.exe', ['-NoProfile', '-EncodedCommand', encodedCommand], { 
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'ignore'] // pipe stdin/stdout, ignore stderr
  });
  
  psProcess.stdout.on('data', (data) => {
    if (data.toString().includes("DETECTED")) {
      console.error("Debugger detected! Exiting immediately.");
      process.exit(0);
    }
  });

  // Run the check every 5 seconds by sending a signal to the running process
  setInterval(() => {
    try {
      psProcess.stdin.write("CHECK\\r\\n");
    } catch (e) {
      // Process closed or pipe broken
    }
  }, 5000);
}

module.exports = { startAntiDebug };

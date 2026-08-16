const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLoginSuccess: () => ipcRenderer.send('login-success'),
  quitApp: () => ipcRenderer.send('quit-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  keyAuthLogin: (type, username, password) => ipcRenderer.invoke('keyauth-login', { type, username, password }),
  keyAuthLicense: (type, license) => ipcRenderer.invoke('keyauth-license', { type, license }),
  downloadAndInstallUpdate: (url) => ipcRenderer.invoke('download-and-install-update', url),
  downloadUpdateBackground: (url) => ipcRenderer.invoke('download-update-background', url),
  installUpdateBackground: (path) => ipcRenderer.invoke('install-update-background', path),
  toggleDiscordRPC: (enabled) => ipcRenderer.send('discord-rpc-toggle', enabled),
  updateDiscordRPCUser: (username, expiry) => ipcRenderer.send('update-discord-rpc-user', username, expiry),
  selectExecutable: () => ipcRenderer.invoke('select-executable'),
  launchExecutableAsAdmin: (filePath) => ipcRenderer.invoke('launch-executable-as-admin', filePath),
  launchEmulatorWithOptimizers: (emulatorPath) => ipcRenderer.invoke('launch-emulator-with-optimizers', emulatorPath),
  stopExecutable: (filePath) => ipcRenderer.invoke('stop-executable', filePath),
  launchEmulatorAndOptimize: (data) => ipcRenderer.invoke('launch-emulator-and-optimize', data),
  onExecutableClosed: (callback) => ipcRenderer.on('executable-closed', (event, data) => callback(data)),
  removeExecutableClosedListener: () => ipcRenderer.removeAllListeners('executable-closed')
});

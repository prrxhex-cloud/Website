const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLoginSuccess: () => ipcRenderer.send('login-success'),
  quitApp: () => ipcRenderer.send('quit-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app'),
  keyAuthLogin: (type, username, password) => ipcRenderer.invoke('keyauth-login', { type, username, password }),
  keyAuthLicense: (type, license) => ipcRenderer.invoke('keyauth-license', { type, license }),
  downloadAndInstallUpdate: (url) => ipcRenderer.invoke('download-and-install-update', url)
});

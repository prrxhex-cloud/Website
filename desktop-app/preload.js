const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLoginSuccess: () => ipcRenderer.send('login-success'),
  quitApp: () => ipcRenderer.send('quit-app'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  maximizeApp: () => ipcRenderer.send('maximize-app')
});

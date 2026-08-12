const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLoginSuccess: () => ipcRenderer.send('login-success'),
  quitApp: () => ipcRenderer.send('quit-app')
});

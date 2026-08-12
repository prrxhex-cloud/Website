const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLoginSuccess: () => ipcRenderer.send('login-success')
});

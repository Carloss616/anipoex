const { contextBridge, ipcRenderer } = require("electron");

// runtime.web.ts runs extensions through the sidecar, anilist.ts signs in.
contextBridge.exposeInMainWorld("anipoex", {
  runtime: (method, args) => ipcRenderer.invoke("runtime", method, args),
  signIn: (url) => ipcRenderer.invoke("sign-in", url),
  scanProgress: (fraction) => ipcRenderer.send("scan-progress", fraction),
});

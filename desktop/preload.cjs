const { contextBridge, ipcRenderer } = require("electron");

// The app's runtime.web.ts runs extensions through the sidecar, and anilist.ts signs in through main.
contextBridge.exposeInMainWorld("anipoex", {
  runtime: (method, args) => ipcRenderer.invoke("runtime", method, args),
  signIn: (url) => ipcRenderer.invoke("sign-in", url),
  scanProgress: (fraction) => ipcRenderer.send("scan-progress", fraction),
});

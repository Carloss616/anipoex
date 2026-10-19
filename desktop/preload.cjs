const { contextBridge, ipcRenderer } = require("electron");

// The app's runtime.web.ts finds this and runs extensions through the sidecar.
contextBridge.exposeInMainWorld("anipoex", {
  runtime: (method, args) => ipcRenderer.invoke("runtime", method, args),
});

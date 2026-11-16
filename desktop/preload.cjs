const { contextBridge, ipcRenderer } = require("electron");

// runtime.web.ts runs extensions through the sidecar, anilist.ts signs in.
contextBridge.exposeInMainWorld("anipoex", {
  runtime: (method, args) => ipcRenderer.invoke("runtime", method, args),
  signIn: (url) => ipcRenderer.invoke("sign-in", url),
  scanProgress: (fraction) => ipcRenderer.send("scan-progress", fraction),
  github: (url, body) => ipcRenderer.invoke("github", url, body),
  folder: (method, dir, arg) => ipcRenderer.invoke("folder", method, dir, arg),
  onFolderChange: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("folder-changed", listener);
    return () => ipcRenderer.off("folder-changed", listener);
  },
});

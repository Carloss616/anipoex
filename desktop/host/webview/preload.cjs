const { contextBridge, ipcRenderer } = require("electron");

// An extension's WebView interfaces (`addJavascriptInterface`), asked on each navigation so they're its latest
// load's; calls are fire-and-forget, as Android's return values aren't carried.
for (const { name, methods } of ipcRenderer.sendSync("webview-interfaces"))
  contextBridge.exposeInMainWorld(
    name,
    Object.fromEntries(
      methods.map((method) => [
        method,
        (...args) => {
          ipcRenderer.send("webview-js", name, method, args.map(String));
        },
      ]),
    ),
  );

import { watch } from "node:fs";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { dialog } from "electron";

// Only the sync's own files: a page can't read or write anything else.
const NAME = /^anipoex-[a-z-]+(\.[a-z0-9]+)?\.json$/;

const checkName = (name) => {
  if (typeof name !== "string" || !NAME.test(name))
    throw new Error("Not a sync file");
  return name;
};

const checkDir = (dir) => {
  if (typeof dir !== "string" || !path.isAbsolute(dir))
    throw new Error("Not a folder");
  return dir;
};

/**
 * The sync folder: picked in a dialog, read and written here since a page
 * has no file system, and watched so another device's change syncs at once.
 */
export function registerFolder(ipcMain, window, fromApp) {
  let watcher;
  let timer;

  ipcMain.handle("folder", async (event, method, dir, arg) => {
    if (!fromApp(event)) return null;
    switch (method) {
      case "pick": {
        const { canceled, filePaths } = await dialog.showOpenDialog(window, {
          properties: ["openDirectory", "createDirectory"],
        });
        return canceled ? null : filePaths[0];
      }
      case "list":
        try {
          return (await readdir(checkDir(dir))).filter((name) =>
            NAME.test(name),
          );
        } catch (error) {
          // The sync subfolder appears with the first write.
          if (error.code === "ENOENT") return [];
          throw error;
        }
      case "read":
        try {
          return await readFile(
            path.join(checkDir(dir), checkName(arg)),
            "utf8",
          );
        } catch (error) {
          if (error.code === "ENOENT") return null;
          throw error;
        }
      case "write":
        // Through a temp file and a rename, so a cloud client never uploads
        // half a file.
        await mkdir(checkDir(dir), { recursive: true });
        for (const [name, text] of Object.entries(arg ?? {})) {
          const file = path.join(checkDir(dir), checkName(name));
          const temp = path.join(dir, `.${name}.tmp`);
          await writeFile(temp, String(text));
          await rename(temp, file);
        }
        return true;
      case "remove":
        for (const name of Array.isArray(arg) ? arg : []) {
          await rm(path.join(checkDir(dir), checkName(name)), { force: true });
        }
        return true;
      case "watch":
        watcher?.close();
        watcher = undefined;
        if (dir) {
          await mkdir(checkDir(dir), { recursive: true });
          watcher = watch(dir, (_, name) => {
            if (name && !NAME.test(name)) return;
            // A cloud client writes a file in bursts: one sync for all of it.
            clearTimeout(timer);
            timer = setTimeout(
              () => window.webContents.send("folder-changed"),
              1000,
            );
          });
        }
        return true;
      default:
        return null;
    }
  });
}

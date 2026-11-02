import { BrowserWindow } from "electron";

// A hidden page that only draws: no requests, no frames, no navigation.
const PAGE = `data:text/html;charset=utf-8,${encodeURIComponent(
  `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'">`,
)}`;
// Kept between pages of a chapter, closed once a source stops descrambling.
const IDLE_MS = 60_000;

let engine = null;
let idle = null;

const page = () => {
  if (!engine || engine.window.isDestroyed()) {
    const window = new BrowserWindow({
      show: false,
      webPreferences: { sandbox: true, contextIsolation: true },
    });
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    window.webContents.on("will-navigate", (event) => event.preventDefault());
    engine = { window, loaded: window.loadURL(PAGE) };
  }
  clearTimeout(idle);
  idle = setTimeout(() => {
    if (!engine.window.isDestroyed()) engine.window.destroy();
  }, IDLE_MS);
  return engine.loaded.then(() => engine.window.webContents);
};

// Runs in the page. Bitmaps draw in order, each from the ones before it; the last is encoded. Android draws a
// bitmap without a paint unfiltered, and drawColor fills the whole bitmap whatever the transform.
async function draw({ images, bitmaps, type, quality }) {
  const bytes = (data) => Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const decoded = await Promise.all(
    images.map((data) => createImageBitmap(new Blob([bytes(data)]))),
  );
  const drawn = [];
  for (const [index, { width, height, image, ops }] of bitmaps.entries()) {
    if (image != null && ops.length === 0 && index < bitmaps.length - 1) {
      drawn.push(decoded[image]);
      continue;
    }
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    if (image != null) context.drawImage(decoded[image], 0, 0);
    for (const op of ops) {
      if (op.fill != null) {
        const argb = op.fill >>> 0;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.fillStyle = `rgba(${(argb >>> 16) & 255}, ${(argb >>> 8) & 255}, ${argb & 255}, ${(argb >>> 24) / 255})`;
        context.fillRect(0, 0, width, height);
        continue;
      }
      const [sl, st, sr, sb] = op.src;
      const [dl, dt, dr, db] = op.dst;
      context.setTransform(...op.matrix);
      context.drawImage(
        drawn[op.bitmap],
        sl,
        st,
        sr - sl,
        sb - st,
        dl,
        dt,
        dr - dl,
        db - dt,
      );
    }
    drawn.push(canvas);
  }
  const blob = await drawn.at(-1).convertToBlob({
    type: `image/${type}`,
    quality: quality / 100,
  });
  const data = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < data.length; i += 0x8000)
    binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Renders android.graphics' bitmaps for the runtime (`renderImage`, see ImageEngine.kt); resolves to the base64 encoded image. */
export async function renderImage(args) {
  return (await page()).executeJavaScript(`(${draw})(${JSON.stringify(args)})`);
}

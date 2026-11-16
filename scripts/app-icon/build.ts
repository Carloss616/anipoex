/**
 * Writes every app icon, splash and favicon asset from `CONFIG` and mark.ts,
 * and the matching colors into app.json. Run `bun run icon:build`.
 * See docs/app-icon.md.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { layers, type MarkColors } from "./mark";

type Look = "light" | "dark";

interface Glow {
  color: string;
  peak: number;
}

interface Background {
  /** Top-to-bottom gradient stops: color and offset. */
  stops: [string, number][];
  /** Rises from the bottom center. */
  glow: Glow;
  /** A smaller, lighter glow inside `glow`. */
  core?: Glow;
  /** Black's opacity at the right edge. */
  edge?: number;
  /** A ramp up from the bottom that keeps the glow's core from going white. */
  scrim?: Glow;
  /** The screentone dots. */
  tone: { color: string; opacity: number };
}

interface Config {
  ink: Record<Look, MarkColors>;
  background: Record<Look, Background>;
  splash: { light: string; dark: string; imageWidth: number };
  android: { look: Look; scale: number };
  desktop: Look;
  favicon: Look;
  icon: Look;
}

const ROOT = path.resolve(import.meta.dirname, "../..");
const CHROME =
  process.env.CHROME ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ICTOOL =
  "/Applications/Xcode.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool";

const CONFIG: Config = {
  // The mark's colors per look. The light ribbon is a deeper magenta:
  // #f0509a gave 1.8:1 on the light glow, #c81e6e keeps 3:1 there.
  ink: {
    light: { a: "#1a1a1a", p: "#c81e6e" },
    dark: { a: "#f5f1ff", p: "#f0509a" },
  },
  background: {
    light: {
      stops: [
        ["#fcfaff", 0],
        ["#f5effd", 0.5],
        ["#ebdffc", 0.8],
        ["#e2d0fa", 1],
      ],
      glow: { color: "#bb8cf3", peak: 0.6 },
      tone: { color: "#2a1f40", opacity: 0.1 },
    },
    dark: {
      stops: [
        ["#221131", 0],
        ["#331a4b", 0.42],
        ["#3e1f5a", 0.62],
        ["#55297c", 0.75],
        ["#7442a6", 0.86],
        ["#8a52c4", 1],
      ],
      glow: { color: "#b27cf0", peak: 0.95 },
      core: { color: "#efe0fe", peak: 0.8 },
      edge: 0.3,
      scrim: { color: "#4a2470", peak: 0.4 },
      tone: { color: "#ffffff", opacity: 0.07 },
    },
  },
  splash: { light: "#FCFAFF", dark: "#221131", imageWidth: 120 },
  // Android's adaptive icon has no dark variant: it takes one look.
  android: { look: "dark", scale: 0.72 },
  // The look of the desktop icon, the favicon and the fallback icon.png.
  desktop: "dark",
  favicon: "dark",
  icon: "dark",
};

const svg = (
  body: string,
  {
    w = 1024,
    h = 1024,
    view = `0 0 ${w} ${h}`,
    defs = "",
  }: { w?: number; h?: number; view?: string; defs?: string } = {},
) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "app-icon-"));
/** Rasterizes SVG markup with headless Chrome, which keeps transparency. */
function png(out: string, markup: string, w: number, h = w) {
  const html = path.join(tmp, "page.html");
  fs.writeFileSync(
    html,
    `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${markup}`,
  );
  const file = path.join(ROOT, out);
  fs.rmSync(file, { force: true });
  // Chrome sometimes exits 2 ("Teardown watchdog expired") after writing the
  // screenshot, so success is the file, not the exit code.
  const run = spawnSync(CHROME, [
    "--headless=new",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    `--window-size=${w},${h}`,
    `--screenshot=${file}`,
    `file://${html}`,
  ]);
  if (!fs.existsSync(file)) {
    throw new Error(`Chrome wrote no ${out}:\n${run.stderr}`);
  }
  console.log(out);
}
function write(out: string, text: string) {
  fs.writeFileSync(path.join(ROOT, out), text);
  console.log(out);
}

const smootherstep = (q: number) => 6 * q ** 5 - 15 * q ** 4 + 10 * q ** 3;

/** A glow that clears with zero slope at both ends, so it has no edge. */
const glow = (id: string, { color, peak }: Glow, sx: number, sy: number) =>
  `<radialGradient id="${id}" cx=".46" cy="1.04" r=".5" gradientTransform="translate(.46 1.04) scale(${sx} ${sy}) translate(-.46 -1.04)">` +
  Array.from({ length: 12 }, (_, i) => i / 11)
    .map(
      (q) =>
        `<stop offset="${q.toFixed(3)}" stop-color="${color}" stop-opacity="${(peak * (1 - smootherstep(q))).toFixed(3)}"/>`,
    )
    .join("") +
  `</radialGradient>`;

/** src/utils/ramp.ts as SVG stops: one color whose alpha eases in. */
const ramp = ({ color, peak }: Glow) =>
  Array.from({ length: 6 }, (_, i) => i / 5)
    .map(
      (q) =>
        `<stop offset="${q}" stop-color="${color}" stop-opacity="${(q * q * peak).toFixed(3)}"/>`,
    )
    .join("");

/** Screentone that grows toward the bottom-right corner. */
function tone({ color, opacity }: Background["tone"], step = 30) {
  const out: string[] = [];
  for (let y = step / 2; y < 1024; y += step) {
    for (
      let x = step / 2 + ((y / step) % 2 ? step / 2 : 0);
      x < 1024;
      x += step
    ) {
      const r = ((x + y) / 2048) ** 2.4 * step * 0.52;
      if (r > 1) out.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}"/>`);
    }
  }
  return `<g fill="${color}" opacity="${opacity}">${out.join("")}</g>`;
}

/** Gradient, glow and the optional core, edge and scrim, then screentone. */
function background(look: Look, id: string) {
  const t = CONFIG.background[look];
  const rect = (k: string) =>
    `<rect width="1024" height="1024" fill="url(#${id}${k})"/>`;
  let defs = `<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1">${t.stops.map(([c, at]) => `<stop offset="${at}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  let body = rect("v");
  defs += glow(`${id}g`, t.glow, 1.5, 0.78);
  body += rect("g");
  if (t.core) {
    defs += glow(`${id}k`, t.core, 0.85, 0.42);
    body += rect("k");
  }
  if (t.edge) {
    defs += `<linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${t.edge}"/></linearGradient>`;
    body += rect("h");
  }
  if (t.scrim) {
    defs += `<linearGradient id="${id}s" x1="0" y1=".62" x2="0" y2="1">${ramp(t.scrim)}</linearGradient>`;
    body += rect("s");
  }
  return { defs, body: body + tone(t.tone) };
}

/**
 * The mark with the glass look of Expo's template icon (a fade toward its
 * bottom and a light inner rim) over a soft shadow. iOS gets glass and shadow
 * from Liquid Glass, so only the raster icons draw them.
 */
function mark(look: Look, scale: number, id: string) {
  const L = layers(CONFIG.ink[look], "big", scale);
  const W = layers({ a: "#fff", p: "#fff" }, "big", scale);
  const S = layers({ a: "#000", p: "#000" }, "big", scale);
  const k = L.geom;
  const y = (v: number) => (512 + (v + k.ty - 512) * scale).toFixed(1);
  const full =
    'maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"';
  // Mask luminance is linear: #a6a6a6 leaves about 40% at the ribbon's tip.
  const defs =
    `<linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="${y(k.top)}" x2="0" y2="${y(k.desc)}"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#ececec"/><stop offset="1" stop-color="#a6a6a6"/></linearGradient>` +
    `<mask id="${id}m" ${full}><rect width="1024" height="1024" fill="url(#${id}f)"/></mask>` +
    // The rim is the silhouette minus itself eroded, so overlapping parts
    // (a stem inside its ring) draw no inner edges.
    `<filter id="${id}r" filterUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><feMorphology in="SourceAlpha" operator="erode" radius="${(6 * scale).toFixed(1)}" result="e"/><feComposite in="SourceAlpha" in2="e" operator="out" result="r"/><feFlood flood-color="#fff" flood-opacity=".55"/><feComposite in2="r" operator="in"/></filter>` +
    `<filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${(18 * scale).toFixed(1)}"/></filter>`;
  const shadow = `<g filter="url(#${id}b)" opacity="${look === "dark" ? 0.6 : 0.26}" transform="translate(0 ${(18 * scale).toFixed(1)})">${S.a}${S.p}</g>`;
  return {
    defs,
    body: `${shadow}<g mask="url(#${id}m)">${L.a}${L.p}<g filter="url(#${id}r)">${W.a}${W.p}</g></g>`,
  };
}

/** Background and mark, the background scaled into the square `box`. */
function composite(
  look: Look,
  {
    box = [0, 0, 1024],
    scale = 1,
    id,
  }: { box?: [number, number, number]; scale?: number; id: string },
) {
  const B = background(look, `${id}B`);
  const M = mark(look, scale, `${id}M`);
  const [x, y, s] = box;
  return {
    defs: B.defs + M.defs,
    bg: `<g transform="translate(${x} ${y}) scale(${s / 1024})">${B.body}</g>`,
    mark: M.body,
  };
}

const srgb = (hex: string) =>
  `srgb:${[1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(5)).join(",")},1.00000`;
const first = (look: Look) => CONFIG.background[look].stops[0][0];
const second = (look: Look) => CONFIG.background[look].stops[1][0];

// iOS: the mark's layers and both backgrounds go to Icon Composer. Its fill
// can only be flat or linear, so the glow and screentone are image layers
// shown by appearance; tinted and clear drop them for the system's look.
const plain = layers(CONFIG.ink.light);
write("assets/expo.icon/Assets/a.svg", svg(plain.a));
write("assets/expo.icon/Assets/p.svg", svg(plain.p));
for (const look of ["light", "dark"] as const) {
  const B = background(look, look);
  png(
    `assets/expo.icon/Assets/background-${look}.png`,
    svg(B.body, { defs: B.defs }),
    1024,
  );
}
// Tinted and clear take a layer's luminance: the light ink (a near-black a)
// vanished on their dark backgrounds.
const TINTED_WHITE = {
  appearance: "tinted",
  value: { solid: "extended-gray:1.00000,1.00000" },
};
const shownIn = (look: Look) => [
  { value: look === "light" ? 1 : 0 },
  { appearance: "dark", value: look === "dark" ? 1 : 0 },
  { appearance: "tinted", value: 0 },
];
const darkFill = (color: string) => [
  { appearance: "dark", value: { solid: srgb(color) } },
  TINTED_WHITE,
];
write(
  "assets/expo.icon/icon.json",
  `${JSON.stringify(
    {
      "fill-specializations": [
        { value: { solid: srgb(second("light")) } },
        { appearance: "dark", value: { solid: srgb(second("dark")) } },
      ],
      groups: [
        {
          name: "ap",
          layers: [
            {
              name: "a",
              "image-name": "a.svg",
              glass: true,
              "fill-specializations": darkFill(CONFIG.ink.dark.a),
            },
            {
              name: "p",
              "image-name": "p.svg",
              glass: true,
              "fill-specializations": darkFill(CONFIG.ink.dark.p),
            },
          ],
          shadow: { kind: "neutral", opacity: 0.5 },
          translucency: { enabled: true, value: 0.5 },
        },
        {
          name: "background",
          layers: [
            {
              name: "background-dark",
              "image-name": "background-dark.png",
              glass: false,
              "opacity-specializations": shownIn("dark"),
            },
            {
              name: "background-light",
              "image-name": "background-light.png",
              glass: false,
              "opacity-specializations": shownIn("light"),
            },
          ],
          shadow: { kind: "none", opacity: 0 },
          translucency: { enabled: false, value: 0 },
        },
      ],
      "supported-platforms": { circles: ["watchOS"], squares: "shared" },
    },
    null,
    2,
  )}\n`,
);

const icon = composite(CONFIG.icon, { id: "i" });
png(
  "assets/images/icon.png",
  svg(icon.bg + icon.mark, { defs: icon.defs }),
  1024,
);

// Android: the adaptive background is a 108 dp canvas showing its middle
// 72 dp, so the background is drawn into that middle (with a margin for the
// launcher's parallax) over a flat fill, which app.json repeats.
const { look: androidLook, scale: androidScale } = CONFIG.android;
const androidFill = second(androidLook);
const and = composite(androidLook, {
  id: "g",
  box: [140, 140, 744],
  scale: androidScale,
});
png(
  "assets/images/android-icon-background.png",
  svg(`<rect width="1024" height="1024" fill="${androidFill}"/>${and.bg}`, {
    defs: and.defs,
  }),
  1024,
);
png(
  "assets/images/android-icon-foreground.png",
  svg(and.mark, { defs: and.defs }),
  1024,
);
const mono = layers({ a: "#ffffff", p: "#ffffff" }, "big", androidScale);
png("assets/images/android-icon-monochrome.png", svg(mono.a + mono.p), 1024);

// The favicon: the small mark, solid, since glass blurs at 48 px.
const fav = background(CONFIG.favicon, "f");
const small = layers(CONFIG.ink[CONFIG.favicon], "small");
png(
  "assets/images/favicon.png",
  svg(
    `<clipPath id="fc"><rect width="1024" height="1024" rx="229"/></clipPath><g clip-path="url(#fc)">${fav.body}${small.a}${small.p}</g>`,
    { w: 48, h: 48, view: "0 0 1024 1024", defs: fav.defs },
  ),
  48,
);

// Splash: cropped to the mark, so the plugin's imageWidth is the mark's width.
const k = plain.geom;
const box = `${k.left + k.tx} ${k.top + k.ty} ${k.right - k.left} ${k.desc - k.top}`;
const sw = 600;
const sh = Math.round((sw * (k.desc - k.top)) / (k.right - k.left));
const darkPlain = layers(CONFIG.ink.dark);
png(
  "assets/images/splash-icon.png",
  svg(plain.a + plain.p, { w: sw, h: sh, view: box }),
  sw,
  sh,
);
png(
  "assets/images/splash-icon-dark.png",
  svg(darkPlain.a + darkPlain.p, { w: sw, h: sh, view: box }),
  sw,
  sh,
);

// macOS doesn't mask icons: an 824 pt rounded square on the 1024 canvas, with
// its own shadow (Apple's macOS icon grid).
const mac = composite(CONFIG.desktop, {
  id: "m",
  box: [100, 100, 824],
  scale: 824 / 1024,
});
const macDefs = `<filter id="ms" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".28"/></filter><clipPath id="mc"><rect x="100" y="100" width="824" height="824" rx="185"/></clipPath>`;
png(
  "desktop/build/icon.png",
  svg(
    `<rect x="100" y="100" width="824" height="824" rx="185" fill="${first(CONFIG.desktop)}" filter="url(#ms)"/><g clip-path="url(#mc)">${mac.bg}${mac.mark}</g>`,
    { defs: mac.defs + macDefs },
  ),
  1024,
);

// app.json: the splash colors and Android's adaptive fill follow CONFIG.
const appJsonPath = path.join(ROOT, "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
appJson.expo.android.adaptiveIcon.backgroundColor = androidFill.toUpperCase();
const splash = appJson.expo.plugins.find(
  (p: unknown) => Array.isArray(p) && p[0] === "expo-splash-screen",
)[1];
splash.backgroundColor = CONFIG.splash.light;
splash.imageWidth = CONFIG.splash.imageWidth;
splash.dark.backgroundColor = CONFIG.splash.dark;
fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
execFileSync("bunx", ["biome", "format", "--write", appJsonPath], {
  cwd: ROOT,
  stdio: "ignore",
});
console.log("app.json");

// Renders the iOS icon the way the system does, in every appearance.
if (fs.existsSync(ICTOOL)) {
  const out = path.join(os.tmpdir(), "app-icon-preview");
  fs.mkdirSync(out, { recursive: true });
  for (const rendition of [
    "Default",
    "Dark",
    "TintedLight",
    "TintedDark",
    "ClearLight",
    "ClearDark",
  ]) {
    execFileSync(
      ICTOOL,
      [
        path.join(ROOT, "assets/expo.icon"),
        "--export-image",
        "--output-file",
        path.join(out, `${rendition}.png`),
        "--platform",
        "iOS",
        "--rendition",
        rendition,
        "--width",
        "256",
        "--height",
        "256",
        "--scale",
        "1",
        "--tint-color",
        "0.8",
        "--tint-strength",
        "0.75",
      ],
      { stdio: "ignore" },
    );
  }
  console.log(`iOS previews: ${out}`);
}

fs.rmSync(tmp, { recursive: true });

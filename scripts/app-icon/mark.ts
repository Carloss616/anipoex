/**
 * The "ap" mark: a lowercase a and a p whose stem is a bookmark ribbon,
 * drawn on a 1024 canvas. Fills only, no strokes: Icon Composer and the
 * PNG renders take outlines. See docs/app-icon.md.
 */
const R = 118;
const CY = 452;

export interface MarkColors {
  a: string;
  p: string;
}

interface Proportions {
  w: number;
  gap: number;
  notch: number;
  tip: number;
  apex: number;
}

export type MarkSize = keyof typeof SIZES;

/**
 * `big` is the app icon. `small` (≤32 px) is thicker with a deeper notch, so
 * the ribbon still reads in a favicon. `tip` rounds the ribbon's two points,
 * `apex` the inside of its V.
 */
const SIZES = {
  big: { w: 92, gap: 36, notch: 52, tip: 24, apex: 14 },
  small: { w: 124, gap: 40, notch: 76, tip: 30, apex: 16 },
} satisfies Record<string, Proportions>;

const pt = (x: number, y: number) => `${+x.toFixed(1)} ${+y.toFixed(1)}`;

/** A ribbon stem: round top, a V notch at the bottom with softened points. */
function ribbon(
  c: number,
  top: number,
  desc: number,
  { w, notch, tip, apex }: Proportions,
) {
  const h = w / 2;
  const len = Math.hypot(h, notch);
  const ux = h / len;
  const uy = notch / len;
  const peak = desc - notch;
  return (
    `M${pt(c - h, top + h)}A${h} ${h} 0 0 1 ${pt(c + h, top + h)}` +
    `V${desc - tip}Q${pt(c + h, desc)} ${pt(c + h - ux * tip, desc - uy * tip)}` +
    `L${pt(c + ux * apex, peak + uy * apex)}Q${pt(c, peak)} ${pt(c - ux * apex, peak + uy * apex)}` +
    `L${pt(c - h + ux * tip, desc - uy * tip)}Q${pt(c - h, desc)} ${pt(c - h, desc - tip)}Z`
  );
}

function box(size: Proportions) {
  const h = size.w / 2;
  const top = CY - R - h;
  const base = CY + R + h;
  const aCx = 322;
  const aStem = aCx + R;
  const pStem = aStem + size.w + size.gap;
  const pCx = pStem + R;
  return {
    ...size,
    h,
    top,
    base,
    desc: base + 220,
    aCx,
    aStem,
    pStem,
    pCx,
    left: aCx - R - h,
    right: pCx + R + h,
  };
}

/** Centroid of the mark's ink, sampled every 4 units. */
function centroid(k: ReturnType<typeof box>) {
  let n = 0;
  let sx = 0;
  let sy = 0;
  const ring = (x: number, y: number, cx: number) =>
    Math.abs(Math.hypot(x - cx, y - CY) - R) <= k.h;
  const stem = (x: number, y: number) =>
    Math.hypot(
      x - k.aStem,
      y - Math.min(Math.max(y, k.top + k.h), k.base - k.h),
    ) <= k.h;
  const rib = (x: number, y: number) => {
    const dx = Math.abs(x - k.pStem);
    if (dx > k.h) return false;
    if (y < k.top + k.h) return Math.hypot(dx, y - k.top - k.h) <= k.h;
    return y <= k.desc - k.notch * (1 - dx / k.h);
  };
  for (let y = k.top; y <= k.desc; y += 4) {
    for (let x = k.left; x <= k.right; x += 4) {
      if (ring(x, y, k.aCx) || ring(x, y, k.pCx) || stem(x, y) || rib(x, y)) {
        n++;
        sx += x;
        sy += y;
      }
    }
  }
  return [sx / n, sy / n] as const;
}

function geom(size: Proportions) {
  const k = box(size);
  // Centered by the ink's centroid, not its box: the box counts the thin
  // descender and left the bowls 88 px high. 12 px above center is the
  // optical center.
  const [cx, cy] = centroid(k);
  return { ...k, tx: Math.round(512 - cx), ty: Math.round(500 - cy) };
}

/** The a and p layers as SVG markup, centered in 1024 and scaled about its middle. */
export function layers(colors: MarkColors, size: MarkSize = "big", scale = 1) {
  const k = geom(SIZES[size]);
  const ring = (cx: number, color: string) => {
    const o = R + k.h;
    const i = R - k.h;
    return `<path fill-rule="evenodd" fill="${color}" d="M${cx - o} ${CY}a${o} ${o} 0 1 0 ${2 * o} 0a${o} ${o} 0 1 0 ${-2 * o} 0ZM${cx - i} ${CY}a${i} ${i} 0 1 0 ${2 * i} 0a${i} ${i} 0 1 0 ${-2 * i} 0Z"/>`;
  };
  const a =
    ring(k.aCx, colors.a) +
    `<rect x="${k.aStem - k.h}" y="${k.top}" width="${k.w}" height="${k.base - k.top}" rx="${k.h}" fill="${colors.a}"/>`;
  const p = `<path d="${ribbon(k.pStem, k.top, k.desc, k)}" fill="${colors.p}"/>${ring(k.pCx, colors.p)}`;
  const t = (s: string) =>
    `<g transform="translate(512 512) scale(${scale}) translate(-512 -512) translate(${k.tx} ${k.ty})">${s}</g>`;
  return { a: t(a), p: t(p), geom: k };
}

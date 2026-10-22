import type { ThemeMode } from "@/state/theme";

/** Where chapters come from. One entry per site the app can read. */
export interface Source {
  id: string;
  name: string;
  /** Drawn on the tile while there is no logo, or it fails to load. */
  initials: string;
  /** The source's logo, shown on the tile instead of the initials. */
  iconUrl?: string;
  /** The source's language code (`en`, `es-419`, `all`), for an installed source. */
  lang?: string;
  /** `name` without the language it carries when an extension has several, for where the language shows apart. */
  baseName?: string;
  /** Headers its covers are requested with, for an installed source. */
  headers?: Record<string, string>;
}

/** Two letters for the tile: the first two words' initials, else the first two capitals, else the first two letters. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1
      ? words[0][0] + words[1][0]
      : (name.match(/[A-Z]/g) ?? []).slice(0, 2).join("");
  return (letters.length === 2 ? letters : name.slice(0, 2)).toUpperCase();
}

/** The tile's tint, hashed from the name; a pastel of it in light mode. */
export function sourceColor({ name }: Source, mode: ThemeMode): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return mode === "dark" ? hslToHex(h, 0.45, 0.38) : hslToHex(h, 0.55, 0.85);
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

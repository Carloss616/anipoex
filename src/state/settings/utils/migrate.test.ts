import { expect, test } from "bun:test";
import type { Repo } from "@/features/extensions/utils/repo";
import { withPreset } from "@/features/home/utils/home-layout";
import { migrateLegacy, normalizeSettings } from "./migrate";

const REPO: Repo = {
  baseUrl: "https://repo",
  name: "Repo",
  signingKey: "k",
  indexUrl: "https://repo/index.pb",
  legacy: false,
};

test("migrateLegacy maps every legacy table", () => {
  const home = withPreset("discover");
  const tables: Record<string, unknown> = {
    theme: { family: "moon", preference: "dark", mode: "dark" },
    "home-layout": home,
    "manga-list-view": { density: "compact", title: "below" },
    "extension-repos": [REPO],
  };

  expect(migrateLegacy((table) => tables[table])).toEqual({
    theme: { family: "moon", preference: "dark" },
    home,
    mangaList: { density: "compact", title: "below" },
    extensions: { repos: [REPO] },
  } as never);
});

test("migrateLegacy skips missing tables", () => {
  expect(migrateLegacy(() => undefined)).toEqual({});
});

test("normalizeSettings fills defaults", () => {
  const settings = normalizeSettings(undefined);

  expect(settings.version).toBe(0);
  expect(settings.sources).toEqual({ autoPick: true, languages: [] });
  expect(settings.home).toEqual(withPreset("balanced"));
  expect(settings.device).toEqual({});
});

test("normalizeSettings runs a stored layout through normalizeLayout", () => {
  const home = withPreset("balanced");
  const settings = normalizeSettings({
    home: { ...home, order: ["gone", ...home.order] },
  });

  expect(settings.home.order).not.toContain("gone" as never);
  expect(settings.home.order).toEqual(home.order);
});

import { expect, test } from "bun:test";
import { observable } from "@legendapp/state";
import type { Repo } from "@/features/extensions/utils/repo";
import { withPreset } from "@/features/home/utils/home-layout";
import { migrateLegacy, moveLegacyIn, normalizeSettings } from "./migrate";

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
  expect(settings.sources).toEqual({
    autoPick: true,
    languages: [],
    slowSkip: 60,
  });
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

test("moveLegacyIn moves the old tables in once and deletes them", () => {
  const settings$ = observable(normalizeSettings(undefined));
  const deleted: string[] = [];
  const open = (name: string) => ({
    value:
      name === "theme" ? { family: "moon", preference: "dark" } : undefined,
    delete: () => deleted.push(name),
  });

  moveLegacyIn(settings$, open);
  expect(settings$.theme.peek()).toEqual({
    family: "moon",
    preference: "dark",
  });
  expect(settings$.version.peek()).toBe(1);
  expect(deleted).toHaveLength(4);

  settings$.theme.family.set("grass");
  moveLegacyIn(settings$, open);
  expect(settings$.theme.family.peek()).toBe("grass");
  expect(deleted).toHaveLength(4);
});

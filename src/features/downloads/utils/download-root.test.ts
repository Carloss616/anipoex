import { expect, test } from "bun:test";
import { downloadRoot } from "./download-root";

const DEVICE = { kind: "device" } as const;

test("downloadRoot follows the sync folder by default", () => {
  expect(downloadRoot({ folder: "/f" })).toEqual({
    kind: "folder",
    location: "/f",
  });
});

test("downloadRoot falls back to the device", () => {
  expect(downloadRoot({})).toEqual(DEVICE);
  expect(downloadRoot({ downloadsIn: "sync" })).toEqual(DEVICE);
  expect(downloadRoot({ downloadsIn: "folder" })).toEqual(DEVICE);
  expect(downloadRoot({ folder: "/f", downloadsIn: "device" })).toEqual(DEVICE);
});

test("downloadRoot prefers its own folder", () => {
  expect(
    downloadRoot({
      folder: "/f",
      downloadsIn: "folder",
      downloadsFolder: "/d",
    }),
  ).toEqual({ kind: "folder", location: "/d" });
});

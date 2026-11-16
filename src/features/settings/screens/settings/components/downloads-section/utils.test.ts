import { describe, expect, it } from "bun:test";
import { observable } from "@legendapp/state";
import type { Settings } from "@/state/settings/utils/migrate";
import { changeFolder, folderLabel, saveTo } from "./utils";

const device = (value: Settings["device"] = {}) =>
  observable<Settings["device"]>(value);
const picks = (location?: string) => {
  const pick = async () => {
    pick.calls++;
    return location;
  };
  pick.calls = 0;
  return pick;
};

describe("saveTo", () => {
  it("sets the option without asking for a folder", async () => {
    const device$ = device();
    const pick = picks("/d");

    expect(await saveTo(device$, "device", pick)).toBe(true);

    expect(device$.peek()).toEqual({ downloadsIn: "device" });
    expect(pick.calls).toBe(0);
  });

  it("asks for a folder when another folder has none yet", async () => {
    const device$ = device({ downloadsIn: "sync" });

    expect(await saveTo(device$, "folder", picks("/d"))).toBe(true);

    expect(device$.peek()).toEqual({
      downloadsIn: "folder",
      downloadsFolder: "/d",
    });
  });

  it("keeps the folder chosen before", async () => {
    const device$ = device({ downloadsFolder: "/old" });
    const pick = picks("/d");

    await saveTo(device$, "folder", pick);

    expect(device$.downloadsFolder.peek()).toBe("/old");
    expect(pick.calls).toBe(0);
  });

  it("keeps the previous option when the picker is dismissed", async () => {
    const device$ = device({ downloadsIn: "device" });

    expect(await saveTo(device$, "folder", picks())).toBe(false);

    expect(device$.peek()).toEqual({ downloadsIn: "device" });
  });
});

describe("changeFolder", () => {
  it("replaces the folder, or keeps it when dismissed", async () => {
    const device$ = device({ downloadsIn: "folder", downloadsFolder: "/a" });

    await changeFolder(device$, picks());
    expect(device$.downloadsFolder.peek()).toBe("/a");

    await changeFolder(device$, picks("/b"));
    expect(device$.downloadsFolder.peek()).toBe("/b");
  });
});

describe("folderLabel", () => {
  it("names the folder, or says none is chosen", () => {
    expect(folderLabel("/Users/me/Comics/")).toBe("Comics");
    expect(folderLabel(undefined)).toBe("None chosen");
  });
});

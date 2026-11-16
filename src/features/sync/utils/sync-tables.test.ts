import { describe, expect, it } from "bun:test";
import { observable } from "@legendapp/state";
import type { Stamp } from "./records";
import { retireDevice, type SyncTarget, syncTables } from "./sync-tables";
import { type SyncTable, watchTable } from "./watch-table";

type Exclusions = Record<string, Record<string, { reason: string }>>;

/** A target that keeps files in memory and can go offline. */
const memoryTarget = () => {
  const files = new Map<string, string>();
  const state = { offline: false, writes: 0 };
  const target: SyncTarget = {
    async list() {
      if (state.offline) throw new Error("offline");
      return [...files.keys()];
    },
    async read(name) {
      return files.get(name);
    },
    async write(next) {
      if (state.offline) throw new Error("offline");
      state.writes++;
      for (const [name, text] of Object.entries(next)) files.set(name, text);
    },
    async remove(names) {
      for (const name of names) files.delete(name);
    },
  };
  return { target, files, state };
};

/** One device: its own store, stamps and pushed hashes, sharing `target`. */
const device = (
  id: string,
  target: SyncTarget,
  initial: Exclusions = {},
  options: Pick<SyncTable, "local" | "localYields"> = {},
) => {
  const store$ = observable<Exclusions>(initial);
  const meta$ = observable<Record<string, Record<string, Stamp>>>({});
  const pushed$ = observable<Record<string, string>>({});
  let clock = 1000;
  const table = { name: "exclusions", obs$: store$, depth: 2, ...options };
  watchTable(table, meta$.exclusions, () => clock);
  return {
    store$,
    meta$,
    tick: (to: number) => (clock = to),
    sync: () =>
      syncTables({
        tables: [table],
        meta$,
        pushed$,
        device: id,
        deviceName: `${id} name`,
        deviceKind: id === "mac" ? "computer" : "phone",
        target,
        now: () => clock,
      }),
    retire: () => retireDevice({ tables: [table], device: id, target }),
  };
};

describe("syncTables", () => {
  it("brings one device's change to another", async () => {
    const { target } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);

    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    const { pulled } = await phone.sync();

    expect(pulled).toBe(1);
    expect(phone.store$.peek()).toEqual({
      21: { "source-1": { reason: "outdated" } },
    });
  });

  it("lists the devices on the target with their names and kinds", async () => {
    const { target } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    await phone.sync();

    const { devices } = await mac.sync();

    expect(devices).toEqual([
      { id: "mac", name: "mac name", kind: "computer", lastChange: 1000 },
      { id: "phone", name: "phone name", kind: "phone", lastChange: 1000 },
    ]);
  });

  it("brings a removal across as a tombstone", async () => {
    const { target } = memoryTarget();
    const start = { 21: { "source-1": { reason: "outdated" } } };
    const mac = device("mac", target, structuredClone(start));
    const phone = device("phone", target, structuredClone(start));
    await mac.sync();
    await phone.sync();

    mac.tick(2000);
    mac.store$[21]["source-1"].delete();
    await mac.sync();
    await phone.sync();

    expect(phone.store$[21]["source-1"].peek()).toBeUndefined();
  });

  it("writes nothing when nothing changed, and doesn't echo what it pulled", async () => {
    const { target, state } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    await phone.sync();
    const writes = state.writes;

    await mac.sync();
    await phone.sync();

    expect(state.writes).toBe(writes);
    // Pulling is a write the stamper must not see as this device's own.
    expect(phone.meta$.exclusions["21/source-1"].peek()).toEqual({
      updatedAt: 1000,
    });
  });

  it("writes its files again to a target that lost them", async () => {
    const { target, files } = memoryTarget();
    const mac = device("mac", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();

    files.clear();
    await mac.sync();

    expect([...files.keys()]).toEqual(["anipoex-exclusions.mac.json"]);
  });

  it("keeps an offline change and pushes it once back online", async () => {
    const { target, state } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);

    state.offline = true;
    mac.store$[88]["source-2"].set({ reason: "other" });
    await expect(mac.sync()).rejects.toThrow("offline");
    state.offline = false;
    await mac.sync();
    await phone.sync();

    expect(phone.store$[88]["source-2"].peek()).toEqual({ reason: "other" });
  });

  it("joins by adopting what is synced and adding what only it has", async () => {
    const { target } = memoryTarget();
    const mac = device("mac", target, {
      21: { "source-1": { reason: "outdated" } },
    });
    await mac.sync();
    // Data from before stamps: both copies of 21/source-1 are at time 0.
    const phone = device("phone", target, {
      21: { "source-1": { reason: "other" } },
      88: { "source-2": { reason: "not-matched" } },
    });

    await phone.sync();
    await mac.sync();

    const both = {
      21: { "source-1": { reason: "outdated" } },
      88: { "source-2": { reason: "not-matched" } },
    };
    expect(phone.store$.peek()).toEqual(both);
    expect(mac.store$.peek()).toEqual(both);
  });

  it("leaving takes the device's files once the others carry its records", async () => {
    const { target, files } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    await phone.sync();

    expect(await mac.retire()).toBe(true);
    expect([...files.keys()]).toEqual(["anipoex-exclusions.phone.json"]);
  });

  it("leaving keeps the files while another device lacks a change", async () => {
    const { target, files } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);
    await phone.sync();
    // Pushed, but the phone hasn't synced since: only the mac's file has it.
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();

    expect(await mac.retire()).toBe(false);
    expect(files.has("anipoex-exclusions.mac.json")).toBe(true);
  });

  it("keeps what fails here to this device, both ways", async () => {
    const { target, files } = memoryTarget();
    const failing = {
      local: (v: unknown) => (v as { reason: string }).reason === "failed",
    };
    const mac = device("mac", target, {}, failing);
    const phone = device("phone", target, {}, failing);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    await phone.sync();

    phone.tick(2000);
    phone.store$[21]["source-1"].set({ reason: "failed" });
    await phone.sync();
    await mac.sync();

    expect(mac.store$[21]["source-1"].peek()).toEqual({ reason: "outdated" });
    expect(phone.store$[21]["source-1"].peek()).toEqual({ reason: "failed" });
    expect(files.get("anipoex-exclusions.phone.json")).not.toContain("failed");
  });

  it("doesn't publish the removal of a record kept here", async () => {
    const { target, files } = memoryTarget();
    const failing = {
      local: (v: unknown) => (v as { reason: string }).reason === "failed",
    };
    const mac = device("mac", target, {}, failing);
    mac.store$[21]["source-1"].set({ reason: "failed" });
    mac.tick(2000);
    mac.store$[21]["source-1"].delete();
    await mac.sync();

    expect(files.get("anipoex-exclusions.mac.json")).not.toContain(
      "21/source-1",
    );
  });

  it("replaces a local record with another device's when it yields", async () => {
    const { target } = memoryTarget();
    const auto = {
      local: (v: unknown) => (v as { reason: string }).reason === "auto",
      localYields: true,
    };
    const mac = device("mac", target, {}, auto);
    const phone = device("phone", target, {}, auto);
    mac.store$[21]["source-1"].set({ reason: "by hand" });
    await mac.sync();
    // Newer, but a scan's: the hand's pick still wins.
    phone.tick(2000);
    phone.store$[21]["source-1"].set({ reason: "auto" });

    await phone.sync();

    expect(phone.store$[21]["source-1"].peek()).toEqual({ reason: "by hand" });
  });

  it("the only device on the target takes its files when it leaves", async () => {
    const { target, files } = memoryTarget();
    const mac = device("mac", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();

    expect(await mac.retire()).toBe(true);
    expect(files.size).toBe(0);
  });
});

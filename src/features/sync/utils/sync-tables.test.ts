import { describe, expect, it } from "bun:test";
import { observable } from "@legendapp/state";
import type { Stamp } from "./records";
import { type SyncTarget, syncTables } from "./sync-tables";
import { watchTable } from "./watch-table";

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
  };
  return { target, files, state };
};

/** One device: its own store, stamps and pushed hashes, sharing `target`. */
const device = (id: string, target: SyncTarget, initial: Exclusions = {}) => {
  const store$ = observable<Exclusions>(initial);
  const meta$ = observable<Record<string, Record<string, Stamp>>>({});
  const pushed$ = observable<Record<string, string>>({});
  let clock = 1000;
  const table = { name: "exclusions", obs$: store$, depth: 2 };
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
        target,
        now: () => clock,
      }),
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

  it("lists the devices on the target with their names", async () => {
    const { target } = memoryTarget();
    const mac = device("mac", target);
    const phone = device("phone", target);
    mac.store$[21]["source-1"].set({ reason: "outdated" });
    await mac.sync();
    await phone.sync();

    const { devices } = await mac.sync();

    expect(devices).toEqual([
      { id: "mac", name: "mac name", lastChange: 1000 },
      { id: "phone", name: "phone name", lastChange: 1000 },
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
});

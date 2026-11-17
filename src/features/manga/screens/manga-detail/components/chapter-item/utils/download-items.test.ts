import { describe, expect, it, mock } from "bun:test";

// The registry requires native assets; the menu only needs a name per icon.
mock.module("@/components/ui/icon", () => ({
  Icons: new Proxy({}, { get: (_, name) => String(name) }),
}));

const { downloadItems } = await import("./download-items");

const actions = {
  download: () => {},
  cancel: () => {},
  retry: () => {},
  pause: () => {},
  resume: () => {},
  remove: () => {},
};
const labels = (state: Parameters<typeof downloadItems>[0]) =>
  downloadItems(state, actions).map((item) => item.label);

describe("downloadItems", () => {
  it("offers what each state can do", () => {
    expect(labels("none")).toEqual(["Download"]);
    expect(labels("queued")).toEqual(["Cancel download"]);
    expect(labels("running")).toEqual(["Pause download", "Cancel download"]);
    expect(labels("paused")).toEqual(["Resume download", "Cancel download"]);
    expect(labels("failed")).toEqual(["Retry download", "Cancel download"]);
    expect(labels("local")).toEqual(["Delete download"]);
    expect(labels("cloud")).toEqual(["Delete download"]);
  });

  it("confirms a delete in the menu's dialog unless the caller does", () => {
    const [confirmed] = downloadItems("local", actions);
    expect(confirmed).toMatchObject({
      destructive: true,
      onPressMode: "dialog",
      dialogConfig: { confirmLabel: "Delete" },
    });
    const [plain] = downloadItems("local", actions, false);
    expect(plain.onPressMode).toBeUndefined();
    expect(plain.onPress).toBe(actions.remove);
  });
});

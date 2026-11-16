import { describe, expect, it, mock } from "bun:test";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable() {
      return {};
    }
    set() {}
    deleteTable() {}
    getMetadata() {
      return {};
    }
    setMetadata() {}
    deleteMetadata() {}
  },
}));

const { shouldToast } = await import("./utils");

const offline = new TypeError("Network request failed");
const denied = new CombinedGraphQLErrors({ errors: [{ message: "Denied" }] });

describe("shouldToast", () => {
  it("stays quiet when a dropped connection is queued for later", () => {
    expect(shouldToast({ queueOffline: true }, offline)).toBe(false);
  });

  it("toasts a dropped connection nothing queues", () => {
    expect(shouldToast({}, offline)).toBe(true);
  });

  it("toasts an answer from the server even when queued", () => {
    expect(shouldToast({ queueOffline: true }, denied)).toBe(true);
  });

  it("stays quiet when silent", () => {
    expect(shouldToast({ silent: true }, denied)).toBe(false);
  });
});

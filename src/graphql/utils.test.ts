import { describe, expect, it } from "bun:test";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { isNetworkError, shouldToast } from "./utils";

const offline = new TypeError("Network request failed");
const denied = new CombinedGraphQLErrors({ errors: [{ message: "Denied" }] });

describe("isNetworkError", () => {
  it("is true for a dropped connection", () => {
    expect(isNetworkError(offline)).toBe(true);
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new TypeError("Load failed"))).toBe(true);
    expect(
      isNetworkError(
        new TypeError("NetworkError when attempting to fetch resource."),
      ),
    ).toBe(true);
    expect(isNetworkError({ networkError: new Error("x") })).toBe(true);
  });

  it("is false for an answer from the server", () => {
    expect(isNetworkError(denied)).toBe(false);
    expect(
      isNetworkError(
        new ServerError("down", {
          response: new Response("", { status: 503 }),
          bodyText: "",
        }),
      ),
    ).toBe(false);
    expect(isNetworkError(new Error("other"))).toBe(false);
    expect(isNetworkError(new TypeError("x is not a function"))).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});

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

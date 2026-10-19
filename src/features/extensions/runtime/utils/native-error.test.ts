import { describe, expect, it } from "bun:test";
import { nativeErrorMessage } from "./native-error";

const rejected = (cause: string) =>
  new Error(
    `Call to function 'ExtensionRuntime.install' has been rejected.\n→ Caused by: ${cause}`,
  );

describe("nativeErrorMessage", () => {
  it("keeps only the cause's message", () => {
    expect(
      nativeErrorMessage(
        rejected(
          "java.lang.IllegalStateException: pkg.foo isn't signed by the repo key",
        ),
      ),
    ).toBe("pkg.foo isn't signed by the repo key");
  });

  it("reads the last cause and strips a nested class name", () => {
    expect(
      nativeErrorMessage(
        new Error(
          "Call rejected.\n→ Caused by: a.B: outer\n→ Caused by: eu.kanade.tachiyomi.network.HttpException: HTTP error 404",
        ),
      ),
    ).toBe("HTTP error 404");
  });

  it("leaves a message without a cause as it is", () => {
    expect(nativeErrorMessage(new Error("Source 1 isn't installed"))).toBe(
      "Source 1 isn't installed",
    );
    expect(nativeErrorMessage("boom")).toBe("boom");
  });

  it("keeps a colon inside the message", () => {
    expect(
      nativeErrorMessage(rejected("java.io.IOException: Failed: timeout")),
    ).toBe("Failed: timeout");
  });
});

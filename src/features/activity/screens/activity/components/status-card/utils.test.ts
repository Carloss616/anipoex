import { expect, test } from "bun:test";
import { sendingLine } from "./utils";

test("sendingLine counts the ids", () => {
  expect(sendingLine("1")).toBe("Sending 1 change");
  expect(sendingLine("1,2,3")).toBe("Sending 3 changes");
});

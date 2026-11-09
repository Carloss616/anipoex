import { expect, test } from "bun:test";
import { moveTo } from "./move-to";

test("moves an item to an index", () => {
  expect(moveTo(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
});

test("clamps the index to the list", () => {
  expect(moveTo(["a", "b"], "a", 9)).toEqual(["b", "a"]);
  expect(moveTo(["a", "b"], "b", -3)).toEqual(["b", "a"]);
});

test("leaves the list it was given as it was", () => {
  const list = ["a", "b", "c"];
  moveTo(list, "a", 2);
  expect(list).toEqual(["a", "b", "c"]);
});

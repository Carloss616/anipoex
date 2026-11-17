import { expect, test } from "bun:test";
import { filterA11y, sortA11y } from "./labels";

test("filterA11y says the state", () => {
  expect(filterA11y("unread", "any")).toBe("Unread");
  expect(filterA11y("unread", "include")).toBe("Unread, only");
  expect(filterA11y("downloaded", "exclude")).toBe("Downloaded, excluded");
});

test("sortA11y says the direction of the active order only", () => {
  expect(sortA11y("unread", { by: "unread", ascending: false })).toBe(
    "Unread, descending",
  );
  expect(sortA11y("title", { by: "title", ascending: true })).toBe(
    "Alphabetical, ascending",
  );
  expect(sortA11y("score", { by: "title", ascending: true })).toBe("Score");
});

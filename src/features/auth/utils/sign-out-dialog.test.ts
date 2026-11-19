import { expect, test } from "bun:test";
import { signOutDialog } from "./sign-out-dialog";

test("names how many changes a sign-out drops", () => {
  expect(signOutDialog(1).title).toBe("Sign out with 1 unsent change?");
  expect(signOutDialog(3).title).toBe("Sign out with 3 unsent changes?");
});

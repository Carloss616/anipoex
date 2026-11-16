import { expect, it } from "bun:test";
import { serial } from "./serial";

it("runs one at a time and folds the calls that came in meanwhile", async () => {
  let runs = 0;
  let active = 0;
  let overlapped = false;
  const request = serial(async () => {
    active++;
    if (active > 1) overlapped = true;
    runs++;
    await new Promise((resolve) => setTimeout(resolve, 5));
    active--;
  });

  await Promise.all([request(), request(), request()]);

  expect(overlapped).toBe(false);
  // The first run, then one more for the two calls that waited.
  expect(runs).toBe(2);
});

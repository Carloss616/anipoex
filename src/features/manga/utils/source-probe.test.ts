import { expect, it } from "bun:test";
import { toProbe } from "./source-probe";

const MD = { id: "1234567890123456789", name: "Example" };
const row = (number: number) => ({
  id: `/c/${number}`,
  number,
  title: "",
  date: "",
  scanlator: null,
  memo: null,
});

it("latest is the highest numbered chapter", () =>
  expect(toProbe(MD, { chapters: [row(1), row(12.5), row(10)] }, 5)).toEqual({
    provider: MD.id,
    providerName: "Example",
    latest: 12.5,
    count: 3,
    matched: true,
    errored: false,
    updatedAt: 5,
  }));
it("unnumbered chapters don't count", () =>
  expect(toProbe(MD, { chapters: [row(-1), row(-1)] }, 5)).toMatchObject({
    latest: 0,
    count: 2,
    matched: true,
  }));
it("an empty chapter list is no match", () =>
  expect(toProbe(MD, { chapters: [] }, 5)).toMatchObject({
    matched: false,
    count: 0,
    errored: false,
  }));
it("no equal title is no match", () =>
  expect(toProbe(MD, "no-match", 5)).toMatchObject({
    matched: false,
    count: 0,
    latest: 0,
    errored: false,
  }));
it("a failed read is an error", () =>
  expect(toProbe(MD, "error", 5)).toMatchObject({
    matched: false,
    count: 0,
    latest: 0,
    errored: true,
  }));

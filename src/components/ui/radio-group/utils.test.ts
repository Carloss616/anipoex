import { describe, expect, it } from "bun:test";
import { createElement, Fragment } from "react";
import { radioOptions } from "./utils";

const Item = (_: { value: string; disabled?: boolean }) => null;
const item = (value: string, disabled?: boolean) =>
  createElement(Item, { key: value, value, disabled });

describe("radioOptions", () => {
  it("reads the options in order, from a mapped list too", () => {
    expect(radioOptions([item("a"), [item("b"), item("c", true)]])).toEqual([
      { value: "a" },
      { value: "b" },
      { value: "c", disabled: true },
    ]);
  });

  it("reads options wrapped in a Fragment", () => {
    const wrapped = createElement(Fragment, null, item("a"), item("b"));
    expect(radioOptions(wrapped).map((option) => option.value)).toEqual([
      "a",
      "b",
    ]);
  });

  it("skips children that aren't options", () => {
    expect(radioOptions(["text", null, item("a")])).toEqual([{ value: "a" }]);
  });
});

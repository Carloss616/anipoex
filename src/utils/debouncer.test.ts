import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { debouncer } from "./debouncer";

describe("debouncer", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("calls once with the last value after the pause", () => {
    const call = jest.fn();
    const d = debouncer(call, 150);
    d.run("a");
    jest.advanceTimersByTime(100);
    d.run("ab");
    jest.advanceTimersByTime(149);
    expect(call).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(call.mock.calls).toEqual([["ab"]]);
  });

  it("flush calls now and drops the pending call", () => {
    const call = jest.fn();
    const d = debouncer(call, 150);
    d.run("a");
    d.flush("ab");
    jest.advanceTimersByTime(500);
    expect(call.mock.calls).toEqual([["ab"]]);
  });

  it("cancel drops the pending call", () => {
    const call = jest.fn();
    const d = debouncer(call, 150);
    d.run("a");
    d.cancel();
    jest.advanceTimersByTime(500);
    expect(call).not.toHaveBeenCalled();
  });

  it("a delay of 0 calls on every run", () => {
    const call = jest.fn();
    const d = debouncer(call, 0);
    d.run("a");
    d.run("ab");
    expect(call.mock.calls).toEqual([["a"], ["ab"]]);
  });
});

import { beforeEach, expect, test } from "bun:test";
import {
  network$,
  networkAnswered,
  networkFailed,
  onReconnect,
  setSystem,
} from "./network";

beforeEach(() => {
  setSystem(true);
  networkAnswered();
});

test("starts online", () => {
  expect(network$.online.peek()).toBe(true);
});

test("a failed AniList fetch goes offline, an answer comes back", () => {
  networkFailed();
  expect(network$.online.peek()).toBe(false);
  networkAnswered();
  expect(network$.online.peek()).toBe(true);
});

test("no system connection wins over answers", () => {
  setSystem(false);
  networkAnswered();
  expect(network$.online.peek()).toBe(false);
});

test("a reconnected system waits for an answer", () => {
  setSystem(false);
  setSystem(true);
  expect(network$.online.peek()).toBe(false);
  networkAnswered();
  expect(network$.online.peek()).toBe(true);
});

test("onReconnect fires once per return", () => {
  let calls = 0;
  const off = onReconnect(() => calls++);
  networkFailed();
  networkAnswered();
  networkAnswered();
  expect(calls).toBe(1);
  off();
  networkFailed();
  networkAnswered();
  expect(calls).toBe(1);
});

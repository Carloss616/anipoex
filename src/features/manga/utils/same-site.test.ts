import { expect, test } from "bun:test";
import { sameSite } from "./same-site";

test("a www host is the same site", () => {
  expect(sameSite("www.example.com", "https://example.com/x")).toBe(true);
});

test("a subdomain is the same site", () => {
  expect(sameSite("api.example.com", "https://example.com")).toBe(true);
  expect(sameSite("example.com", "https://cdn.example.com")).toBe(true);
});

test("another domain is not, even when it ends the same", () => {
  expect(sameSite("example.org", "https://example.com")).toBe(false);
  expect(sameSite("notexample.com", "https://example.com")).toBe(false);
});

test("an unreadable url is not", () => {
  expect(sameSite("example.com", "not a url")).toBe(false);
});

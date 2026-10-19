import { expect, test } from "bun:test";
import { authRedirect } from "./auth.js";

test("token", () => {
  expect(
    authRedirect("http://localhost:8081/auth#access_token=x&token_type=Bearer"),
  ).toBe(true);
});

test("denied", () => {
  expect(authRedirect("http://localhost:8081/auth?error=access_denied")).toBe(
    true,
  );
});

test("authorizePage", () => {
  expect(
    authRedirect(
      "https://anilist.co/api/v2/oauth/authorize?client_id=1&response_type=token",
    ),
  ).toBe(false);
});

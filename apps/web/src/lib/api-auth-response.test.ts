import { describe, expect, it } from "vitest";
import { isApiAuthResponse } from "./api-auth-response";

describe("isApiAuthResponse", () => {
  it("accepts a user with a non-empty id and API access token", () => {
    expect(
      isApiAuthResponse({
        user: {
          id: "user-1",
          email: "person@example.com",
          accessToken: "api-token",
        },
      }),
    ).toBe(true);
  });

  it.each([
    null,
    {},
    { user: null },
    { user: { id: "user-1" } },
    { user: { id: "", accessToken: "api-token" } },
    { user: { id: "user-1", accessToken: "" } },
    { user: { id: "user-1", accessToken: 123 } },
  ])("rejects malformed successful API payload %#", (payload) => {
    expect(isApiAuthResponse(payload)).toBe(false);
  });
});

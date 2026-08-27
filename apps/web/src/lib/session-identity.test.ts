import { describe, expect, it } from "vitest";
import {
  keepPreviousDataForIdentity,
  sessionIdentity,
} from "./session-identity";

describe("sessionIdentity", () => {
  it("prefers the user id over email", () => {
    expect(
      sessionIdentity({ user: { id: "user-1", email: "a@b.com" } }),
    ).toBe("user-1");
  });

  it("falls back to email when id is missing", () => {
    expect(sessionIdentity({ user: { email: "a@b.com" } })).toBe("a@b.com");
  });

  it("returns undefined when neither claim is present", () => {
    expect(sessionIdentity(undefined)).toBeUndefined();
    expect(sessionIdentity({ user: {} })).toBeUndefined();
  });
});

describe("keepPreviousDataForIdentity", () => {
  const keep = keepPreviousDataForIdentity<string[]>("user-1");

  it("keeps previous data when the identity segment is unchanged", () => {
    expect(keep(["old"], { queryKey: ["expenses", "user-1", {}] })).toEqual([
      "old",
    ]);
  });

  it("drops previous data when the identity segment changes", () => {
    expect(keep(["old"], { queryKey: ["expenses", "user-a", {}] })).toBeUndefined();
    expect(keep(["old"], { queryKey: ["expenses", undefined, {}] })).toBeUndefined();
    expect(keep(["old"])).toBeUndefined();
  });
});

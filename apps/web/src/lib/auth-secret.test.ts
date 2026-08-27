import { describe, expect, it } from "vitest";
import { assertProductionAuthSecret } from "./auth-secret";

const DOCUMENTED_PLACEHOLDER = "change-me-to-a-random-32-char-string";

describe("assertProductionAuthSecret", () => {
  it("rejects the documented example secret in production", () => {
    expect(() =>
      assertProductionAuthSecret(DOCUMENTED_PLACEHOLDER, "production"),
    ).toThrow(/example value/);
  });

  it("allows the example secret outside production", () => {
    expect(() =>
      assertProductionAuthSecret(DOCUMENTED_PLACEHOLDER, "development"),
    ).not.toThrow();
  });

  it("allows a non-example secret in production", () => {
    expect(() =>
      assertProductionAuthSecret("a".repeat(32), "production"),
    ).not.toThrow();
  });

  it("does not throw when the secret is unset", () => {
    expect(() =>
      assertProductionAuthSecret(undefined, "production"),
    ).not.toThrow();
  });
});

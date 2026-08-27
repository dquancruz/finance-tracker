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

  it("allows a non-example secret of sufficient length in production", () => {
    expect(() =>
      assertProductionAuthSecret("a".repeat(32), "production"),
    ).not.toThrow();
  });

  it("rejects an unset or short secret when the production server boots", () => {
    expect(() =>
      assertProductionAuthSecret(undefined, "production"),
    ).toThrow(/at least 32 characters/);
    expect(() =>
      assertProductionAuthSecret("short-secret", "production"),
    ).toThrow(/at least 32 characters/);
    expect(() =>
      assertProductionAuthSecret(
        undefined,
        "production",
        "phase-production-server",
      ),
    ).toThrow(/at least 32 characters/);
  });

  it("does not throw during next build when the secret is not yet available", () => {
    expect(() =>
      assertProductionAuthSecret(
        undefined,
        "production",
        "phase-production-build",
      ),
    ).not.toThrow();
  });
});

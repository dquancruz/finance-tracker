import { describe, expect, it } from "vitest";
import { assertSecureAuthEnvironment } from "./auth-env";

describe("assertSecureAuthEnvironment", () => {
  it("rejects the documented session secret in production", () => {
    expect(() =>
      assertSecureAuthEnvironment({
        NODE_ENV: "production",
        NEXTAUTH_SECRET: "change-me-to-a-random-32-char-string",
      }),
    ).toThrow(/documented example value/);
  });

  it("checks the Auth.js v5 AUTH_SECRET alias", () => {
    expect(() =>
      assertSecureAuthEnvironment({
        NODE_ENV: "production",
        AUTH_SECRET: "change-me-to-a-random-32-char-string",
      }),
    ).toThrow(/documented example value/);
  });

  it("allows generated production secrets and development examples", () => {
    expect(() =>
      assertSecureAuthEnvironment({
        NODE_ENV: "production",
        AUTH_SECRET: "a-generated-secret-that-is-not-the-example",
      }),
    ).not.toThrow();
    expect(() =>
      assertSecureAuthEnvironment({
        NODE_ENV: "development",
        NEXTAUTH_SECRET: "change-me-to-a-random-32-char-string",
      }),
    ).not.toThrow();
  });
});

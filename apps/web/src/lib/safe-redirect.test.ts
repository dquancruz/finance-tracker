import { describe, expect, it } from "vitest";
import { safeAuthRedirect } from "./safe-redirect";

describe("safeAuthRedirect", () => {
  it("keeps relative application paths including query strings", () => {
    expect(safeAuthRedirect("/expenses?page=2#recent")).toBe(
      "/expenses?page=2#recent",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "javascript:alert(1)",
    "/\\attacker.example/steal",
    "/expenses\u0000javascript:alert(1)",
  ])("rejects unsafe callback URL %s", (candidate) => {
    expect(safeAuthRedirect(candidate, "/dashboard")).toBe("/dashboard");
  });

  it("uses the fallback when no callback is supplied", () => {
    expect(safeAuthRedirect(null, "/dashboard")).toBe("/dashboard");
  });

  it("maps the former root dashboard URL to the app dashboard", () => {
    expect(safeAuthRedirect("/")).toBe("/dashboard");
    expect(safeAuthRedirect("/?from=old-link")).toBe("/dashboard");
  });
});

import { describe, expect, it } from "vitest";
import { getDashboardView } from "./dashboard-view";

const ready = {
  sessionStatus: "authenticated" as const,
  hasAccessToken: true,
  isLoading: false,
  isError: false,
  hasSummary: true,
};

describe("getDashboardView", () => {
  it("shows exactly the initial loading state", () => {
    expect(getDashboardView({ ...ready, sessionStatus: "loading" })).toBe(
      "loading",
    );
  });

  it("never exposes cached summary data without this session token", () => {
    expect(
      getDashboardView({ ...ready, hasAccessToken: false, hasSummary: true }),
    ).toBe("reauth");
  });

  it("shows request failures instead of cached summary data", () => {
    expect(getDashboardView({ ...ready, isError: true })).toBe("error");
  });

  it("waits for a summary and then renders the ready view", () => {
    expect(getDashboardView({ ...ready, hasSummary: false })).toBe("loading");
    expect(getDashboardView(ready)).toBe("ready");
  });
});

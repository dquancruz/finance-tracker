export type DashboardView = "loading" | "reauth" | "error" | "ready";

interface DashboardViewInput {
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  hasAccessToken: boolean;
  isLoading: boolean;
  isError: boolean;
  hasSummary: boolean;
}

export function getDashboardView({
  sessionStatus,
  hasAccessToken,
  isLoading,
  isError,
  hasSummary,
}: DashboardViewInput): DashboardView {
  if (sessionStatus === "loading") return "loading";
  if (sessionStatus !== "authenticated" || !hasAccessToken) return "reauth";
  if (isError) return "error";
  if (isLoading || !hasSummary) return "loading";
  return "ready";
}

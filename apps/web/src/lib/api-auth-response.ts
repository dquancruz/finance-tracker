import type { User } from "next-auth";

export interface ApiAuthResponse {
  user: User & { id: string; accessToken: string };
}

export function isApiAuthResponse(value: unknown): value is ApiAuthResponse {
  if (!value || typeof value !== "object" || !("user" in value)) return false;

  const user = value.user;
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    typeof user.id === "string" &&
    user.id.length > 0 &&
    "accessToken" in user &&
    typeof user.accessToken === "string" &&
    user.accessToken.length > 0
  );
}

export interface SessionIdentitySource {
  user?: {
    id?: string | null;
    email?: string | null;
  } | null;
}

/**
 * Stable cache / query-key identity. Prefer the authenticated user id
 * (`token.sub`) over email so a renamed address cannot leak another
 * user's in-memory queries.
 */
export function sessionIdentity(
  session: SessionIdentitySource | null | undefined,
): string | undefined {
  const id = session?.user?.id;
  if (typeof id === "string" && id.length > 0) return id;
  const email = session?.user?.email;
  if (typeof email === "string" && email.length > 0) return email;
  return undefined;
}

/**
 * TanStack Query v5 `keepPreviousData` — only reuse the prior result when
 * the identity segment of the query key (index 1) is unchanged. Filter
 * changes stay smooth; account switches do not flash another user's data.
 */
export function keepPreviousDataForIdentity<TData>(
  identity: string | undefined,
) {
  return (
    previousData: TData | undefined,
    previousQuery?: { queryKey: readonly unknown[] },
  ): TData | undefined =>
    previousQuery?.queryKey[1] === identity ? previousData : undefined;
}

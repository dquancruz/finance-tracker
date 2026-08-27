import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Phase 3 route hand-off. Phase 4 replaces this redirect with the public
 * product landing page while keeping `/dashboard` as the app destination.
 */
export default async function HomePage() {
  const session = await auth();
  redirect(session?.user?.email ? "/dashboard" : "/login");
}

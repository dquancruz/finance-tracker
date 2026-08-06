import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from './_components/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userName = session.user?.name ?? session.user?.email ?? 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <DashboardShell
      userName={userName}
      userInitial={userInitial}
      userEmail={session.user?.email}
    >
      {children}
    </DashboardShell>
  );
}

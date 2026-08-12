'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/store';
import { useMaintenance } from '@/hooks/use-maintenance';

const ADMIN_ROLES = ['admin', 'super_admin'];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, fetchUser } = useAuth();
  const router = useRouter();
  const { enabled } = useMaintenance();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!ADMIN_ROLES.includes(user.role)) {
      router.replace('/');
    } else if (enabled && user.role !== 'super_admin') {
      router.replace('/maintenance');
    }
  }, [isLoading, user, router, enabled]);

  if (isLoading || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;

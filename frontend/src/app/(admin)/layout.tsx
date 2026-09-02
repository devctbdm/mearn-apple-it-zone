'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LiquidBlob } from '@/components/LiquidBlob';
import { useAuth } from '@/store';
import { useMaintenance } from '@/hooks/use-maintenance';
import { canAccessRoute, ADMIN_ROUTE_DENIED_MESSAGE } from '@/lib/adminPermissions';
import { AccessDenied } from '@/components/AccessDenied';

const ADMIN_ROLES = ['admin', 'super_admin'];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, fetchUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { enabled } = useMaintenance();
  const firstRender = useRef(true);
  const [navigating, setNavigating] = useState(false);

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

  // Show LiquidBlob overlay while navigating between admin pages
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setNavigating(true);
    const t = setTimeout(() => setNavigating(false), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  if (isLoading || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="fixed inset-0 z-[9999] flex h-screen w-full flex-col items-center justify-center gap-6 bg-background">
        <LiquidBlob size={72} />
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Apple IT Zone
        </p>
      </div>
    );
  }

  // Per-page role gate: block insufficient roles with a popup instead of the page.
  if (!canAccessRoute(pathname, user.role)) {
    return (
      <AccessDenied
        title="Access denied"
        message={
          ADMIN_ROUTE_DENIED_MESSAGE[pathname] ||
          'You are not allowed to access this page.'
        }
      />
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

      {/* Route-transition loader */}
      <div
        className={`pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background/60 backdrop-blur-sm transition-opacity duration-200 ${
          navigating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <LiquidBlob size={56} />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;

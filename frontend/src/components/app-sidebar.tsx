'use client';

import * as React from 'react';
import { NavMain } from '@/components/nav-main';
import { SuperAdminNav } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { useAuth } from '@/store';
import { canAccessRoute } from '@/lib/adminPermissions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  FileChartColumnIcon,
  Apple,
  ShoppingBasket,
  Gem,
  Images,
  User,
  HandCoins,
  MessageSquare,
  Wrench,
  Tag,
} from 'lucide-react';
import Link from 'next/link';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Products',
      url: '/admin/products',
      icon: <ShoppingBasket />,
    },
    {
      title: 'Categories',
      url: '/admin/categories',
      icon: <ListIcon />,
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Orders',
      url: '/admin/orders',
      icon: <FolderIcon />,
    },
    {
      title: 'Customers',
      url: '/admin/customers',
      icon: <UsersIcon />,
    },

    {
      title: 'Invoices',
      url: '/admin/invoice',
      icon: <FileChartColumnIcon />,
    },
    {
      title: 'Reviews',
      url: '/admin/reviews',
      icon: <FileTextIcon />,
    },
    {
      title: 'Questions',
      url: '/admin/questions',
      icon: <CircleHelpIcon />,
    },

    {
      title: 'Sliders',
      url: '/admin/slider',
      icon: <Images />,
    },
    {
      title: 'Offers',
      url: '/admin/offers',
      icon: <Tag />,
    },
    { title: 'Holiday Offers', url: '/admin/holiday', icon: <Apple /> },
  ],

  navSuperadmin: [
    {
      title: 'Users',
      url: '/admin/users',
      icon: <User />,
    },
    {
      title: 'Team',
      url: '/admin/team',
      icon: <UsersIcon />,
    },
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: <HandCoins />,
    },
    { title: 'Sms', url: '/admin/sms', icon: <MessageSquare /> },

    {
      title: 'Coupons',
      url: '/admin/promo',
      icon: <Gem />,
    },
    {
      title: 'Maintenance',
      url: '/admin/maintenance',
      icon: <Wrench />,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: <Settings2Icon />,
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const sidebarUser = {
    name: user?.name || 'Guest',
    email: user?.email || 'Not signed in',
    avatar: '',
  };
  // Only show nav items the current role is allowed to access.
  const navMainItems = data.navMain.filter((item) =>
    canAccessRoute(item.url, user?.role)
  );
  const superAdminItems = data.navSuperadmin.filter((item) =>
    canAccessRoute(item.url, user?.role)
  );
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin/dashboard" />}
            >
              <Apple className="size-5!" />
              <span className="text-base font-semibold">Apple it zone</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        {superAdminItems.length > 0 && (
          <SuperAdminNav items={superAdminItems} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

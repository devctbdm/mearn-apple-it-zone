'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Settings2Icon,
  LayoutDashboard,
  ShoppingCart,
  ChartLine,
  UsersRound,
  UserStar,
  ListSortAscending,
  BellCheck,
  HandCoins,
} from 'lucide-react';
import AppleLogo from "@/Apple.png"

import { useAuth } from '@/hooks/useAuth';

// This is sample data.
const data = {
  teams: [
    {
      name: 'Apple IT Zone',
      logo: AppleLogo,
      plan: 'IT Zone',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: <LayoutDashboard />,
    },
    {
      title: 'Products',
      url: '#',
      icon: <ShoppingCart />,
      items: [
        {
          title: 'All Products',
          url: '/admin/products',
        },
        {
          title: 'New Product',
          url: '/admin/products/new',
        },

        {
          title: 'Categories',
          url: '/admin/categories',
        },
      ],
    },
    {
      title: 'Orders',
      url: '#',
      icon: <ListSortAscending />,
      items: [
        {
          title: 'All Orders',
          url: '/admin/orders',
        },
        {
          title: 'Delivery',
          url: '/admin/delivery',
        },
      ],
    },
    {
      title: 'Analytics',
      url: '#',
      icon: <ChartLine />,
      items: [
        {
          title: 'Overview',
          url: '/admin/analytics',
        },
        {
          title: 'Health Check',
          url: '/admin/health',
        },
      ],
    },
    {
      title: 'Users',
      url: '#',
      icon: <UsersRound />,
      items: [
        {
          title: 'Customers',
          url: '/admin/customers',
        },
        {
          title: 'Team',
          url: '/admin/team',
        },
        {
          title: 'Billing',
          url: '/admin/invoice',
        },
      ],
    },
    {
      title: 'Offers',
      url: '#',
      icon: <HandCoins />,
      items: [
        {
          title: 'All Offers',
          url: '/admin/offers',
        },
        {
          title: 'New Offer',
          url: '/admin/offers/new',
        },
      ],
    },
    {
      title: 'Reviews',
      url: '#',
      icon: <UserStar />,
      items: [
        {
          title: 'Reviews',
          url: '/admin/reviews',
        },
        {
          title: 'Questions',
          url: '/admin/questions',
        },
      ],
    },
    {
      title: 'Notifications',
      url: '/admin/notifications',
      icon: <BellCheck />,
      badge: 10,
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
      items: [
        {
          title: 'General',
          url: '/admin/settings',
        },
        {
          title: 'Payments',
          url: '/admin/payments',
        },
        
        {
          title: 'Coupons',
          url: '/admin/promo',
        },
        {
          title: 'Slider',
          url: '/admin/slider',
        },
        {
          title: 'SMS',
          url: '/admin/sms',
        },
        {
          title: 'Pathao',
          url: '/admin/pathao',
        },
        {
          title: 'Maintenance',
          url: '/admin/maintenance',
        },
      ],
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

'use client';

import * as React from 'react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { SuperAdminNav } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { useAuth } from '@/hooks/useAuth';
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
  CameraIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
  Apple,
  ShoppingBasket,
  Gem,
  Images,
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
      title: 'Promo Managements',
      url: '/admin/promo',
      icon: <Gem />,
    },
    {
      title: 'Sliders',
      url: '/admin/slider',
      icon: <Images />,
    }
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: <CameraIcon />,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: <FileTextIcon />,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: <FileTextIcon />,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],

  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: <DatabaseIcon />,
    },
    {
      name: 'Reports',
      url: '#',
      icon: <FileChartColumnIcon />,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: <FileIcon />,
    },
  ],

  navSuperadmin: [
    {
      title: 'Users',
      url: '/admin/users',
      icon: <UsersIcon />,
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <SuperAdminNav items={data.navSuperadmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

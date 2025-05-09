
"use client";

import * as React from 'react';
import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import type { IconName } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

interface NavItemGroup {
    role: string;
    items: NavItem[];
}

interface MainLayoutProps {
  children: ReactNode;
  userRole: string;
}

// Define all navigation items centrally
const allNavItems: NavItemGroup[] = [
    {
        role: "Admin",
        items: [
            { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/admin/students', label: 'Manage Students', icon: 'Users' },
            { href: '/admin/teachers', label: 'Manage Faculty', icon: 'UserCog' },
            { href: '/admin/programs', label: 'Programs & Courses', icon: 'Library' }, // Changed label
            { href: '/admin/assignments', label: 'Section Management', icon: 'ClipboardList' },
            // "Manage Admins" is removed from here. It's linked from the dashboard or implicit via Faculty.
            { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
        ]
    },
     {
        role: "Teacher",
        items: [
            { href: '/teacher/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/teacher/profile', label: 'Profile', icon: 'UserCircle' },
            { href: '/teacher/grades', label: 'Submit Grades', icon: 'ClipboardCheck' },
            { href: '/teacher/schedule', label: 'View Schedule', icon: 'CalendarClock' },
            { href: '/teacher/settings', label: 'Settings', icon: 'Settings' },
        ]
    },
    {
        role: "Student",
        items: [
            { href: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/student/profile', label: 'Profile', icon: 'UserCircle' },
            { href: '/student/grades', label: 'View Grades', icon: 'BookOpenCheck' },
            { href: '/student/schedule', label: 'Class Schedule', icon: 'CalendarDays' },
            { href: '/student/settings', label: 'Settings', icon: 'Settings' },
        ]
    },
];


export function MainLayout({ children, userRole }: MainLayoutProps) {
  const validChildren: React.ReactNode = React.Children.toArray(children).filter(child => React.isValidElement(child));

  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarNav navItemGroups={allNavItems} currentUserRole={userRole} />
      <SidebarInset>
        <div className="p-4 pt-16 md:pt-4">
            {validChildren}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

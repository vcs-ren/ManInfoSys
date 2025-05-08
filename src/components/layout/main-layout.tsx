
"use client"; // Add use client directive

import * as React from 'react';
import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav'; // Assuming sidebar-nav is in the same directory
import type { IconName } from 'lucide-react'; // Import IconName type

interface NavItem {
  href: string;
  label: string;
  icon: IconName; // Change type to IconName (string)
}

interface NavItemGroup {
    role: string;
    items: NavItem[];
}

interface MainLayoutProps {
  children: ReactNode;
  userRole: string; // The role of the currently logged-in user
}

// Define all navigation items centrally
const allNavItems: NavItemGroup[] = [
    {
        role: "Admin",
        items: [
            { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/admin/students', label: 'Manage Students', icon: 'Users' },
            { href: '/admin/teachers', label: 'Manage Faculty', icon: 'UserCog' }, // Renamed Label
            { href: '/admin/programs', label: 'Manage Programs', icon: 'Library' }, // Added Programs
            { href: '/admin/assignments', label: 'Section Management', icon: 'ClipboardList' },
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
  // Find the navigation items for the current user role
  const currentUserNavItems = allNavItems.find(group => group.role === userRole)?.items || [];
    // Add a default check for ReactNode type for children
    const validChildren: React.ReactNode = React.Children.toArray(children).filter(child => React.isValidElement(child));


  return (
    <SidebarProvider defaultOpen={true}>
      {/* Pass only the navigation items for the current user */}
      <SidebarNav navItemGroups={allNavItems} currentUserRole={userRole} />
      <SidebarInset>
        <div className="p-4 pt-16 md:pt-4"> {/* Add padding top for mobile header */}
            {validChildren}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

    
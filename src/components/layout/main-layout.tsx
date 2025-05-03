
"use client"; // Add use client directive

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
            { href: '/admin/teachers', label: 'Manage Teachers', icon: 'UserCog' },
            { href: '/admin/schedule', label: 'Class Scheduler', icon: 'CalendarDays' },
        ]
    },
     {
        role: "Teacher",
        items: [
            { href: '/teacher/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/teacher/profile', label: 'Profile', icon: 'UserCircle' },
            { href: '/teacher/grades', label: 'Submit Grades', icon: 'ClipboardCheck' },
            { href: '/teacher/schedule', label: 'View Schedule', icon: 'CalendarClock' },
        ]
    },
    {
        role: "Student",
        items: [
            { href: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
            { href: '/student/profile', label: 'Profile', icon: 'UserCircle' },
            { href: '/student/grades', label: 'View Grades', icon: 'BookOpenCheck' },
            { href: '/student/schedule', label: 'Class Schedule', icon: 'CalendarDays' },
        ]
    },
];


export function MainLayout({ children, userRole }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* Pass all navigation items grouped by role */}
      <SidebarNav navItemGroups={allNavItems} currentUserRole={userRole} />
      <SidebarInset>
        <div className="p-4 pt-16 md:pt-4"> {/* Add padding top for mobile header */}
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

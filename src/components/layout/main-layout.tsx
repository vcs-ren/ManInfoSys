
"use client"; // Add use client directive

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav'; // Assuming sidebar-nav is in the same directory
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MainLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  userRole: string;
}

export function MainLayout({ children, navItems, userRole }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarNav navItems={navItems} userRole={userRole} />
      <SidebarInset>
        <div className="p-4 pt-16 md:pt-4"> {/* Add padding top for mobile header */}
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

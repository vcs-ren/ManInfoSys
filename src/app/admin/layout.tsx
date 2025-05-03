
import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import type { IconName } from 'lucide-react';

// Define Admin navigation items with IconName
const adminNavItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/students', label: 'Manage Students', icon: 'Users' },
  { href: '/admin/teachers', label: 'Manage Teachers', icon: 'UserCog' },
  { href: '/admin/schedule', label: 'Class Scheduler', icon: 'CalendarDays' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout navItems={adminNavItems} userRole="Admin">
      {children}
    </MainLayout>
  );
}

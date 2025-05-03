
import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import type { IconName } from 'lucide-react';

// Define Student navigation items with IconName
const studentNavItems: { href: string; label: string; icon: IconName }[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/student/profile', label: 'Profile', icon: 'UserCircle' },
  { href: '/student/grades', label: 'View Grades', icon: 'BookOpenCheck' },
  { href: '/student/schedule', label: 'Class Schedule', icon: 'CalendarDays' },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout navItems={studentNavItems} userRole="Student">
      {children}
    </MainLayout>
  );
}

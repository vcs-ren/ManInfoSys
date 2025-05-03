
import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { LayoutDashboard, UserCircle, ClipboardCheck, CalendarClock } from 'lucide-react';

// Define Teacher navigation items
const teacherNavItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/profile', label: 'Profile', icon: UserCircle },
  { href: '/teacher/grades', label: 'Submit Grades', icon: ClipboardCheck },
  { href: '/teacher/schedule', label: 'View Schedule', icon: CalendarClock },
];

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout navItems={teacherNavItems} userRole="Teacher">
      {children}
    </MainLayout>
  );
}

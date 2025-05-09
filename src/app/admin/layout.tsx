
import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Pass only the userRole, MainLayout handles nav items
    // "Manage Admins" is removed as a direct sidebar item.
    // It's accessed via the "Administrative Staff" card on the dashboard,
    // or implicitly managed via "Manage Faculty".
    <MainLayout userRole="Admin">
      {children}
    </MainLayout>
  );
}

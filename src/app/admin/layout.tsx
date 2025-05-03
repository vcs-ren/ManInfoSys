
import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
// No need to import IconName or define navItems here anymore

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Pass only the userRole, MainLayout handles nav items
    <MainLayout userRole="Admin">
      {children}
    </MainLayout>
  );
}


import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // Pass only the userRole, MainLayout handles nav items
    <MainLayout userRole="Admin">
      {children}
    </MainLayout>
  );
}

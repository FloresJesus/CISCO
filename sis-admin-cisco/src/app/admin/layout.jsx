import { Suspense } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAuthCheck from '@/components/admin/AdminAuthCheck';

export const metadata = {
  title: 'Panel Administrativo | Cisco Academy',
  description: 'Panel de administración para el sistema de Cisco Academy',
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthCheck>
      <div className="flex h-screen bg-secondary">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4">
            <Suspense fallback={<div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
            </div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </AdminAuthCheck>
  );
}

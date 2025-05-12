import { Suspense } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Dashboard Administrativo | Cisco Academy',
  description: 'Panel de control administrativo del sistema Cisco Academy',
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">Dashboard Administrativo</h1>
      </div>
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ciscoBlue"></div>
      </div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}

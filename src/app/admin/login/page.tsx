
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
      <Suspense fallback={<div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
         <AdminLoginForm />
      </Suspense>
    </div>
  );
}

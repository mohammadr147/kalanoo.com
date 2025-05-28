
import { Suspense } from 'react';
import { Loader2, Users } from 'lucide-react';
import { UserList } from '@/components/admin/user-list'; // Placeholder component

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
        </div>
         {/* Add buttons for actions if needed, e.g., Add User, Export Users */}
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <UserList />
      </Suspense>
    </div>
  );
}

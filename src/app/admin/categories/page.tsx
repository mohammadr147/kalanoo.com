
import { Suspense } from 'react';
import { Loader2, Folders, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryListAdmin } from '@/components/admin/category-list-admin'; // Placeholder component
// TODO: Import Dialog components if adding a "Create Category" modal

export default function AdminCategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Folders className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت دسته‌بندی‌ها</h1>
        </div>
         {/* TODO: Add Dialog for creating/editing categories */}
         <Button disabled> {/* Disabled until implemented */}
             <PlusCircle className="ml-2 h-4 w-4" />
             افزودن دسته‌بندی جدید
         </Button>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <CategoryListAdmin />
      </Suspense>
    </div>
  );
}


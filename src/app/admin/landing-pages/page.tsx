
import { Suspense } from 'react';
import { Loader2, AppWindow, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingPageListAdmin } from '@/components/admin/landing-page-list-admin'; // Placeholder component
// TODO: Import Dialog components if adding a "Create Landing Page" modal

export default function AdminLandingPagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <AppWindow className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت لندینگ پیج‌ها</h1>
        </div>
         {/* TODO: Add Dialog for creating/editing landing pages */}
         <Button disabled> {/* Disabled until implemented */}
             <PlusCircle className="ml-2 h-4 w-4" />
             افزودن لندینگ پیج جدید
         </Button>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LandingPageListAdmin />
      </Suspense>
    </div>
  );
}

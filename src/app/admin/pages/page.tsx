
import { Suspense } from 'react';
import { Loader2, FileText, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageListAdmin } from '@/components/admin/page-list-admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InfoPageForm } from '@/components/admin/info-page-form'; // Component for create/edit form

export default function AdminPagesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">مدیریت صفحات اطلاعاتی</h1>
         </div>
         <Dialog>
           <DialogTrigger asChild>
              <Button>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  افزودن صفحه جدید
              </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[800px]"> {/* Wider dialog for form with editor */}
              <DialogHeader>
                 <DialogTitle>افزودن صفحه اطلاعاتی جدید</DialogTitle>
                 <DialogDescription>
                    محتوای صفحه جدید (مانند سوالات متداول، درباره ما و...) را وارد کنید.
                 </DialogDescription>
              </DialogHeader>
              {/* Pass mode='create' if needed, defaults might handle it */}
              <InfoPageForm />
           </DialogContent>
         </Dialog>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>در حال بارگذاری لیست صفحات...</span>
        </div>
      }>
        <PageListAdmin />
      </Suspense>
    </div>
  );
}

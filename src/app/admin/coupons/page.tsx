
import { Suspense } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CouponList } from '@/components/admin/coupon-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CouponForm } from '@/components/admin/coupon-form';


export default function AdminCouponsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">مدیریت کوپن‌های تخفیف</h1>
         <Dialog>
           <DialogTrigger asChild>
              <Button>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  افزودن کوپن جدید
              </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[600px]"> {/* Wider dialog for form */}
              <DialogHeader>
                 <DialogTitle>افزودن کوپن جدید</DialogTitle>
                 <DialogDescription>
                    اطلاعات کوپن تخفیف جدید را وارد کنید.
                 </DialogDescription>
              </DialogHeader>
              <CouponForm /> {/* Add mode='create' if needed later for edit */}
           </DialogContent>
         </Dialog>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <CouponList />
      </Suspense>
    </div>
  );
}

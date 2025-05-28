
'use client';

import React, { useState, useEffect } from 'react';
// Removed: import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
// Removed: import { db } from '@/lib/firebase';
import type { Coupon } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { deleteCoupon } from '@/app/actions'; // Import consolidated delete action (needs update for MySQL if not done)
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// TODO: Import action to fetch coupons from MySQL
// import { fetchCouponsAdmin } from '@/app/actions';

// Helper to format date string/object from DB
const formatDate = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return '-';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'numeric', day: 'numeric' });
    } catch {
        return 'تاریخ نامعتبر';
    }
};


export function CouponList() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCoupons = async () => {
      setLoading(true);
      setError(null);
      try {
          // TODO: Replace with actual fetch action for MySQL
          // const result = await fetchCouponsAdmin();
          // if (result.success && result.coupons) {
          //     setCoupons(result.coupons);
          // } else {
          //     setError(result.error || 'خطا در دریافت کوپن‌ها.');
          // }

          // --- Placeholder ---
          await new Promise(res => setTimeout(res, 500)); // Simulate fetch
          const dummyCoupons: Coupon[] = []; // Add dummy data if needed for testing
          setCoupons(dummyCoupons);
          if (!dummyCoupons.length) console.warn("CouponList: No coupons fetched (using dummy data or empty result). Implement fetchCouponsAdmin action.");
          // --- End Placeholder ---

      } catch (err) {
          console.error("Error fetching coupons:", err);
          setError("خطا در دریافت لیست کوپن‌ها.");
          toast({ title: "خطا", description: "مشکلی در بارگذاری کوپن‌ها رخ داد.", variant: "destructive" });
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    loadCoupons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only once on mount

   const handleDelete = async (couponId: string, couponCode: string) => {
      // Ensure couponId is a number for the MySQL action
      const idAsNumber = parseInt(couponId, 10);
       if (isNaN(idAsNumber)) {
            toast({ title: "خطا", description: "شناسه کوپن نامعتبر است.", variant: "destructive" });
            return;
       }

      setDeletingId(couponId); // Show loading state on the specific delete button
      try {
          const result = await deleteCoupon(idAsNumber); // Pass number ID
          if (result.success) {
              toast({ title: "موفقیت", description: `کوپن ${couponCode} با موفقیت حذف شد.` });
              // Refresh the list after deletion
              await loadCoupons();
          } else {
              toast({ title: "خطا", description: result.error || "خطا در حذف کوپن.", variant: "destructive" });
          }
      } catch (err) {
          console.error("Error deleting coupon:", err);
          toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور رخ داده است.", variant: "destructive" });
      } finally {
          setDeletingId(null); // Hide loading state
      }
   };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (coupons.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ کوپنی یافت نشد.</p>;
  }

  return (
    <Table>
      <TableCaption>لیست کوپن‌های تخفیف تعریف شده</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>کد کوپن</TableHead>
          <TableHead>نوع تخفیف</TableHead>
          <TableHead>مقدار</TableHead>
          <TableHead>تاریخ انقضا</TableHead>
          <TableHead>محدودیت استفاده</TableHead>
          <TableHead>تعداد استفاده شده</TableHead>
          <TableHead>حداقل سفارش (تومان)</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
            <TableCell>
              {coupon.discount_type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}
            </TableCell>
            <TableCell>
              {coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}%`
                : `${coupon.discount_value.toLocaleString('fa-IR')} تومان`}
            </TableCell>
            <TableCell>{formatDate(coupon.expiry_date)}</TableCell>
            <TableCell>{coupon.usage_limit ? coupon.usage_limit.toLocaleString('fa-IR') : 'نامحدود'}</TableCell>
            <TableCell>{coupon.usage_count.toLocaleString('fa-IR')}</TableCell>
            <TableCell>{coupon.min_order_value ? coupon.min_order_value.toLocaleString('fa-IR') : '-'}</TableCell>
            <TableCell>
              <Badge variant={coupon.is_active ? 'default' : 'destructive'} className={coupon.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                {coupon.is_active ? 'فعال' : 'غیرفعال'}
              </Badge>
            </TableCell>
             <TableCell className="space-x-1 space-x-reverse">
                 <Button variant="ghost" size="icon" className="h-8 w-8" disabled> {/* TODO: Enable when edit is ready */}
                     <Pencil className="h-4 w-4 text-blue-600" />
                     <span className="sr-only">ویرایش</span>
                 </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === coupon.id}>
                         {deletingId === coupon.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                         )}
                         <span className="sr-only">حذف</span>
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>آیا از حذف کوپن مطمئن هستید؟</AlertDialogTitle>
                      <AlertDialogDescription>
                         این عملیات قابل بازگشت نیست. کوپن "{coupon.code}" برای همیشه حذف خواهد شد.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                       <AlertDialogAction onClick={() => handleDelete(coupon.id, coupon.code)} className="bg-destructive hover:bg-destructive/90">
                           حذف کوپن
                       </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>


             </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

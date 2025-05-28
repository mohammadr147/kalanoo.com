
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Removed: import { Timestamp } from 'firebase/firestore'; // No longer needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { createCoupon, updateCoupon } from '@/app/actions'; // Import consolidated server actions
import type { Coupon } from '@/types'; // Import types
import { DialogClose } from '@/components/ui/dialog'; // Import DialogClose

// Validation Schema using Zod
const couponSchema = z.object({
  code: z.string().min(3, { message: "کد کوپن باید حداقل ۳ کاراکتر باشد." }).regex(/^[A-Z0-9]+$/, "کد کوپن فقط می‌تواند شامل حروف بزرگ انگلیسی و اعداد باشد."),
  discount_type: z.enum(['percentage', 'fixed'], { required_error: "نوع تخفیف الزامی است." }),
  discount_value: z.number().positive({ message: "مقدار تخفیف باید مثبت باشد." }).min(1, { message: "مقدار تخفیف الزامی است." }),
  expiry_date: z.date({ required_error: "تاریخ انقضا الزامی است." }).min(new Date(new Date().setHours(0,0,0,0)), "تاریخ انقضا نمی‌تواند در گذشته باشد."), // Cannot be in the past
  usage_limit: z.number().int().positive().optional().nullable(),
  min_order_value: z.number().int().nonnegative().optional().nullable(),
  is_active: z.boolean().default(true),
});

// Refine based on discount type
couponSchema.refine(data => {
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
        return false;
    }
    return true;
}, {
    message: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.",
    path: ["discount_value"],
});


type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon; // Optional: Pass existing coupon for editing
  mode?: 'create' | 'edit';
}

export function CouponForm({ coupon, mode = 'create' }: CouponFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

   // Helper function to safely parse date string from DB to Date object
   const parseDate = (dateInput: Date | string | undefined | null): Date | undefined => {
        if (!dateInput) return undefined;
        if (dateInput instanceof Date) return dateInput;
        try {
            const parsed = new Date(dateInput);
            return isNaN(parsed.getTime()) ? undefined : parsed;
        } catch {
            return undefined;
        }
    };

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || '',
      discount_type: coupon?.discount_type || undefined,
      discount_value: coupon?.discount_value || undefined,
      expiry_date: parseDate(coupon?.expiry_date), // Use helper to parse date
      usage_limit: coupon?.usage_limit || null,
      min_order_value: coupon?.min_order_value || null,
      is_active: coupon?.is_active ?? true,
    },
  });

  const onSubmit: SubmitHandler<CouponFormData> = async (data) => {
    setLoading(true);
    try {
        const couponData = {
            ...data,
            code: data.code.toUpperCase(), // Ensure code is uppercase
            // expiryDate is already a Date object from the form
            usage_limit: data.usage_limit || null, // Ensure null if empty
            min_order_value: data.min_order_value || null, // Ensure null if empty
        };

      let result;
      if (mode === 'edit' && coupon?.id) {
        // result = await updateCoupon(Number(coupon.id), couponData); // TODO: Implement updateCoupon action
         toast({ title: "ویژگی ویرایش هنوز پیاده سازی نشده است.", variant: "default" });
         setLoading(false);
         return; // Remove this return when update is implemented
      } else {
        result = await createCoupon(couponData);
      }

      if (result.success) {
        toast({ title: "موفقیت", description: `کوپن ${couponData.code} با موفقیت ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} شد.` });
        form.reset(); // Reset form on success
        // Optionally close the dialog if inside one - requires passing down a close function or using context
         document.getElementById('close-coupon-dialog')?.click(); // Trigger DialogClose if it exists
      } else {
        toast({
          title: "خطا",
          description: result.error || `خطا در ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} کوپن.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور رخ داده است.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد کوپن *</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: OFF20" {...field} disabled={loading || mode === 'edit'} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع تخفیف *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">درصدی (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت (تومان)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مقدار تخفیف *</FormLabel>
                <FormControl>
                    <Input
                      type="number"
                      placeholder={form.getValues('discount_type') === 'percentage' ? "مثال: 20" : "مثال: 50000"}
                      {...field}
                      onChange={event => field.onChange(+event.target.value)} // Convert to number
                      disabled={loading}
                      min="0"
                      step={form.getValues('discount_type') === 'percentage' ? "1" : "1000"}
                    />
                </FormControl>
                 <FormMessage />
              </FormItem>
            )}
          />
           <FormField
             control={form.control}
             name="expiry_date"
             render={({ field }) => (
               <FormItem className="flex flex-col pt-2"> {/* Adjust alignment */}
                 <FormLabel>تاریخ انقضا *</FormLabel>
                 <Popover>
                   <PopoverTrigger asChild>
                     <FormControl>
                       <Button
                         variant={"outline"}
                         className={cn(
                           "w-full justify-start text-right font-normal",
                           !field.value && "text-muted-foreground"
                         )}
                         disabled={loading}
                       >
                         <CalendarIcon className="ml-2 h-4 w-4" />
                          {/* Use standard toLocaleDateString for Farsi date format */}
                         {field.value ? field.value.toLocaleDateString('fa-IR') : <span>انتخاب تاریخ</span>}
                       </Button>
                     </FormControl>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <Calendar
                       mode="single"
                       selected={field.value}
                       onSelect={field.onChange}
                       disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || loading}
                       initialFocus
                       dir="rtl"
                       // locale={{ locale: 'fa' }} // Locale needs to be configured in react-day-picker setup
                     />
                   </PopoverContent>
                 </Popover>
                 <FormMessage />
               </FormItem>
             )}
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>محدودیت تعداد استفاده (اختیاری)</FormLabel>
                <FormControl>
                   <Input
                     type="number"
                     placeholder="مثال: 100 (خالی = نامحدود)"
                     {...field}
                     onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)} // Handle empty string for null
                     disabled={loading}
                     min="1"
                     step="1"
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="min_order_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>حداقل ارزش سفارش (اختیاری - تومان)</FormLabel>
                <FormControl>
                   <Input
                     type="number"
                     placeholder="مثال: 500000 (خالی = بدون حداقل)"
                     {...field}
                     onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)} // Handle empty string for null
                     disabled={loading}
                     min="0"
                     step="1000"
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

         <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                      <FormLabel>وضعیت فعال بودن</FormLabel>
                  </div>
                  <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                  </FormControl>
                </FormItem>
            )}
         />

        <div className="flex justify-end gap-2">
             {/* Hidden close button to be triggered programmatically */}
             <DialogClose asChild>
                 <Button type="button" variant="outline" id="close-coupon-dialog">انصراف</Button>
             </DialogClose>
             <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'edit' ? 'ویرایش کوپن' : 'افزودن کوپن'}
             </Button>
         </div>
      </form>
    </Form>
  );
}

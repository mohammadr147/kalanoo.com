
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { createCoupon, updateCoupon } from '@/app/actions';
import type { Coupon } from '@/types';
import { CreateCouponSchema } from '@/types'; // Import from types
import { DialogClose } from '@/components/ui/dialog';

type CouponFormData = z.infer<typeof CreateCouponSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  mode?: 'create' | 'edit';
}

export function CouponForm({ coupon, mode = 'create' }: CouponFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
    resolver: zodResolver(CreateCouponSchema), // Use imported schema
    defaultValues: {
      code: coupon?.code || '',
      discount_type: coupon?.discount_type || undefined,
      discount_value: coupon?.discount_value || undefined,
      expiry_date: parseDate(coupon?.expiry_date),
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
            code: data.code.toUpperCase(),
            usage_limit: data.usage_limit || null,
            min_order_value: data.min_order_value || null,
        };

      let result;
      if (mode === 'edit' && coupon?.id) {
         toast({ title: "ویژگی ویرایش هنوز پیاده سازی نشده است.", variant: "default" });
         setLoading(false);
         return;
      } else {
        result = await createCoupon(couponData);
      }

      if (result.success) {
        toast({ title: "موفقیت", description: `کوپن ${couponData.code} با موفقیت ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} شد.` });
        form.reset();
         document.getElementById('close-coupon-dialog')?.click();
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
                      onChange={event => field.onChange(+event.target.value)}
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
               <FormItem className="flex flex-col pt-2">
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
                     onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                     value={field.value ?? ''}
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
                     onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                     value={field.value ?? ''}
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

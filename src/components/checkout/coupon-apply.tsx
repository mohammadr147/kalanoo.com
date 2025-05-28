
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateCouponCode } from '@/app/actions';
import type { Coupon } from '@/types';
import { ValidateCouponCodeSchema } from '@/types'; // Import from types
import * as z from 'zod';

interface CouponApplyProps {
  cartTotal: number;
  onCouponApply: (coupon: Coupon, discountAmount: number) => void;
  onCouponRemove: () => void;
  appliedCouponCode: string | null | undefined;
}

export function CouponApply({ cartTotal, onCouponApply, onCouponRemove, appliedCouponCode }: CouponApplyProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleValidateCoupon = async () => {
    const parsedInput = ValidateCouponCodeSchema.safeParse({ code: couponCode, cartTotal });
    if (!parsedInput.success) {
        toast({ title: "کد تخفیف نامعتبر", description: parsedInput.error.errors[0].message, variant: "destructive" });
        return;
    }

    setLoading(true);
    setIsValidating(true);
    try {
      const result = await validateCouponCode(parsedInput.data);

      if (result.success && result.isValid && result.coupon && result.discountAmount !== undefined) {
        onCouponApply(result.coupon, result.discountAmount);
        toast({ title: "موفقیت", description: `کد تخفیف ${result.coupon.code} با موفقیت اعمال شد.` });
      } else {
        onCouponRemove();
        toast({
          title: "خطا در اعمال کد تخفیف",
          description: result.error || "کد تخفیف نامعتبر یا شرایط استفاده رعایت نشده است.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
       onCouponRemove();
      toast({
        title: "خطای پیش بینی نشده",
        description: "مشکلی در بررسی کد تخفیف رخ داد.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    onCouponRemove();
    toast({ title: "کد تخفیف حذف شد." });
  };

  return (
    <div className="space-y-2">
       <label htmlFor="coupon-code" className="text-sm font-medium">کد تخفیف (اختیاری)</label>
        <div className="flex items-center space-x-2 space-x-reverse">
            <Input
                id="coupon-code"
                placeholder="کد تخفیف خود را وارد کنید"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={loading || !!appliedCouponCode}
                className="flex-1"
            />
             {!appliedCouponCode ? (
                 <Button
                     type="button"
                     onClick={handleValidateCoupon}
                     disabled={loading || !couponCode.trim()}
                     variant="outline"
                     className="whitespace-nowrap"
                 >
                     {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Tag className="ml-2 h-4 w-4" />}
                     اعمال کد
                 </Button>
             ) : (
                 <Button
                     type="button"
                     onClick={handleRemoveCoupon}
                     variant="destructive"
                     className="whitespace-nowrap"
                     size="sm"
                     disabled={loading}
                 >
                     <XCircle className="ml-2 h-4 w-4" />
                     حذف کد
                 </Button>
             )}
        </div>
         {appliedCouponCode && !isValidating && (
             <p className="text-sm text-green-600 flex items-center gap-1">
                 <CheckCircle className="h-4 w-4" />
                 کد تخفیف {appliedCouponCode} اعمال شد.
             </p>
         )}
    </div>
  );
}

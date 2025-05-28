
'use client';

import React, { useState, useEffect } from 'react';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, UserCheck, Info, Tag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user, userData, loading: authLoading, isUserProfileComplete } = useAuth();
  const router = useRouter();

  // Calculate subtotal before any discounts
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // State for discount amount and final total will be managed within CheckoutForm
  // but we can display a preview here if needed, although it adds complexity.
  // For simplicity, CheckoutForm will handle the final total display.

  // Redirect if not authenticated or cart is empty after loading
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth?redirect=/checkout');
      } else if (cart.length === 0) {
        // Allow brief moment for cart to potentially load from storage
        const timer = setTimeout(() => {
            // Recheck cart length after a short delay
            if (cart.length === 0) {
                 router.push('/'); // Redirect to home if cart is definitely empty
            }
        }, 300); // Adjust delay if needed
        return () => clearTimeout(timer);
      }
    }
  }, [user, cart, authLoading, router]);


   if (authLoading || (user && cart.length === 0 && !router.pathname.startsWith('/order/success'))) { // Added check to prevent loader flash on success page
     return (
       <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
     );
   }


  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      <h1 className="text-3xl font-bold mb-8 text-center">نهایی کردن خرید</h1>

      {!isUserProfileComplete && user && (
           <Alert variant="destructive" className="mb-6">
             <UserCheck className="h-4 w-4" />
             <AlertTitle>پروفایل شما ناقص است!</AlertTitle>
             <AlertDescription>
               برای ادامه خرید، لطفاً اطلاعات کاربری و آدرس خود را تکمیل کنید.
               <Button asChild variant="link" className="px-1">
                   <Link href="/profile/complete?redirect=/checkout">تکمیل پروفایل</Link>
               </Button>
             </AlertDescription>
           </Alert>
       )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-last lg:order-first">
          <Card>
            <CardHeader>
              <CardTitle>خلاصه سفارش</CardTitle>
               {/* Description removed as pricing details are inside content now */}
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                     <Image
                        src={item.image_url || `https://picsum.photos/seed/${item.id}/50/50`} // Use image_url
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                        data-ai-hint="cart summary item image"
                      />
                      <span>{item.name} (×{item.quantity})</span>
                  </div>
                  <span>{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>جمع کل (قبل از تخفیف):</span>
                <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
              </div>
              {/* Note: Discount and final total are now shown dynamically in CheckoutForm */}
               {/* Display Shipping Address Preview */}
               {isUserProfileComplete && userData?.address && (
                <>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2 text-sm">آدرس ارسال</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {userData.address.province}, {userData.address.city}, {userData.address.full_address}
                            <br/>
                            کد پستی: {userData.address.postal_code}
                        </p>
                         <Button asChild variant="link" size="sm" className="p-0 h-auto mt-1 text-xs">
                             <Link href="/profile/complete?redirect=/checkout">ویرایش آدرس</Link>
                         </Button>
                    </div>
                 </>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
           {/* Disable form if profile is incomplete */}
           {isUserProfileComplete ? (
                <CheckoutForm totalAmount={subtotal} /> // Pass subtotal here
           ) : (
                <Card className="opacity-50 pointer-events-none">
                     <CardHeader>
                         <CardTitle>روش پرداخت</CardTitle>
                         <CardDescription>ابتدا پروفایل خود را تکمیل کنید.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="h-40 flex items-center justify-center text-muted-foreground">
                           فرم پرداخت غیرفعال است.
                        </div>
                     </CardContent>
                </Card>
           )}
        </div>
      </div>
    </div>
  );
}

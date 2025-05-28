
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Banknote, Milestone, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import type { Order, PaymentMethod, CheckPaymentDetails, Coupon, Address } from '@/types';
import { useRouter } from 'next/navigation';
import { processPayment } from '@/services/payment';
// import { createOrder } from '@/app/actions'; // This will be used from the main actions file
import { applyCouponToOrder, createOrder } from '@/app/actions'; // Import createOrder from main actions
import { CouponApply } from './coupon-apply';
import { Separator } from '@/components/ui/separator';
import { CheckImageUpload } from './check-image-upload'; // Import the new component

// Zod Schema for the checkout form
const checkoutSchema = z.object({
  paymentMethod: z.enum(['cash', 'installments', 'check'], {
    required_error: 'لطفاً روش پرداخت را انتخاب کنید.',
  }),
  checkDetails: z.object({
      checkNumber: z.string().optional(),
      bankName: z.string().optional(),
      dueDate: z.date().optional(),
      sayyad_number: z.string().optional(), // شماره صیاد چک
      check_image_data_url: z.string().optional().nullable(), // Base64 data URL of the check image
  }).optional(),
  // TODO: Add installmentDetails schema when that feature is implemented
  // installmentDetails: z.object({
  //   planId: z.string().optional(),
  //   // ... other installment related fields
  // }).optional(),
}).refine(data => {
    if (data.paymentMethod === 'check') {
        const cd = data.checkDetails;
        return cd?.checkNumber && cd.bankName && cd.dueDate && cd.sayyad_number && cd.check_image_data_url;
    }
    return true;
}, {
    message: "برای پرداخت چکی، تمام اطلاعات چک (شماره، بانک، تاریخ سررسید، شماره صیاد و تصویر چک) الزامی است.",
    path: ["checkDetails"],
});


type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
    totalAmount: number;
}

export function CheckoutForm({ totalAmount: subtotal }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const finalTotalAmount = Math.max(0, subtotal - discountAmount);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: undefined,
      checkDetails: {
        checkNumber: '',
        bankName: '',
        dueDate: undefined,
        sayyad_number: '',
        check_image_data_url: null,
      },
    },
  });

   const paymentMethod = form.watch('paymentMethod');

   const handleCouponApply = (coupon: Coupon, discount: number) => {
     setAppliedCoupon(coupon);
     setDiscountAmount(discount);
   };

   const handleCouponRemove = () => {
       setAppliedCoupon(null);
       setDiscountAmount(0);
   };

   const handlePaymentAndOrder = async (data: CheckoutFormData) => {
     setLoading(true);

     if (!user || !userData || !userData.address) {
       toast({ title: "خطا", description: "اطلاعات کاربر یا آدرس یافت نشد.", variant: "destructive" });
       setLoading(false);
       return;
     }

     let paymentResult = { transactionId: `local-${Date.now()}`, status: 'Pending' };
     let finalPaymentDetailsForDB: string | null = null;
     let couponAppliedSuccessfully = false;
     const couponId = appliedCoupon ? parseInt(appliedCoupon.id, 10) : null;
     let orderStatus: Order['status'] = 'pending_confirmation';

     try {
        if (couponId !== null && !isNaN(couponId)) {
            const applyResult = await applyCouponToOrder(couponId);
            if (!applyResult.success) {
                toast({ title: "خطا در اعمال کوپن", description: applyResult.error || "ظرفیت کوپن ممکن است تمام شده باشد.", variant: "destructive" });
                handleCouponRemove();
                setLoading(false);
                return;
            }
            couponAppliedSuccessfully = true;
        }

        switch (data.paymentMethod) {
            case 'cash':
                toast({ title: "در حال اتصال به درگاه پرداخت...", description: "لطفاً منتظر بمانید." });
                paymentResult = await processPayment(finalTotalAmount, 'online_gateway_mock');
                if (paymentResult.status !== 'Success') {
                     throw new Error(`پرداخت ناموفق بود. وضعیت: ${paymentResult.status}`);
                }
                toast({ title: "پرداخت موفق", description: `شماره تراکنش: ${paymentResult.transactionId}` });
                finalPaymentDetailsForDB = JSON.stringify({ transactionId: paymentResult.transactionId });
                orderStatus = 'processing'; // Or 'completed' if no further processing needed
                break;

            case 'installments':
                toast({ title: "روش اقساطی انتخاب شد", description: "سفارش شما پس از تایید کارشناسان نهایی خواهد شد." });
                paymentResult.status = 'Success'; // For simulation, actual payment might be later
                orderStatus = 'pending_installment_approval';
                // finalPaymentDetailsForDB would include selected installment plan ID later
                break;

            case 'check':
                 if (!data.checkDetails?.checkNumber || !data.checkDetails?.bankName || !data.checkDetails?.dueDate || !data.checkDetails?.sayyad_number || !data.checkDetails?.check_image_data_url) {
                    throw new Error("اطلاعات چک (شامل تصویر) ناقص است.");
                 }
                 toast({ title: "روش چکی انتخاب شد", description: "سفارش شما پس از تایید چک نهایی خواهد شد." });
                 paymentResult.status = 'Success'; // For simulation
                 const checkInfo: CheckPaymentDetails = {
                    check_number: data.checkDetails.checkNumber,
                    bank_name: data.checkDetails.bankName,
                    due_date: data.checkDetails.dueDate.toISOString().split('T')[0],
                    sayyad_number: data.checkDetails.sayyad_number,
                    check_image_url: data.checkDetails.check_image_data_url, // This will be base64 for server to save
                    amount: finalTotalAmount,
                    status: 'pending',
                 };
                 finalPaymentDetailsForDB = JSON.stringify({ checkInfo });
                 orderStatus = 'pending_check_confirmation';
                break;
            default:
                 throw new Error("روش پرداخت نامعتبر است.");
        }

        const orderDataForDB: Omit<Order, 'id' | 'created_at' | 'updated_at'> & { check_image_data_url?: string | null } = {
            user_id: user.uid,
            items: JSON.stringify(cart),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total_amount: finalTotalAmount,
            status: orderStatus,
            shipping_address: JSON.stringify(userData.address as Address),
            applied_coupon_code: appliedCoupon?.code || null,
            payment_method: data.paymentMethod,
            payment_details: finalPaymentDetailsForDB, // This will be null or JSON string of details
            // Pass base64 image data URL directly if it's a check payment
            check_image_data_url: data.paymentMethod === 'check' ? data.checkDetails?.check_image_data_url : null,
        };
        
        // The server action 'createOrder' will now handle saving the image if check_image_data_url is provided
        const createOrderResult = await createOrder(orderDataForDB);

        if (!createOrderResult.success) {
             throw new Error(createOrderResult.error || "خطا در ثبت سفارش در پایگاه داده.");
        }

         clearCart();
         toast({ title: "سفارش شما ثبت شد!", description: `وضعیت: ${orderStatus === 'pending_check_confirmation' ? 'در انتظار تایید چک' : orderStatus === 'pending_installment_approval' ? 'در انتظار تایید اقساط' : 'در حال پردازش' }`, variant: "default" });
         router.push(`/order/success?orderId=${createOrderResult.orderId}`);

     } catch (error: any) {
       console.error("Checkout error:", error);
       toast({ title: "خطا در پردازش سفارش", description: error.message || "مشکلی پیش آمده، لطفاً دوباره تلاش کنید.", variant: "destructive" });
       if (couponAppliedSuccessfully && couponId !== null) {
           console.warn(`Order creation failed after applying coupon ${appliedCoupon?.code}. Rollback might be needed if coupon usage was already decremented.`);
           handleCouponRemove();
       }
     } finally {
       setLoading(false);
     }
   };

   const onSubmit: SubmitHandler<CheckoutFormData> = (data) => {
        handlePaymentAndOrder(data);
   };

  return (
    <Card>
      <CardHeader>
        <CardTitle>پرداخت و تکمیل سفارش</CardTitle>
         <CardDescription>
              <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                      <span>جمع سبد خرید:</span>
                      <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  {discountAmount > 0 && (
                      <div className="flex justify-between text-destructive">
                          <span>تخفیف ({appliedCoupon?.code || ''}):</span>
                           <span>-{discountAmount.toLocaleString('fa-IR')} تومان</span>
                      </div>
                  )}
                  <Separator />
                   <div className="flex justify-between font-semibold">
                       <span>مبلغ نهایی قابل پرداخت:</span>
                       <span>{finalTotalAmount.toLocaleString('fa-IR')} تومان</span>
                   </div>
              </div>
         </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <CouponApply
                cartTotal={subtotal}
                onCouponApply={handleCouponApply}
                onCouponRemove={handleCouponRemove}
                appliedCouponCode={appliedCoupon?.code}
            />
             <Separator />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>روش پرداخت *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                      disabled={loading}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 space-x-reverse rounded-md border p-4 has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="cash" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                           <Banknote className="h-5 w-5 text-green-600"/> پرداخت نقدی / آنلاین
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 space-x-reverse rounded-md border p-4 has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="installments" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                           <Milestone className="h-5 w-5 text-blue-600"/> پرداخت اقساطی (نیاز به تایید)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 space-x-reverse rounded-md border p-4 has-[:checked]:border-primary">
                        <FormControl>
                          <RadioGroupItem value="check" />
                        </FormControl>
                         <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                             <CheckSquare className="h-5 w-5 text-orange-600"/> پرداخت چکی (نیاز به تایید)
                         </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === 'check' && (
              <Card className="bg-secondary/50 p-4 mt-4">
                <CardHeader className="p-2 mb-2">
                     <CardTitle className="text-lg">اطلاعات چک</CardTitle>
                     <CardDescription>لطفاً مشخصات چک پرداختی را وارد کنید.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-2">
                  <FormField
                    control={form.control}
                    name="checkDetails.checkNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره سریال چک *</FormLabel>
                        <FormControl>
                          <Input type="text" inputMode='numeric' placeholder="1234567890" {...field} disabled={loading} dir="ltr" className="text-left" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="checkDetails.sayyad_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره صیاد چک (۱۶ رقمی) *</FormLabel>
                        <FormControl>
                          <Input type="text" inputMode='numeric' maxLength={16} placeholder="1000200030004000" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkDetails.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نام بانک *</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: بانک ملی" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkDetails.dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاریخ سررسید چک *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn( "w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}
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
                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || loading }
                              initialFocus
                              dir="rtl"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="checkDetails.check_image_data_url"
                    render={({ field }) => ( // field.value will hold the base64 string
                      <FormItem>
                        {/* <FormLabel>تصویر چک *</FormLabel> */}
                        <FormControl>
                           <CheckImageUpload
                            onImageSelect={(base64) => form.setValue('checkDetails.check_image_data_url', base64, { shouldValidate: true })}
                            initialPreviewUrl={field.value}
                            disabled={loading}
                            fieldDescription="تصویر خوانا از روی چک (حداکثر ۲ مگابایت) بارگذاری شود."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-sm pt-2">
                     <span className="font-medium">مبلغ چک:</span> {finalTotalAmount.toLocaleString('fa-IR')} تومان
                 </div>
                </CardContent>
              </Card>
            )}

             {paymentMethod === 'installments' && (
                 <Card className="bg-secondary/50 p-4 mt-4">
                     <CardHeader className="p-2 mb-2">
                         <CardTitle className="text-lg">پرداخت اقساطی</CardTitle>
                     </CardHeader>
                     <CardContent className="p-2">
                         <p className="text-sm text-muted-foreground">
                             شرایط پرداخت اقساطی و انتخاب پلن به زودی در این بخش اضافه خواهد شد.
                             در حال حاضر، سفارش شما به عنوان "در انتظار تایید اقساط" ثبت شده و کارشناسان ما با شما تماس خواهند گرفت.
                         </p>
                         {/* TODO: Add installment plan selection here */}
                     </CardContent>
                 </Card>
             )}


            <Button type="submit" className="w-full" disabled={loading || !paymentMethod}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {paymentMethod === 'cash' ? 'پرداخت و ثبت سفارش' : 'ثبت سفارش و ادامه'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


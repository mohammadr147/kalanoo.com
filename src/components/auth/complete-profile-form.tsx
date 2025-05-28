
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile, Address } from '@/types';
import { UpdateUserProfileSchema } from '@/types'; // Import schema from types
import { getMonth, getDate } from 'date-fns';
import { updateUserProfile } from '@/app/actions'; // Import server action

// Using UpdateUserProfileSchema directly for the form if it matches needs
// Or define a specific one if form fields differ from full UserProfile update
const completeProfileFormSchema = UpdateUserProfileSchema.pick({
  first_name: true,
  last_name: true,
  national_id: true,
  secondary_phone: true,
  birth_date: true, // Assuming birth_date in UpdateUserProfileSchema is for string, need to adjust for Date obj
  address: true,    // Assuming address in UpdateUserProfileSchema is for JSON string, need to adjust for Address obj
}).extend({
  // Override or add specific form types if different from UpdateUserProfileSchema
  birth_date: z.date({ required_error: "تاریخ تولد الزامی است." }),
  address: z.object({
    province: z.string().min(1, { message: "استان الزامی است." }),
    city: z.string().min(1, { message: "شهر الزامی است." }),
    full_address: z.string().min(10, { message: "آدرس کامل باید حداقل ۱۰ حرف باشد." }),
    postal_code: z.string().regex(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." }),
  }),
});


type CompleteProfileFormData = z.infer<typeof completeProfileFormSchema>;

export function CompleteProfileForm() {
  const { user, userData: initialUserData, loading: authLoading, checkAuthState } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/';

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

  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      national_id: '',
      secondary_phone: '',
      birth_date: undefined,
      address: {
        province: '',
        city: '',
        full_address: '',
        postal_code: '',
      },
    },
  });

   useEffect(() => {
    if (initialUserData) {
        form.reset({
            first_name: initialUserData.first_name || '',
            last_name: initialUserData.last_name || '',
            national_id: initialUserData.national_id || '',
            secondary_phone: initialUserData.secondary_phone || '',
            birth_date: parseDate(initialUserData.birth_date),
            address: {
                province: initialUserData.address?.province || '',
                city: initialUserData.address?.city || '',
                full_address: initialUserData.address?.full_address || '',
                postal_code: initialUserData.address?.postal_code || '',
            },
        });
     } else if (user && !authLoading) {
        form.reset();
     }
   }, [initialUserData, user, authLoading, form]);


  const onSubmit: SubmitHandler<CompleteProfileFormData> = async (data) => {
    if (!user) {
      toast({ title: "خطا", description: "برای ذخیره اطلاعات باید وارد شده باشید.", variant: "destructive" });
      router.push('/auth');
      return;
    }

    setLoading(true);
    try {
        const birthMonth = getMonth(data.birth_date) + 1;
        const birthDay = getDate(data.birth_date);
        const birthDateForDB = data.birth_date.toISOString().split('T')[0];

        const profileDataToSave: z.infer<typeof UpdateUserProfileSchema> = {
            uid: user.uid,
            first_name: data.first_name,
            last_name: data.last_name,
            national_id: data.national_id || null,
            secondary_phone: data.secondary_phone || null,
            birth_date: birthDateForDB,
            birth_month: birthMonth,
            birth_day: birthDay,
            address: JSON.stringify(data.address), // Serialize address object to JSON string
            is_profile_complete: true,
        };

      const result = await updateUserProfile(profileDataToSave);

      if (result.success) {
        toast({ title: "موفقیت", description: "اطلاعات شما با موفقیت ذخیره شد." });
        await checkAuthState();
        router.push(redirectTo);
      } else {
        toast({ title: "خطا", description: result.error || "خطا در ذخیره اطلاعات.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving profile data:", error);
      toast({ title: "خطا", description: "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

   if (authLoading) {
       return (
         <div className="flex justify-center items-center h-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       );
   }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>تکمیل اطلاعات کاربری</CardTitle>
        <CardDescription>لطفاً اطلاعات هویتی و آدرس خود را وارد کنید تا بتوانید خرید خود را نهایی کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: علی" {...field} value={field.value || ''} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام خانوادگی *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: محمدی" {...field} value={field.value || ''} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد ملی (اختیاری)</FormLabel>
                    <FormControl>
                      <Input type="text" inputMode='numeric' maxLength={10} placeholder="۰۰۱۲۳۴۵۶۷۸" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondary_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تماس دوم (اختیاری)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="09xxxxxxxxx" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>تاریخ تولد *</FormLabel>
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
                           disabled={(date) =>
                             date > new Date() || date < new Date("1900-01-01") || loading
                           }
                           defaultMonth={field.value || new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                           captionLayout="dropdown-buttons"
                           fromYear={1920}
                           toYear={new Date().getFullYear()}
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

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">اطلاعات آدرس *</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="address.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>استان *</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: تهران" {...field} value={field.value || ''} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شهر *</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: تهران" {...field} value={field.value || ''} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
              <FormField
                control={form.control}
                name="address.full_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس کامل *</FormLabel>
                    <FormControl>
                      <Input placeholder="خیابان، کوچه، پلاک، واحد" {...field} value={field.value || ''} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد پستی *</FormLabel>
                    <FormControl>
                      <Input type="text" inputMode='numeric' maxLength={10} placeholder="۱۲۳۴۵۶۷۸۹۰" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              ذخیره اطلاعات و ادامه
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

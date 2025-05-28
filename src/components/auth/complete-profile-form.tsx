
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Removed: import { doc, setDoc, Timestamp, getDoc, serverTimestamp } from 'firebase/firestore';
// Removed: import { db } from '@/lib/firebase';
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
import type { UserProfile, Address } from '@/types'; // Import types
import { getMonth, getDate } from 'date-fns'; // Import date-fns helpers
// TODO: Import server action to update user profile in MySQL
// import { updateUserProfile } from '@/app/actions';

// Validation Schema using Zod
const profileSchema = z.object({
  first_name: z.string().min(2, { message: "نام باید حداقل ۲ حرف باشد." }),
  last_name: z.string().min(2, { message: "نام خانوادگی باید حداقل ۲ حرف باشد." }),
  national_id: z.string().regex(/^\d{10}$/, { message: "کد ملی باید ۱۰ رقم باشد." }).optional().or(z.literal('')), // Made optional
  secondary_phone: z.string().optional().refine(val => !val || /^09[0-9]{9}$/.test(val), {
    message: "شماره تماس دوم معتبر نیست (مثال: 09xxxxxxxxx)."
  }),
  birth_date: z.date({ required_error: "تاریخ تولد الزامی است." }),
  address: z.object({
    province: z.string().min(1, { message: "استان الزامی است." }),
    city: z.string().min(1, { message: "شهر الزامی است." }),
    full_address: z.string().min(10, { message: "آدرس کامل باید حداقل ۱۰ حرف باشد." }),
    postal_code: z.string().regex(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." }),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function CompleteProfileForm() {
  const { user, userData: initialUserData, loading: authLoading, checkAuthState } = useAuth(); // Get checkAuthState to refresh context
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/'; // Get redirect path or default to home

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

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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

   // Pre-fill form if user data exists (e.g., editing profile)
   useEffect(() => {
    if (initialUserData) {
        form.reset({
            first_name: initialUserData.first_name || '',
            last_name: initialUserData.last_name || '',
            national_id: initialUserData.national_id || '',
            secondary_phone: initialUserData.secondary_phone || '',
            birth_date: parseDate(initialUserData.birth_date), // Use helper
            address: {
                province: initialUserData.address?.province || '',
                city: initialUserData.address?.city || '',
                full_address: initialUserData.address?.full_address || '',
                postal_code: initialUserData.address?.postal_code || '',
            },
        });
     } else if (user && !authLoading) {
        form.reset(); // Reset to default if no initial data after auth load
     }
   }, [initialUserData, user, authLoading, form]);


  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    if (!user) {
      toast({ title: "خطا", description: "برای ذخیره اطلاعات باید وارد شده باشید.", variant: "destructive" });
      router.push('/auth'); // Redirect to login if not authenticated
      return;
    }

    setLoading(true);
    try {

        // Calculate birthMonth and birthDay
        const birthMonth = getMonth(data.birth_date) + 1; // 1-12
        const birthDay = getDate(data.birth_date); // 1-31

        // Format birth_date for MySQL (YYYY-MM-DD)
        const birthDateForDB = data.birth_date.toISOString().split('T')[0];

        const profileDataToSave: Partial<UserProfile> & { uid: string } = {
            uid: user.uid, // Include UID for the update action
            first_name: data.first_name,
            last_name: data.last_name,
            national_id: data.national_id || null,
            secondary_phone: data.secondary_phone || null,
            birth_date: birthDateForDB, // Save formatted date string
            birth_month: birthMonth,
            birth_day: birthDay,
            // Store address as JSON string for simplicity, or adapt action to handle object
            address: data.address, // Pass the object, let the action handle serialization if needed
            is_profile_complete: true, // Mark profile as complete
             // profile_updated_at will be handled by the server action (NOW())
        };

      // --- TODO: Call the actual server action to update MySQL ---
      // const result = await updateUserProfile(profileDataToSave);

      // --- Placeholder Logic ---
      console.log("Profile data to save:", profileDataToSave);
      await new Promise(res => setTimeout(res, 1000)); // Simulate API call
      const result = { success: true }; // Assume success for now
      // --- End Placeholder ---


      if (result.success) {
        toast({ title: "موفقیت", description: "اطلاعات شما با موفقیت ذخیره شد." });
        await checkAuthState(); // Refresh user data in context
        router.push(redirectTo); // Redirect to original destination or home
      } else {
        // toast({ title: "خطا", description: result.error || "خطا در ذخیره اطلاعات.", variant: "destructive" });
        toast({ title: "خطا", description: "خطا در ذخیره اطلاعات (شبیه‌سازی).", variant: "destructive" });
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
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: علی" {...field} disabled={loading} />
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
                      <Input placeholder="مثال: محمدی" {...field} disabled={loading} />
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
                      <Input type="text" inputMode='numeric' maxLength={10} placeholder="۰۰۱۲۳۴۵۶۷۸" {...field} disabled={loading} dir="ltr" className="text-left" />
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
                      <Input type="tel" placeholder="09xxxxxxxxx" {...field} disabled={loading} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2"> {/* Adjusted padding for alignment */}
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
                            <CalendarIcon className="ml-2 h-4 w-4" /> {/* Icon on the left for RTL */}
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
                           disabled={(date) =>
                             date > new Date() || date < new Date("1900-01-01") || loading
                           }
                           defaultMonth={field.value || new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // Default to 18 years ago
                           captionLayout="dropdown-buttons" // Enable year/month dropdowns
                           fromYear={1920} // Example start year
                           toYear={new Date().getFullYear()} // Example end year
                           initialFocus
                           dir="rtl" // Ensure calendar is RTL
                          // locale={{locale: 'fa'}} // Locale needs to be configured in react-day-picker setup
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Information */}
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
                           {/* TODO: Replace with a Select component populated with provinces */}
                          <Input placeholder="مثال: تهران" {...field} disabled={loading} />
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
                           {/* TODO: Replace/Enhance with a Select component dependent on province */}
                          <Input placeholder="مثال: تهران" {...field} disabled={loading} />
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
                      <Input placeholder="خیابان، کوچه، پلاک، واحد" {...field} disabled={loading} />
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
                      <Input type="text" inputMode='numeric' maxLength={10} placeholder="۱۲۳۴۵۶۷۸۹۰" {...field} disabled={loading} dir="ltr" className="text-left" />
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

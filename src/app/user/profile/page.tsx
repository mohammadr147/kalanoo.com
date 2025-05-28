
'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Added Suspense
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Label is already imported in Form component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import type { UserProfile } from '@/types';
import { UpdateUserProfileSchema } from '@/types'; // Import schema from types
import { updateUserProfile } from '@/app/actions'; // Import server action
import { getMonth, getDate } from 'date-fns';

// Use the UpdateUserProfileSchema for form validation, but adapt for client-side Date object
const userProfilePageSchema = UpdateUserProfileSchema.extend({
    birth_date: z.date().optional().nullable(), // Expect Date object from Calendar
    address: z.object({ // Expect Address object
        province: z.string().min(1, { message: "استان الزامی است." }),
        city: z.string().min(1, { message: "شهر الزامی است." }),
        full_address: z.string().min(10, { message: "آدرس کامل باید حداقل ۱۰ حرف باشد." }),
        postal_code: z.string().regex(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." }),
    }).optional().nullable(),
    // We don't need uid in form data, it comes from auth context
}).omit({ uid: true, profile_image_data_url: true, is_profile_complete: true, birth_month: true, birth_day: true });


type UserProfilePageFormData = z.infer<typeof userProfilePageSchema>;


export default function UserProfilePage() {
  const { toast } = useToast();
  const { user, userData: initialUserData, loading: authLoading, checkAuthState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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

  const form = useForm<UserProfilePageFormData>({
    resolver: zodResolver(userProfilePageSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      national_id: '',
      email: '',
      secondary_phone: '',
      birth_date: undefined,
      address: { province: '', city: '', full_address: '', postal_code: '' },
    },
  });

    useEffect(() => {
        if (initialUserData) {
             setPreviewImageUrl(initialUserData.profile_image_url || null);
             form.reset({
                first_name: initialUserData.first_name || '',
                last_name: initialUserData.last_name || '',
                national_id: initialUserData.national_id || '',
                email: initialUserData.email || '',
                secondary_phone: initialUserData.secondary_phone || '',
                birth_date: parseDate(initialUserData.birth_date),
                address: initialUserData.address ? {
                    province: initialUserData.address.province || '',
                    city: initialUserData.address.city || '',
                    full_address: initialUserData.address.full_address || '',
                    postal_code: initialUserData.address.postal_code || '',
                } : { province: '', city: '', full_address: '', postal_code: '' },
             });
        } else {
            form.reset();
            setPreviewImageUrl(null);
        }
   }, [initialUserData, form]);


   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageUrl(reader.result as string);
                // No need to form.setValue for 'profilePicture' as it's handled by profile_image_data_url in submit
            };
            reader.readAsDataURL(file);
        }
    };

   const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return `${first}${last}`.toUpperCase() || '?';
   };


  const onSubmit: SubmitHandler<UserProfilePageFormData> = async (data) => {
      if (!user) {
          toast({ title: "خطا", description: "شما وارد نشده‌اید.", variant: "destructive" });
          return;
      }
    setLoading(true);

    const profileDataToUpdate: z.infer<typeof UpdateUserProfileSchema> = {
         uid: user.uid,
         first_name: data.first_name,
         last_name: data.last_name,
         national_id: data.national_id || null,
         email: data.email || null,
         secondary_phone: data.secondary_phone || null,
         birth_date: data.birth_date ? data.birth_date.toISOString().split('T')[0] : null,
         birth_month: data.birth_date ? getMonth(data.birth_date) + 1 : null,
         birth_day: data.birth_date ? getDate(data.birth_date) : null,
         address: data.address ? JSON.stringify(data.address) : null,
         profile_image_data_url: previewImageUrl && previewImageUrl.startsWith('data:image') ? previewImageUrl : null,
         // is_profile_complete will be handled by server action if needed or set based on fields
    };

    try {
        const result = await updateUserProfile(profileDataToUpdate);
        if (result.success) {
          toast({ title: "موفقیت", description: "اطلاعات پروفایل شما با موفقیت به‌روز شد." });
          await checkAuthState();
          if (result.user?.profile_image_url) { // If server returned a new URL (after saving)
            setPreviewImageUrl(result.user.profile_image_url);
          }
        } else {
          toast({ title: "خطا", description: result.error || "خطا در به‌روزرسانی اطلاعات. لطفاً دوباره تلاش کنید.", variant: "destructive" });
        }
    } catch(e) {
         toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور رخ داده است.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

   if (authLoading && !initialUserData) { // Show loader only if initial data is not yet available
       return (
         <div className="flex justify-center items-center h-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       );
   }

    if (!user && !authLoading) { // If auth is done loading and still no user
         return (
             <Card className="w-full max-w-4xl mx-auto">
                 <CardHeader>
                     <CardTitle>ویرایش پروفایل</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-center text-muted-foreground">
                         برای ویرایش پروفایل، لطفاً ابتدا وارد شوید.
                     </p>
                 </CardContent>
             </Card>
         );
     }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>ویرایش پروفایل کاربری</CardTitle>
        <CardDescription>اطلاعات شخصی و آدرس خود را می‌توانید در این بخش ویرایش کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={previewImageUrl || undefined} alt="عکس پروفایل" />
                    <AvatarFallback className="text-2xl">
                        {getInitials(form.getValues('first_name'), form.getValues('last_name'))}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <FormLabel htmlFor="profile-picture-upload">تغییر عکس پروفایل</FormLabel>
                    <div className="flex items-center gap-2 mt-1">
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                            id="profile-picture-upload"
                            disabled={loading}
                        />
                        <Label
                            htmlFor="profile-picture-upload"
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "cursor-pointer",
                                loading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Upload className="ml-2 h-4 w-4" />
                            انتخاب فایل
                        </Label>
                            {previewImageUrl && previewImageUrl !== initialUserData?.profile_image_url && (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                                عکس جدید انتخاب شد
                            </span>
                            )}
                    </div>
                    <FormMessage />
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormItem>
                 <FormLabel>شماره موبایل (غیرقابل تغییر)</FormLabel>
                 <FormControl>
                   <Input value={user?.phone || ''} disabled dir="ltr" className="text-left bg-muted" />
                 </FormControl>
               </FormItem>
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل (اختیاری)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@domain.com" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام</FormLabel>
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
                    <FormLabel>نام خانوادگی</FormLabel>
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
                    <FormLabel>تاریخ تولد</FormLabel>
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
                           selected={field.value || undefined}
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
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">اطلاعات آدرس</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="address.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>استان</FormLabel>
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
                        <FormLabel>شهر</FormLabel>
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
                    <FormLabel>آدرس کامل</FormLabel>
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
                    <FormLabel>کد پستی</FormLabel>
                    <FormControl>
                      <Input type="text" inputMode='numeric' maxLength={10} placeholder="۱۲۳۴۵۶۷۸۹۰" {...field} value={field.value || ''} disabled={loading} dir="ltr" className="text-left" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <Separator />
            <div className="flex justify-end">
                <Button type="submit" disabled={loading || authLoading} size="lg">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  ذخیره تغییرات
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

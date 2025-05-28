
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context'; // Import useAuth
// Removed: import { Timestamp } from 'firebase/firestore'; // No longer needed
// TODO: Import server action to update profile in MySQL
// import { updateUserProfile } from '@/app/actions';
import type { UserProfile } from '@/types'; // Import types
import { buttonVariants } from '@/components/ui/button'; // Import buttonVariants for styling label

// Validation Schema using Zod
const profileSchema = z.object({
  first_name: z.string().min(2, { message: "نام باید حداقل ۲ حرف باشد." }),
  last_name: z.string().min(2, { message: "نام خانوادگی باید حداقل ۲ حرف باشد." }),
  national_id: z.string().regex(/^\d{10}$/, { message: "کد ملی باید ۱۰ رقم باشد." }).optional().or(z.literal('')),
  email: z.string().email({ message: "ایمیل نامعتبر است." }).optional().or(z.literal('')),
  birth_date: z.date().optional().nullable(), // Optional Date object for picker
  address: z.object({
    province: z.string().min(1, { message: "استان الزامی است." }),
    city: z.string().min(1, { message: "شهر الزامی است." }),
    full_address: z.string().min(10, { message: "آدرس کامل باید حداقل ۱۰ حرف باشد." }),
    postal_code: z.string().regex(/^\d{10}$/, { message: "کد پستی باید ۱۰ رقم باشد." }),
  }),
  profilePicture: z.any().optional(), // Placeholder for file upload
});

type ProfileFormData = z.infer<typeof profileSchema>;


export default function UserProfilePage() {
  const { toast } = useToast();
  const { user, userData: initialUserData, loading: authLoading, checkAuthState } = useAuth(); // Get user data and check function
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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

    // Initialize preview image URL and form default values
    useEffect(() => {
        if (initialUserData) {
             setPreviewImageUrl(initialUserData.profile_image_url || null);
             form.reset({
                first_name: initialUserData.first_name || '',
                last_name: initialUserData.last_name || '',
                national_id: initialUserData.national_id || '',
                email: initialUserData.email || '',
                birth_date: parseDate(initialUserData.birth_date),
                address: {
                    province: initialUserData.address?.province || '',
                    city: initialUserData.address?.city || '',
                    full_address: initialUserData.address?.full_address || '',
                    postal_code: initialUserData.address?.postal_code || '',
                },
                profilePicture: undefined,
             });
        } else {
             // Reset form if user logs out or data isn't available initially
            form.reset();
            setPreviewImageUrl(null);
        }
   }, [initialUserData, /* form */]); // form dependency removed temporarily to avoid potential loops

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    // Default values are set in the useEffect hook now
  });


   // Handle profile picture selection
   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
            form.setValue('profilePicture', file);
        }
    };

   const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return `${first}${last}`.toUpperCase() || '?';
   };


  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
      if (!user) {
          toast({ title: "خطا", description: "شما وارد نشده‌اید.", variant: "destructive" });
          return;
      }
    setLoading(true);
    console.log("Form Data Submitted:", data);

    // --- TODO: Replace with actual API call to update user profile in MySQL ---
    // 1. Prepare data (handle file upload if 'profilePicture' is present -> requires backend logic)
    // 2. Send relevant fields (excluding profilePicture file) to your backend API endpoint (e.g., /api/user/profile)
    // 3. Handle response from the API (success or error)

    const profileDataToUpdate = {
         uid: user.uid,
         first_name: data.first_name,
         last_name: data.last_name,
         national_id: data.national_id || null,
         email: data.email || null,
         birth_date: data.birth_date ? data.birth_date.toISOString().split('T')[0] : null, // Format YYYY-MM-DD
         address: JSON.stringify(data.address), // Send address as JSON string
         // profile_image_url: '...' // Backend should handle upload and return URL
    };

    console.log("Data being sent to backend (excluding file):", profileDataToUpdate);

    // Example simulation
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Simulate success/error
    const isSuccess = Math.random() > 0.1; // 90% success chance

    if (isSuccess) {
      toast({ title: "موفقیت", description: "اطلاعات پروفایل شما با موفقیت به‌روز شد." });
      await checkAuthState(); // Refresh user data in context
    } else {
      toast({ title: "خطا", description: "خطا در به‌روزرسانی اطلاعات. لطفاً دوباره تلاش کنید.", variant: "destructive" });
    }
    setLoading(false);
  };

   if (authLoading) {
       return (
         <div className="flex justify-center items-center h-40">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       );
   }

    if (!user) {
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

            {/* Profile Picture Section */}
             <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={previewImageUrl || undefined} alt="عکس پروفایل" />
                    <AvatarFallback className="text-2xl">
                        {getInitials(form.getValues('first_name'), form.getValues('last_name'))}
                    </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={({ field }) => ( // field is not directly used for file input value
                    <FormItem className="flex-grow">
                      <FormLabel>تغییر عکس پروفایل (نیاز به پیاده‌سازی بک‌اند)</FormLabel>
                      <FormControl>
                         <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleFileChange}
                              className="hidden" // Hide default input
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <Separator />

            {/* Personal Information */}
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
                      <Input type="email" placeholder="example@domain.com" {...field} disabled={loading} dir="ltr" className="text-left"/>
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
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2"> {/* Adjusted padding for alignment */}
                    <FormLabel>تاریخ تولد (اختیاری)</FormLabel>
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
                           selected={field.value || undefined} // Pass undefined if null
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">اطلاعات آدرس *</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

             <Separator />

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} size="lg">
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

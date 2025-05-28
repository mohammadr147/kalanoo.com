
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for message
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { sendPromotionalSms } from '@/app/actions'; // Import the consolidated server action
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
} from "@/components/ui/alert-dialog";

// Validation Schema using Zod
const sendSmsSchema = z.object({
  message: z.string()
    .min(5, { message: "متن پیامک باید حداقل ۵ کاراکتر باشد." })
    .max(500, { message: "متن پیامک نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد." }), // Adjusted max length
  // targetGroup: z.enum(['all_users']).default('all_users'), // Keep for future expansion
});

type SmsFormData = z.infer<typeof sendSmsSchema>;

export function SmsSenderForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [smsCount, setSmsCount] = useState(1); // Track number of SMS parts

   // Persian SMS limits (approximate, check provider specifics)
   const PERSIAN_SMS_LIMIT_SINGLE = 70;
   const PERSIAN_SMS_LIMIT_MULTI = 67;

   const calculateSmsParts = (count: number) => {
       if (count <= PERSIAN_SMS_LIMIT_SINGLE) {
           return 1;
       }
       // Ceiling division for multipart SMS
       return Math.ceil(count / PERSIAN_SMS_LIMIT_MULTI);
   };

  const form = useForm<SmsFormData>({
    resolver: zodResolver(sendSmsSchema),
    defaultValues: {
      message: '',
      // targetGroup: 'all_users',
    },
  });

   // Update character count and SMS parts on message change
   const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
       const message = event.target.value;
       const count = message.length;
       setCharacterCount(count);
       setSmsCount(calculateSmsParts(count));
       form.setValue("message", message); // Ensure react-hook-form is updated
   };

  const onSubmit: SubmitHandler<SmsFormData> = async (data) => {
     // Confirmation dialog will handle the actual submission trigger
     console.log("Form data for confirmation:", data);
  };

   const handleActualSubmit = async () => {
    setLoading(true);
    const formData = form.getValues(); // Get latest form values

    try {
      // Call the server action with the validated data
      const result = await sendPromotionalSms({
          message: formData.message,
          targetGroup: 'all_users', // Hardcoded for now
      });

      if (result.success) {
        toast({
          title: "ارسال موفق",
          description: result.message || "پیامک‌ها با موفقیت برای ارسال صف شدند.",
          variant: "default",
           duration: 5000, // Show longer for success
        });
        form.reset(); // Clear the form on success
        setCharacterCount(0);
        setSmsCount(1);
      } else {
        toast({
          title: "خطا در ارسال",
          description: result.error || "مشکلی در ارسال پیامک‌ها رخ داد.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending SMS from form:", error);
      toast({
        title: "خطای پیش بینی نشده",
        description: "مشکلی در ارتباط با سرور رخ داده است.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
   };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>متن پیامک</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="پیام خود را اینجا بنویسید..."
                  className="min-h-[120px] resize-y"
                  {...field}
                  onChange={handleMessageChange} // Use custom handler
                  disabled={loading}
                />
              </FormControl>
               <FormDescription className="flex justify-between">
                    <span>تعداد کاراکتر: {characterCount}</span>
                    <span>تعداد بخش‌های پیامک: {smsCount} (هر بخش حدود ۷۰ کاراکتر فارسی)</span>
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TODO: Add Target Group Selection (when implemented) */}
        {/* <FormField ... name="targetGroup" ... /> */}

        {/* TODO: Add Scheduling Options (when implemented) */}
        {/* <FormField ... name="scheduledTime" ... /> */}

        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" className="w-full" disabled={loading || !form.formState.isValid}>
                    <Send className="ml-2 h-4 w-4" />
                    پیش نمایش و ارسال
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>تایید ارسال پیامک</AlertDialogTitle>
                    <AlertDialogDescription>
                         آیا از ارسال پیامک زیر به تمام کاربران مطمئن هستید؟ این عملیات قابل بازگشت نیست.
                         <div className="mt-4 p-3 border rounded bg-muted text-sm whitespace-pre-wrap break-words">
                            {form.getValues('message')}
                         </div>
                         <p className="mt-2 text-xs text-muted-foreground">
                             (تعداد بخش‌های پیامک: {smsCount})
                         </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>انصراف</AlertDialogCancel>
                    <AlertDialogAction onClick={handleActualSubmit} className="bg-primary hover:bg-primary/90" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        ارسال کن
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}

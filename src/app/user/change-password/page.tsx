
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
// NOTE: Replace with actual password change API call (non-Firebase)

// Validation Schema using Zod
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "رمز عبور فعلی الزامی است." }),
  newPassword: z.string().min(8, { message: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد." })
    // Add more complexity requirements if needed (e.g., regex for numbers, symbols)
    .regex(/[a-z]/, { message: "رمز عبور باید شامل حروف کوچک باشد." })
    .regex(/[A-Z]/, { message: "رمز عبور باید شامل حروف بزرگ باشد." })
    .regex(/[0-9]/, { message: "رمز عبور باید شامل عدد باشد." }),
  confirmPassword: z.string().min(1, { message: "تایید رمز عبور الزامی است." }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "رمز عبور جدید و تایید آن مطابقت ندارند.",
  path: ["confirmPassword"], // Apply error to confirmPassword field
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function UserChangePasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    setLoading(true);
    console.log("Change Password Data Submitted:", {
        currentPassword: '***', // Don't log actual passwords
        newPassword: '***',
        confirmPassword: '***'
    });

    // --- TODO: Replace with actual API call to change password ---
    // 1. Send data.currentPassword and data.newPassword to your backend API (e.g., /api/user/change-password)
    // 2. Backend verifies currentPassword against stored hash.
    // 3. Backend hashes newPassword and updates the user's record in MySQL.
    // 4. Backend returns success or error message.

    // Example simulation
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Simulate success/error (e.g., based on dummy check for current password)
    const isSuccess = data.currentPassword === 'Admin123@'; // WARNING: Dummy check, replace with backend logic

    if (isSuccess) {
      toast({ title: "موفقیت", description: "رمز عبور شما با موفقیت تغییر کرد." });
      form.reset(); // Reset form on success
    } else {
      toast({ title: "خطا", description: "رمز عبور فعلی نادرست است یا خطایی رخ داده.", variant: "destructive" });
        form.setError("currentPassword", { type: "manual", message: "رمز عبور فعلی نادرست است." });
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5"/>
            تغییر رمز عبور
        </CardTitle>
        <CardDescription>برای امنیت بیشتر، رمز عبور خود را به صورت دوره‌ای تغییر دهید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور فعلی *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور جدید *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                  </FormControl>
                   <FormMessage />
                   <p className="text-xs text-muted-foreground pt-1">حداقل ۸ کاراکتر، شامل حروف بزرگ و کوچک و عدد.</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکرار رمز عبور جدید *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              تغییر رمز عبور
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

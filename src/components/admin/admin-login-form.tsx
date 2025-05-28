
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loginAdmin } from '@/app/actions';
import { adminLoginSchema } from '@/types'; // Import from types

type LoginFormData = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setLoading(true);
    try {
      const result = await loginAdmin(data);

      if (result.success) {
        toast({ title: "ورود موفقیت آمیز بود" });
        router.push('/admin/dashboard');
      } else {
        toast({
          title: "خطا در ورود",
          description: result.error || "نام کاربری یا رمز عبور اشتباه است.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "خطای پیش بینی نشده",
        description: "مشکلی در سرور رخ داده است. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
       setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>ورود ادمین</CardTitle>
        <CardDescription>لطفاً نام کاربری و رمز عبور خود را وارد کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کاربری</FormLabel>
                  <FormControl>
                    <Input placeholder="admin" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              ورود
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

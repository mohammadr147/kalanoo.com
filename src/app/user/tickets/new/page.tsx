
'use client';

import { NewTicketForm } from '@/components/user/new-ticket-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewTicketPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>ارسال تیکت جدید</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">برای ارسال تیکت، لطفاً ابتدا وارد حساب کاربری خود شوید.</p>
          <Button asChild>
            <Link href="/auth?redirect=/user/tickets/new">ورود به حساب</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ارسال تیکت جدید</h1>
      <p className="text-muted-foreground">موضوع و پیام خود را برای تیم پشتیبانی ارسال کنید.</p>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>فرم ارسال تیکت</CardTitle>
          <CardDescription>لطفاً مشکل یا سوال خود را به طور واضح بیان کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewTicketForm userId={user.uid} />
        </CardContent>
      </Card>
    </div>
  );
}

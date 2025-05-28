
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wallet, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { fetchUserWalletData, requestWalletWithdrawal } from '@/app/actions';
import { WithdrawalRequestSchema } from '@/types'; // Import from types
import type { Transaction, UserProfile } from '@/types';

type WithdrawalFormData = z.infer<typeof WithdrawalRequestSchema>;

const formatDateTime = (dateTimeString: string): string => {
    try {
        const date = new Date(dateTimeString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tehran',
        };
        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        return dateTimeString;
    }
}

export default function UserWalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(WithdrawalRequestSchema),
    defaultValues: {
      amount: undefined,
      shabaNumber: '',
    },
  });

  const loadWalletData = async (userId: string) => {
    setLoadingData(true);
    setError(null);
    try {
      const result = await fetchUserWalletData(userId);
      if (result.success) {
        setBalance(result.balance ?? 0);
        setTransactions(result.transactions ?? []);
      } else {
        setError(result.error || "خطا در دریافت اطلاعات کیف پول.");
        toast({ title: "خطا", description: result.error || "خطا در دریافت اطلاعات کیف پول.", variant: "destructive" });
      }
    } catch (err) {
      setError("خطای پیش‌بینی نشده در ارتباط با سرور.");
      toast({ title: "خطای سرور", description: "مشکلی در دریافت اطلاعات کیف پول رخ داد.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadWalletData(user.uid);
    } else if (!authLoading) {
        setLoadingData(false); // Stop loading if user not logged in and auth check is done
    }
  }, [user, authLoading, toast]); // Removed toast from dep array to avoid re-fetch on toast change

  const handleWithdrawalSubmit: SubmitHandler<WithdrawalFormData> = async (data) => {
    if (!user?.uid) return;
    if (balance === null || data.amount > balance) {
        form.setError("amount", { type: "manual", message: "مبلغ درخواستی نمی‌تواند بیشتر از موجودی باشد." });
        return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const result = await requestWalletWithdrawal(user.uid, data);
      if (result.success) {
        toast({ title: "موفقیت", description: "درخواست تسویه حساب شما با موفقیت ثبت شد." });
        form.reset();
        if (user?.uid) loadWalletData(user.uid); // Refresh wallet data
      } else {
        toast({ title: "خطا", description: result.error || "خطا در ثبت درخواست تسویه.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "خطای سرور", description: "مشکلی در ثبت درخواست تسویه رخ داد.", variant: "destructive" });
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  if (authLoading || (loadingData && user)) { // Show loader if auth is loading OR if data is loading for an authenticated user
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !authLoading) {
    return <p className="text-center text-muted-foreground">برای مشاهده کیف پول، لطفاً ابتدا وارد شوید.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">کیف پول</h1>
      <p className="text-muted-foreground">موجودی حساب و تاریخچه تراکنش‌های خود را مشاهده کنید.</p>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">موجودی فعلی</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : error ? (
             <p className="text-destructive">{error}</p>
          ) : (
             <>
                 <div className="text-3xl font-bold mb-4">
                    {(balance ?? 0).toLocaleString('fa-IR')} تومان
                 </div>
                 <Separator className="my-4" />
                 <h3 className="text-lg font-semibold mb-3">درخواست تسویه حساب</h3>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleWithdrawalSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>مبلغ تسویه (تومان)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="مثال: 50000" {...field} disabled={isSubmittingWithdrawal} min="1" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shabaNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>شماره شبا (بدون IR)</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="123456789012345678901234" {...field} disabled={isSubmittingWithdrawal} dir="ltr" className="text-left" maxLength={24} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmittingWithdrawal || (balance ?? 0) <= 0 || !form.formState.isValid}>
                            {isSubmittingWithdrawal ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                            ثبت درخواست
                        </Button>
                    </form>
                 </Form>
                  <p className="text-xs text-muted-foreground mt-2">
                    (تسویه به شماره شبای وارد شده انجام خواهد شد. حداقل مبلغ تسویه طبق تنظیمات سایت است.)
                  </p>
             </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <History className="h-5 w-5"/>
                 تاریخچه تراکنش‌ها
              </CardTitle>
          </CardHeader>
          <CardContent>
             {loadingData && !error && ( // Show loader only if loading and no error
                 <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
             )}
             {!loadingData && error && <p className="text-center text-destructive">{error}</p>}
             {!loadingData && !error && (
                 <Table>
                    <TableCaption>آخرین تراکنش‌های کیف پول شما</TableCaption>
                    <TableHeader>
                        <TableRow>
                        <TableHead>نوع</TableHead>
                        <TableHead>مبلغ (تومان)</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>توضیحات</TableHead>
                        <TableHead>وضعیت</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <TableRow key={tx.id}>
                            <TableCell>
                                <span className={`flex items-center gap-1 ${tx.amount > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                    {tx.amount > 0 ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                    {tx.type}
                                </span>
                            </TableCell>
                            <TableCell className={`font-semibold ${tx.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {tx.amount.toLocaleString('fa-IR')}
                            </TableCell>
                            <TableCell>{formatDateTime(tx.created_at as string)}</TableCell>
                            <TableCell>{tx.description || '-'}</TableCell>
                            <TableCell>{tx.status || '-'}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                هیچ تراکنشی یافت نشد.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                 </Table>
             )}
          </CardContent>
      </Card>
    </div>
  );
}

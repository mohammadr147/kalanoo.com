
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, ArrowUpCircle, ArrowDownCircle, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
// NOTE: Replace with actual wallet data fetching and withdrawal request logic (non-Firebase)

// Placeholder Transaction Type
interface Transaction {
    id: string;
    type: 'واریز' | 'برداشت' | 'خرید' | 'پورسانت';
    amount: number;
    date: string; // Format: 'YYYY-MM-DD HH:mm:ss' or similar from MySQL
    description: string;
}

// Placeholder data
const walletBalance = 125000;
const dummyTransactions: Transaction[] = [
    { id: 't1', type: 'پورسانت', amount: 5000, date: '2024-05-05 10:00:00', description: 'پورسانت معرفی کاربر X' },
    { id: 't2', type: 'خرید', amount: -45000, date: '2024-05-04 11:30:00', description: 'خرید سفارش #ORD-12347' },
    { id: 't3', type: 'واریز', amount: 100000, date: '2024-05-01 09:00:00', description: 'افزایش اعتبار دستی' },
    { id: 't4', type: 'برداشت', amount: -25000, date: '2024-04-29 15:00:00', description: 'تسویه حساب به شماره شبا ...' },
    { id: 't5', type: 'پورسانت', amount: 10000, date: '2024-04-25 12:00:00', description: 'پورسانت معرفی کاربر Y' },
];

// Helper to format date/time
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch wallet data ---
    const fetchWalletData = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const response = await fetch('/api/user/wallet'); const data = await response.json();
            // setWalletBalance(data.balance);
            setTransactions(dummyTransactions); // Use dummy data
        } catch (err) {
            setError("خطا در دریافت اطلاعات کیف پول.");
        } finally {
            setLoading(false);
        }
    };
    fetchWalletData();
  }, []);

  const handleWithdrawalRequest = async () => {
    setIsWithdrawing(true);
    // --- TODO: Implement API call for withdrawal request ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    console.log("Withdrawal request initiated for amount:", walletBalance);
    // Handle success/error toast messages based on API response
    alert("درخواست تسویه حساب ثبت شد. (شبیه‌سازی)"); // Replace with toast
    setIsWithdrawing(false);
  };

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
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : error ? (
             <p className="text-destructive">{error}</p>
          ) : (
             <>
                 <div className="text-3xl font-bold mb-4">
                    {walletBalance.toLocaleString('fa-IR')} تومان
                 </div>
                  <Button
                      onClick={handleWithdrawalRequest}
                      disabled={isWithdrawing || walletBalance <= 0}
                  >
                      {isWithdrawing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                      درخواست تسویه حساب
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    (تسویه به شماره شبای ثبت شده در پروفایل انجام خواهد شد)
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
             {loading && (
                 <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
             )}
             {error && <p className="text-center text-destructive">{error}</p>}
             {!loading && !error && (
                 <Table>
                    <TableCaption>آخرین تراکنش‌های کیف پول شما</TableCaption>
                    <TableHeader>
                        <TableRow>
                        <TableHead>نوع</TableHead>
                        <TableHead>مبلغ (تومان)</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>توضیحات</TableHead>
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
                            <TableCell>{formatDateTime(tx.date)}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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


'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckSquare, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
// NOTE: Replace with actual cheque data fetching logic (non-Firebase)

// Placeholder Cheque Type
interface Cheque {
    id: string;
    orderNumber: string;
    checkNumber: string;
    bankName: string;
    dueDate: string; // Format: 'YYYY-MM-DD'
    amount: number;
    status: 'در حال بررسی' | 'تایید شده' | 'رد شده';
}

// Placeholder data
const dummyCheques: Cheque[] = [
    { id: 'c1', orderNumber: 'ORD-12346', checkNumber: '11223344', bankName: 'ملت', dueDate: '2024-06-15', amount: 250000, status: 'تایید شده' },
    { id: 'c2', orderNumber: 'ORD-12346', checkNumber: '55667788', bankName: 'ملی', dueDate: '2024-07-15', amount: 250000, status: 'در حال بررسی' },
    { id: 'c3', orderNumber: 'ORD-12350', checkNumber: '99001122', bankName: 'صادرات', dueDate: '2024-08-01', amount: 800000, status: 'رد شده' },
    { id: 'c4', orderNumber: 'ORD-12355', checkNumber: '33445566', bankName: 'تجارت', dueDate: '2024-09-10', amount: 400000, status: 'در حال بررسی' },
];

// Helper to get status badge variant and icon
const getStatusDetails = (status: Cheque['status']): { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType } => {
    switch (status) {
        case 'تایید شده': return { variant: 'default', icon: CheckCircle }; // Greenish
        case 'در حال بررسی': return { variant: 'secondary', icon: Clock }; // Yellowish
        case 'رد شده': return { variant: 'destructive', icon: XCircle }; // Red
        default: return { variant: 'outline', icon: CheckSquare };
    }
}

// Helper to format date
const formatDate = (dateString: string): string => {
     try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'Asia/Tehran',
        };
        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        return dateString;
    }
}


export default function UserChequesPage() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch user's cheques ---
    const fetchCheques = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const response = await fetch('/api/user/cheques'); const data = await response.json();
            setCheques(dummyCheques); // Use dummy data
        } catch (err) {
            setError("خطا در دریافت لیست چک‌ها.");
        } finally {
            setLoading(false);
        }
    };
    fetchCheques();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">مدیریت چک‌ها</h1>
      <p className="text-muted-foreground">لیست چک‌های ثبت شده برای سفارشات شما و وضعیت بررسی آن‌ها.</p>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                چک‌های ثبت شده
            </CardTitle>
        </CardHeader>
        <CardContent>
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span>در حال بارگذاری...</span>
                </div>
            )}
            {error && <p className="text-center text-destructive">{error}</p>}
            {!loading && !error && (
                <Table>
                    <TableCaption>وضعیت بررسی چک‌های شما</TableCaption>
                    <TableHeader>
                        <TableRow>
                        <TableHead>شماره سفارش</TableHead>
                        <TableHead>شماره چک</TableHead>
                        <TableHead>نام بانک</TableHead>
                        <TableHead>تاریخ سررسید</TableHead>
                        <TableHead>مبلغ (تومان)</TableHead>
                        <TableHead>وضعیت</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cheques.length > 0 ? (
                        cheques.map((cheque) => {
                            const { variant, icon: Icon } = getStatusDetails(cheque.status);
                            return (
                                <TableRow key={cheque.id}>
                                    <TableCell className="font-mono text-xs">{cheque.orderNumber}</TableCell>
                                    <TableCell className="font-mono text-xs">{cheque.checkNumber}</TableCell>
                                    <TableCell>{cheque.bankName}</TableCell>
                                    <TableCell>{formatDate(cheque.dueDate)}</TableCell>
                                    <TableCell>{cheque.amount.toLocaleString('fa-IR')}</TableCell>
                                    <TableCell>
                                        <Badge variant={variant} className="flex items-center gap-1 w-fit">
                                            <Icon className="h-3 w-3" />
                                            {cheque.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                             );
                            })
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                هیچ چکی برای نمایش وجود ندارد.
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

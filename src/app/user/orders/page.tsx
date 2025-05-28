
'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// NOTE: Replace with actual order fetching logic (non-Firebase)

// Placeholder Order Type (adjust based on actual data structure from MySQL)
interface Order {
    id: string;
    orderNumber: string;
    date: string; // Format: 'YYYY-MM-DD HH:mm:ss' or similar from MySQL
    paymentMethod: 'نقدی' | 'اقساطی' | 'چکی';
    status: 'در حال بررسی' | 'تایید شده' | 'ارسال شده' | 'لغو شده' | 'تحویل شده';
    totalAmount: number;
}

// Placeholder data - replace with actual data fetching
const dummyOrders: Order[] = [
    { id: '1', orderNumber: 'ORD-12345', date: '2024-05-01 10:30:00', paymentMethod: 'نقدی', status: 'تحویل شده', totalAmount: 150000 },
    { id: '2', orderNumber: 'ORD-12346', date: '2024-05-03 14:00:00', paymentMethod: 'چکی', status: 'تایید شده', totalAmount: 500000 },
    { id: '3', orderNumber: 'ORD-12347', date: '2024-05-04 09:15:00', paymentMethod: 'اقساطی', status: 'در حال بررسی', totalAmount: 1200000 },
    { id: '4', orderNumber: 'ORD-12348', date: '2024-05-05 11:00:00', paymentMethod: 'نقدی', status: 'ارسال شده', totalAmount: 85000 },
    { id: '5', orderNumber: 'ORD-12349', date: '2024-04-28 16:45:00', paymentMethod: 'نقدی', status: 'لغو شده', totalAmount: 200000 },
];

// Helper to get status badge variant
const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'تحویل شده': return 'default'; // Greenish
        case 'تایید شده':
        case 'ارسال شده': return 'secondary'; // Yellowish/Orangeish
        case 'در حال بررسی': return 'outline'; // Grayish
        case 'لغو شده': return 'destructive'; // Red
        default: return 'outline';
    }
}

// Helper to format date/time from MySQL format (example)
const formatDateTime = (dateTimeString: string): string => {
    try {
        const date = new Date(dateTimeString);
         // Use standard toLocaleDateString for Farsi date format
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Tehran', // Adjust timezone if needed
        };
        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateTimeString; // Return original string on error
    }
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' or specific status

  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch user orders from MySQL ---
    const fetchUserOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real app: const response = await fetch('/api/user/orders'); const data = await response.json();
            setOrders(dummyOrders); // Use dummy data for now
        } catch (err) {
            console.error("Error fetching user orders:", err);
            setError("خطا در دریافت لیست سفارشات.");
        } finally {
            setLoading(false);
        }
    };
    fetchUserOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">سفارشات من</h1>
      <p className="text-muted-foreground">لیست تمام سفارشات ثبت شده شما در کالانو.</p>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>فیلتر و جستجو</span>
                <Filter className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <Input
                placeholder="جستجو بر اساس شماره سفارش..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="وضعیت سفارش..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="در حال بررسی">در حال بررسی</SelectItem>
                    <SelectItem value="تایید شده">تایید شده</SelectItem>
                    <SelectItem value="ارسال شده">ارسال شده</SelectItem>
                    <SelectItem value="تحویل شده">تحویل شده</SelectItem>
                    <SelectItem value="لغو شده">لغو شده</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
      </Card>


      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>در حال بارگذاری سفارشات...</span>
        </div>
      )}

      {error && <p className="text-center text-destructive">{error}</p>}

      {!loading && !error && (
        <Table>
          <TableCaption>لیست سفارشات شما</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>تاریخ ثبت</TableHead>
              <TableHead>روش پرداخت</TableHead>
              <TableHead>مبلغ کل (تومان)</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                  <TableCell>{formatDateTime(order.date)}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>{order.totalAmount.toLocaleString('fa-IR')}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* TODO: Link to order detail page */}
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="sr-only">مشاهده جزئیات</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        هیچ سفارشی با این مشخصات یافت نشد.
                    </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import type { Order } from '@/types'; // Make sure Order type includes necessary fields
import { fetchOrders } from '@/app/actions'; // Import the action
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
import { Loader2, Eye } from 'lucide-react'; // Using Eye icon for View/Details
import { useToast } from '@/hooks/use-toast';
// Removed: import { Timestamp } from 'firebase/firestore'; // Import Timestamp for type checking

// Helper to get status badge variant
const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'delivered': return 'default'; // Greenish in default theme
        case 'processing':
        case 'shipped':
        case 'check_approved': return 'secondary'; // Yellowish/Orangeish
        case 'pending_confirmation':
        case 'check_pending': return 'outline'; // Grayish
        case 'cancelled':
        case 'payment_failed': return 'destructive'; // Red
        default: return 'outline';
    }
}

// Helper to translate status
const translateStatus = (status: Order['status']): string => {
    switch (status) {
        case 'pending_confirmation': return 'در انتظار تایید';
        case 'processing': return 'در حال پردازش';
        case 'shipped': return 'ارسال شده';
        case 'delivered': return 'تحویل داده شده';
        case 'cancelled': return 'لغو شده';
        case 'payment_failed': return 'پرداخت ناموفق';
         case 'check_pending': return 'چک در انتظار تایید';
         case 'check_approved': return 'چک تایید شده';
        default: return status;
    }
}

// Helper to format date/time from MySQL DATETIME string or Date object
const formatDateTime = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return '-';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Tehran', // Or appropriate timezone
        };
        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        // Attempt to return the original string if it exists
        return typeof dateInput === 'string' ? dateInput : 'تاریخ نامعتبر';
    }
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const result = await fetchOrders();
        if (result.success && result.orders) {
          setOrders(result.orders);
          setError(null);
        } else {
          setError(result.error || 'خطا در دریافت سفارشات.');
          toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست سفارشات.', variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
        toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات سفارشات رخ داد.', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [toast]); // Added toast to dependency array

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری سفارشات...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ سفارشی یافت نشد.</p>;
  }

  return (
    <Table>
      <TableCaption>لیست آخرین سفارشات ثبت شده</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>شناسه سفارش</TableHead>
          <TableHead>تاریخ ثبت</TableHead>
          <TableHead>مشتری (شناسه)</TableHead>
          <TableHead>مبلغ کل (تومان)</TableHead>
          <TableHead>روش پرداخت</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">{order.id}</TableCell>
            <TableCell>{formatDateTime(order.created_at)}</TableCell>
             {/* Assuming userId links to a user profile or phone is stored */}
             <TableCell>{order.user_id ? `${order.user_id.substring(0, 8)}...` : '-'}</TableCell> {/* Display User ID */}
            <TableCell>{order.total_amount.toLocaleString('fa-IR')}</TableCell>
            <TableCell>{order.payment_method}</TableCell> {/* TODO: Translate payment method */}
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {translateStatus(order.status)}
              </Badge>
            </TableCell>
             <TableCell>
                 {/* TODO: Implement View/Edit Order functionality */}
                 <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                     <Eye className="h-4 w-4 text-blue-600" />
                     <span className="sr-only">مشاهده جزئیات</span>
                 </Button>
             </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Ticket as TicketIcon, Eye } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchUserTickets } from '@/app/actions';
import type { Ticket, TicketStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const getStatusVariant = (status: TicketStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'open': return 'default'; // Green
        case 'pending_reply': return 'secondary'; // Yellow/Orange
        case 'closed':
        case 'resolved': return 'outline'; // Gray
        default: return 'outline';
    }
};

const translateStatus = (status: TicketStatus): string => {
    switch (status) {
        case 'open': return 'باز';
        case 'pending_reply': return 'در انتظار پاسخ';
        case 'closed': return 'بسته شده';
        case 'resolved': return 'حل شده';
        default: return status;
    }
};

const formatDate = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return '-';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return String(dateInput);
    }
};


export default function UserTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.uid) {
      const loadTickets = async () => {
        setLoadingTickets(true);
        setError(null);
        try {
          const result = await fetchUserTickets(user.uid);
          if (result.success && result.tickets) {
            setTickets(result.tickets);
          } else {
            setError(result.error || 'خطا در دریافت لیست تیکت‌ها.');
            toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست تیکت‌ها.', variant: "destructive" });
          }
        } catch (err) {
          console.error("Error fetching user tickets:", err);
          setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
          toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات تیکت‌ها رخ داد.', variant: "destructive" });
        } finally {
          setLoadingTickets(false);
        }
      };
      loadTickets();
    } else if (!authLoading) {
      setLoadingTickets(false);
      setTickets([]); // Clear tickets if user logs out
    }
  }, [user, authLoading, toast]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تیکت‌های پشتیبانی</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">برای مشاهده یا ارسال تیکت، لطفاً ابتدا وارد شوید.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">تیکت‌های پشتیبانی</h1>
        <Button asChild>
          <Link href="/user/tickets/new">
            <PlusCircle className="ml-2 h-4 w-4" />
            ارسال تیکت جدید
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">لیست تیکت‌های ارسالی شما و وضعیت آن‌ها.</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            تیکت‌های شما
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>در حال بارگذاری تیکت‌ها...</span>
            </div>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : tickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              شما هنوز هیچ تیکتی ارسال نکرده‌اید.
            </p>
          ) : (
            <Table>
              <TableCaption>برای مشاهده جزئیات و پاسخ به تیکت روی دکمه مشاهده کلیک کنید.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>شناسه تیکت</TableHead>
                  <TableHead>موضوع</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>آخرین بروزرسانی</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">TICKET-{String(ticket.id).padStart(5, '0')}</TableCell>
                    <TableCell className="font-semibold">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ticket.status)}>
                        {translateStatus(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                    <TableCell>
                      {/* TODO: Link to individual ticket view page /user/tickets/[ticketId] */}
                      <Button variant="outline" size="sm" disabled>
                        <Eye className="ml-1 h-4 w-4" />
                        مشاهده
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

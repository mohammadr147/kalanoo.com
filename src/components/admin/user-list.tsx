
'use client';

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { fetchUsers } from '@/app/actions'; // Import the action
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
import { Loader2, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'; // Import icons
import { useToast } from '@/hooks/use-toast';
// Removed: import { Timestamp } from 'firebase/firestore'; // Import Timestamp for type checking
// TODO: Import AlertDialog if implementing delete confirmation


// Helper to format date/time from MySQL DATETIME string or Date object
const formatDate = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return '-';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: 'Asia/Tehran', // Or appropriate timezone
        };
        return date.toLocaleDateString('fa-IR', options);
    } catch (e) {
        console.error("Error formatting date:", e);
         // Attempt to return the original string if it exists
        return typeof dateInput === 'string' ? dateInput : 'تاریخ نامعتبر';
    }
}

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // const [deletingId, setDeletingId] = useState<string | null>(null); // For delete loading state

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const result = await fetchUsers();
        if (result.success && result.users) {
          setUsers(result.users);
          setError(null);
        } else {
          setError(result.error || 'خطا در دریافت کاربران.');
          toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست کاربران.', variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
        toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات کاربران رخ داد.', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]); // Added toast to dependency array

  // TODO: Implement handleDelete function using a server action
  // const handleDelete = async (userId: string) => { ... };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری کاربران...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (users.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ کاربری یافت نشد.</p>;
  }

  return (
    <Table>
      <TableCaption>لیست کاربران ثبت‌نام شده</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>نام</TableHead>
          <TableHead>نام خانوادگی</TableHead>
          <TableHead>شماره موبایل</TableHead>
          <TableHead>کد معرف</TableHead>
          <TableHead>تاریخ ثبت‌نام</TableHead>
          <TableHead>پروفایل کامل</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.uid}>
            <TableCell>{user.first_name || '-'}</TableCell>
            <TableCell>{user.last_name || '-'}</TableCell>
            <TableCell>{user.phone || '-'}</TableCell>
            <TableCell className="font-mono text-xs">{user.referral_code || '-'}</TableCell>
            <TableCell>{formatDate(user.created_at)}</TableCell>
            <TableCell>
                {user.is_profile_complete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                )}
            </TableCell>
             {/* Placeholder for status */}
            <TableCell>
                {/* TODO: Implement actual status logic based on user.role or another field */}
                <Badge variant={user.role === 'blocked' ? 'destructive' : 'default'}>
                    {user.role === 'blocked' ? 'بلاک شده' : 'فعال'}
                </Badge>
            </TableCell>
            <TableCell className="space-x-1 space-x-reverse">
                 {/* TODO: Implement Edit functionality */}
                 <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                     <Pencil className="h-4 w-4 text-blue-600" />
                     <span className="sr-only">ویرایش</span>
                 </Button>
                  {/* TODO: Implement Delete functionality with confirmation */}
                 <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                      <Trash2 className="h-4 w-4 text-destructive" />
                     <span className="sr-only">حذف</span>
                 </Button>
             </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

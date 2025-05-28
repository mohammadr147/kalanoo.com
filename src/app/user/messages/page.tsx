
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mail, Bell, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// NOTE: Replace with actual message/notification fetching logic (non-Firebase)

// Placeholder Message Type
interface Message {
    id: string;
    title: string;
    content: string;
    date: string; // Format: 'YYYY-MM-DD HH:mm:ss' or similar
    isRead: boolean;
    type: 'admin' | 'promotion' | 'birthday' | 'notification'; // Example types
}

// Placeholder data
const dummyMessages: Message[] = [
    { id: 'm1', title: 'پیام مهم از مدیریت', content: 'لطفا جهت بررسی مدارک، با پشتیبانی تماس بگیرید.', date: '2024-05-06 10:00:00', isRead: false, type: 'admin' },
    { id: 'm2', title: 'تخفیف ویژه تابستانه!', content: 'تا ۳۰٪ تخفیف برای محصولات منتخب. کد: SUMMER30', date: '2024-05-05 14:00:00', isRead: true, type: 'promotion' },
    { id: 'm3', title: 'کالانو تولد شما را تبریک می‌گوید!', content: 'یک کد تخفیف ۱۰٪ به مناسبت تولدتان در حساب شما فعال شد. کد: BDAY10', date: '2024-05-04 08:00:00', isRead: false, type: 'birthday' },
    { id: 'm4', title: 'سفارش #ORD-12348 ارسال شد', content: 'بسته شما تحویل پست داده شد. کد رهگیری: 1234567890', date: '2024-05-05 11:30:00', isRead: true, type: 'notification' },
];

// Helper to format date/time
const formatDateTime = (dateTimeString: string): string => {
    try {
        const date = new Date(dateTimeString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long', // Use long month name
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

export default function UserMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch messages ---
    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const response = await fetch('/api/user/messages'); const data = await response.json();
            setMessages(dummyMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort newest first
        } catch (err) {
            setError("خطا در دریافت پیام‌ها و اعلان‌ها.");
        } finally {
            setLoading(false);
        }
    };
    fetchMessages();
  }, []);

    // TODO: Implement mark as read functionality
    const handleMarkAsRead = (messageId: string) => {
        console.log("Marking message as read:", messageId);
        // API call to mark as read
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg));
    };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">پیام‌ها و اعلان‌ها</h1>
      <p className="text-muted-foreground">آخرین پیام‌های ارسال شده از طرف کالانو و اعلان‌های مهم.</p>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>در حال بارگذاری...</span>
        </div>
      )}

      {error && (
         <Alert variant="destructive">
           <Info className="h-4 w-4" />
           <AlertTitle>خطا</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <Card key={message.id} className={!message.isRead ? 'border-primary border-l-4' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                       <CardTitle className="text-lg mb-1">{message.title}</CardTitle>
                       <span className="text-xs text-muted-foreground whitespace-nowrap pl-2">
                           {formatDateTime(message.date)}
                       </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{message.content}</p>
                  {!message.isRead && (
                     <div className="flex justify-end mt-2">
                         <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => handleMarkAsRead(message.id)}>
                             خوانده شد
                         </Button>
                     </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    هیچ پیام یا اعلان جدیدی وجود ندارد.
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

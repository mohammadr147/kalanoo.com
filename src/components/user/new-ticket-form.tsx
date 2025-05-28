
'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTicket } from '@/app/actions';
import { CreateTicketSchema } from '@/types'; // Import from types
import { useRouter } from 'next/navigation';

type NewTicketFormData = z.infer<typeof CreateTicketSchema>;

interface NewTicketFormProps {
  userId: string;
}

export function NewTicketForm({ userId }: NewTicketFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<NewTicketFormData>({
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      subject: '',
      initialMessage: '',
    },
  });

  const onSubmit: SubmitHandler<NewTicketFormData> = async (data) => {
    setLoading(true);
    try {
      const result = await createTicket(userId, data);
      if (result.success && result.ticketId) {
        toast({
          title: "تیکت با موفقیت ارسال شد",
          description: `شناسه تیکت شما: TICKET-${String(result.ticketId).padStart(5, '0')}`,
        });
        form.reset();
        router.push('/user/tickets');
      } else {
        toast({
          title: "خطا در ارسال تیکت",
          description: result.error || "مشکلی در ارسال تیکت رخ داد. لطفاً دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting new ticket:", error);
      toast({
        title: "خطای پیش بینی نشده",
        description: "مشکلی در سرور رخ داده است.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موضوع تیکت *</FormLabel>
              <FormControl>
                <Input placeholder="مثال: مشکل در پرداخت سفارش" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="initialMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>متن پیام *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="لطفاً مشکل یا سوال خود را به طور کامل شرح دهید..."
                  className="min-h-[150px]"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                هرچه جزئیات بیشتری ارائه دهید، سریع‌تر می‌توانیم به شما کمک کنیم.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          ارسال تیکت
        </Button>
      </form>
    </Form>
  );
}


'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createInfoPage, updateInfoPage } from '@/app/actions';
import type { InfoPage } from '@/types';
import { infoPageSchema } from '@/types'; // Import from types
import { DialogClose } from '@/components/ui/dialog';

type InfoPageFormData = z.infer<typeof infoPageSchema>;

interface InfoPageFormProps {
  page?: InfoPage;
  mode?: 'create' | 'edit';
  onFormSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export function InfoPageForm({ page, mode = 'create', onFormSubmitSuccess, onCancel }: InfoPageFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<InfoPageFormData>({
    resolver: zodResolver(infoPageSchema),
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      content: page?.content || '',
      meta_title: page?.meta_title || '',
      meta_description: page?.meta_description || '',
      is_active: page?.is_active ?? true,
    },
  });

  const onSubmit: SubmitHandler<InfoPageFormData> = async (data) => {
    setLoading(true);
    try {
      let result;
      if (mode === 'edit' && page?.id) {
        result = await updateInfoPage(page.id, data);
      } else {
        result = await createInfoPage(data);
      }

      if (result.success) {
        toast({ title: "موفقیت", description: `صفحه "${data.title}" با موفقیت ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} شد.` });
        form.reset();
        onFormSubmitSuccess?.();
      } else {
        toast({
          title: "خطا",
          description: result.error || `خطا در ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} صفحه.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving info page:", error);
      toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور رخ داده است.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان صفحه *</FormLabel>
              <FormControl>
                <Input placeholder="مثال: درباره ما" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>آدرس (Slug) *</FormLabel>
              <FormControl>
                 <Input placeholder="مثال: about-us" {...field} disabled={loading || mode === 'edit'} dir="ltr" className="text-left" />
              </FormControl>
               <FormDescription>
                 فقط حروف کوچک انگلیسی، اعداد و خط تیره (-). این آدرس بعد از ایجاد قابل تغییر نیست.
               </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>محتوای صفحه *</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="محتوای اصلی صفحه را اینجا وارد کنید... از HTML می‌توانید استفاده کنید."
                            className="min-h-[200px]"
                            {...field}
                            disabled={loading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
         />
        <hr />
        <h3 className="text-lg font-medium">تنظیمات سئو (اختیاری)</h3>
         <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان متا (برای موتورهای جستجو)</FormLabel>
              <FormControl>
                <Input placeholder="حداکثر ۶۰ کاراکتر" {...field} value={field.value ?? ''} disabled={loading} maxLength={60} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات متا (برای موتورهای جستجو)</FormLabel>
              <FormControl>
                 <Textarea
                    placeholder="خلاصه‌ای جذاب از محتوای صفحه (حداکثر ۱۶۰ کاراکتر)"
                    {...field}
                    value={field.value ?? ''}
                    disabled={loading}
                    maxLength={160}
                    rows={3}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <hr />
         <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                      <FormLabel>وضعیت نمایش صفحه</FormLabel>
                      <FormDescription>
                         آیا این صفحه در سایت نمایش داده شود؟
                      </FormDescription>
                  </div>
                  <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                  </FormControl>
                </FormItem>
            )}
         />
        <div className="flex justify-end gap-2">
             {onCancel ? (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>انصراف</Button>
             ) : (
                 <DialogClose asChild>
                     <Button type="button" variant="outline" id="close-page-dialog">انصراف</Button>
                 </DialogClose>
             )}
             <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === 'edit' ? 'ویرایش صفحه' : 'افزودن صفحه'}
             </Button>
         </div>
      </form>
    </Form>
  );
}


'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createBanner, updateBanner } from '@/app/actions';
import type { Banner } from '@/types';
import { BannerSchema } from '@/types'; // Import from types
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type BannerFormData = z.infer<typeof BannerSchema>;

interface BannerFormProps {
  banner?: Banner;
  mode: 'create' | 'edit';
  onFormSubmitSuccess: () => void;
  onCancel: () => void;
}

export function BannerForm({ banner, mode, onFormSubmitSuccess, onCancel }: BannerFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(banner?.image_url || null);
  const [previewMobileImageUrl, setPreviewMobileImageUrl] = useState<string | null>(banner?.mobile_image_url || null);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(BannerSchema),
    defaultValues: {
      title: banner?.title || '',
      description: banner?.description || '',
      image_url: banner?.image_url || '',
      mobile_image_url: banner?.mobile_image_url || '',
      link: banner?.link || '',
      order: banner?.order ?? 0,
      is_active: banner?.is_active ?? true,
    },
  });

   useEffect(() => {
    if (banner) {
      setPreviewImageUrl(banner.image_url || null);
      setPreviewMobileImageUrl(banner.mobile_image_url || null);
      form.reset({
        title: banner.title || '',
        description: banner.description || '',
        image_url: banner.image_url || '',
        mobile_image_url: banner.mobile_image_url || '',
        link: banner.link || '',
        order: banner.order ?? 0,
        is_active: banner.is_active ?? true,
      });
    }
  }, [banner, form]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fieldName: 'image_url' | 'mobile_image_url') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue(fieldName, dataUri, { shouldValidate: true });
        if (fieldName === 'image_url') {
          setPreviewImageUrl(dataUri);
        } else {
          setPreviewMobileImageUrl(dataUri);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<BannerFormData> = async (data) => {
    setLoading(true);
    try {
      let result;
      const payload = {
        ...data,
        title: data.title || null,
        description: data.description || null,
        mobile_image_url: data.mobile_image_url || null,
        link: data.link || null,
      };

      if (mode === 'edit' && banner?.id) {
        result = await updateBanner(Number(banner.id), payload);
      } else {
        result = await createBanner(payload);
      }

      if (result.success) {
        toast({ title: "موفقیت", description: `بنر با موفقیت ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} شد.` });
        onFormSubmitSuccess();
      } else {
        toast({
          title: "خطا",
          description: result.error || `خطا در ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} بنر.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving banner:", error);
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
              <FormLabel>عنوان بنر (اختیاری)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تخفیف ویژه تابستانه" {...field} value={field.value ?? ''} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات کوتاه (اختیاری)</FormLabel>
              <FormControl>
                <Textarea placeholder="مثال: تا ۵۰٪ تخفیف برای محصولات منتخب" {...field} value={field.value ?? ''} disabled={loading} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>تصویر بنر (دسکتاپ) *</FormLabel>
               <Input
                  id="image_url_upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleFileChange(e, 'image_url')}
                  className="hidden"
                  disabled={loading}
                />
                <Label
                    htmlFor="image_url_upload"
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "cursor-pointer w-full flex items-center gap-2 justify-center",
                        loading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Upload className="h-4 w-4" />
                    انتخاب تصویر دسکتاپ
                </Label>
               {previewImageUrl && (
                <div className="mt-2">
                    <Image src={previewImageUrl} alt="پیش نمایش تصویر دسکتاپ" width={200} height={100} className="rounded object-contain border aspect-video mx-auto" data-ai-hint="banner desktop preview"/>
                </div>
               )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobile_image_url"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>تصویر بنر (موبایل - اختیاری)</FormLabel>
              <Input
                  id="mobile_image_url_upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleFileChange(e, 'mobile_image_url')}
                  className="hidden"
                  disabled={loading}
                />
                <Label
                    htmlFor="mobile_image_url_upload"
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "cursor-pointer w-full flex items-center gap-2 justify-center",
                        loading && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Upload className="h-4 w-4" />
                    انتخاب تصویر موبایل
                </Label>
              <FormDescription>اگر خالی باشد، از تصویر دسکتاپ استفاده می‌شود.</FormDescription>
              {previewMobileImageUrl && (
                <div className="mt-2">
                    <Image src={previewMobileImageUrl} alt="پیش نمایش تصویر موبایل" width={150} height={150} className="rounded object-contain border aspect-square mx-auto" data-ai-hint="banner mobile preview"/>
                </div>
               )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>لینک مقصد (اختیاری)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/category/special-offers" {...field} value={field.value ?? ''} disabled={loading} dir="ltr" className="text-left" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ترتیب نمایش *</FormLabel>
              <FormControl>
                <Input type="number" inputMode="numeric" placeholder="0" {...field} disabled={loading} min="0" />
              </FormControl>
              <FormDescription>بنرها با ترتیب کمتر، بالاتر نمایش داده می‌شوند.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>وضعیت فعال بودن</FormLabel>
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
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            انصراف
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'edit' ? 'ویرایش بنر' : 'افزودن بنر'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

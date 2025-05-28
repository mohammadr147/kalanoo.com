
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
import { createProduct, updateProduct, fetchCategoriesForForm } from '@/app/actions';
import type { Product, Category } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

const productFormSchema = z.object({
  name: z.string().min(3, "نام محصول باید حداقل ۳ کاراکتر باشد."),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive("قیمت نقدی باید مثبت باشد."),
  installment_price: z.coerce.number().positive("قیمت اقساطی باید مثبت باشد.").optional().nullable(),
  check_price: z.coerce.number().positive("قیمت چکی باید مثبت باشد.").optional().nullable(),
  original_price: z.coerce.number().positive("قیمت اصلی (قبل از تخفیف) باید مثبت باشد.").optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(100, "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.").optional().nullable(),
  image_url: z.string().optional().nullable(), // Will be base64 or existing URL
  category_id: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد.").default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
  onFormSubmitSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, mode, onFormSubmitSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(product?.image_url || null);
  const [categories, setCategories] = useState<Pick<Category, 'id' | 'name'>[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || undefined,
      installment_price: product?.installment_price || undefined,
      check_price: product?.check_price || undefined,
      original_price: product?.original_price || undefined,
      discount_percent: product?.discount_percent || undefined,
      image_url: product?.image_url || '',
      category_id: product?.category_id || undefined,
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      is_new: product?.is_new ?? false,
    },
  });

  useEffect(() => {
    async function loadCategories() {
      const result = await fetchCategoriesForForm();
      if (result.success && result.categories) {
        setCategories(result.categories);
      } else {
        toast({ title: "خطا", description: "خطا در بارگذاری دسته‌بندی‌ها.", variant: "destructive" });
      }
    }
    loadCategories();

    if (product) {
      setPreviewImageUrl(product.image_url || null);
      form.reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price || undefined,
        installment_price: product.installment_price || undefined,
        check_price: product.check_price || undefined,
        original_price: product.original_price || undefined,
        discount_percent: product.discount_percent || undefined,
        image_url: product.image_url || '',
        category_id: product.category_id || undefined,
        stock: product.stock ?? 0,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new: product.is_new ?? false,
      });
    }
  }, [product, form, toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('image_url', dataUri, { shouldValidate: true });
        setPreviewImageUrl(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setLoading(true);
    try {
      let result;
      const payload = {
        ...data,
         // Ensure null values are sent correctly
         installment_price: data.installment_price || null,
         check_price: data.check_price || null,
         original_price: data.original_price || null,
         discount_percent: data.discount_percent || null,
         category_id: data.category_id || null,
         description: data.description || null,
         image_url: data.image_url || null, // Will be base64 or URL
      };


      if (mode === 'edit' && product?.id) {
        result = await updateProduct(Number(product.id), payload);
      } else {
        result = await createProduct(payload);
      }

      if (result.success) {
        toast({ title: "موفقیت", description: `محصول با موفقیت ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} شد.` });
        onFormSubmitSuccess();
      } else {
        toast({ title: "خطا", description: result.error || `خطا در ${mode === 'edit' ? 'ویرایش' : 'ایجاد'} محصول.`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور رخ داده است.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام محصول *</FormLabel>
              <FormControl>
                <Input placeholder="مثال: گوشی هوشمند مدل Y" {...field} disabled={loading} />
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
              <FormLabel>توضیحات محصول (اختیاری)</FormLabel>
              <FormControl>
                <Textarea placeholder="توضیحات کامل محصول..." {...field} value={field.value ?? ''} disabled={loading} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />
        <h3 className="text-lg font-medium">قیمت‌گذاری و موجودی</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>قیمت نقدی *</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="15000000" {...field} disabled={loading} min="0" />
                    </FormControl>
                    <FormDescription>تومان</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="installment_price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>قیمت اقساطی (اختیاری)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="16000000" {...field} value={field.value ?? ''} disabled={loading} min="0" />
                    </FormControl>
                     <FormDescription>تومان</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="check_price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>قیمت چکی (اختیاری)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="15500000" {...field} value={field.value ?? ''} disabled={loading} min="0" />
                    </FormControl>
                     <FormDescription>تومان</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>قیمت اصلی (خط خورده - اختیاری)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="17000000" {...field} value={field.value ?? ''} disabled={loading} min="0" />
                    </FormControl>
                     <FormDescription>تومان</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="discount_percent"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>درصد تخفیف (اختیاری)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="10" {...field} value={field.value ?? ''} disabled={loading} min="0" max="100" step="1" />
                    </FormControl>
                    <FormDescription>%</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>موجودی انبار *</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="50" {...field} disabled={loading} min="0" step="1" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>

         <Separator />
         <h3 className="text-lg font-medium">دسته‌بندی و تصویر</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>دسته‌بندی (اختیاری)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={loading || categories.length === 0}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="انتخاب دسته‌بندی..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value=""><em>بدون دسته‌بندی</em></SelectItem>
                        {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

             <FormField
                control={form.control}
                name="image_url"
                render={({ field: { onChange, value, ...restField } }) => (
                    <FormItem>
                    <FormLabel>تصویر اصلی محصول (اختیاری)</FormLabel>
                    <Input
                        id="image_url_upload"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={(e) => handleFileChange(e)}
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
                            انتخاب تصویر محصول
                        </Label>
                    {previewImageUrl && (
                        <div className="mt-2">
                            <Image src={previewImageUrl} alt="پیش نمایش تصویر محصول" width={100} height={100} className="rounded object-contain border aspect-square mx-auto" data-ai-hint="product image preview"/>
                        </div>
                    )}
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
          {/* TODO: Add multi-image upload capability */}

        <Separator />
        <h3 className="text-lg font-medium">وضعیت نمایش</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>نمایش در سایت</FormLabel>
                    </div>
                    <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>محصول ویژه</FormLabel>
                    </div>
                    <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="is_new"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>محصول جدید</FormLabel>
                    </div>
                    <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                    </FormControl>
                </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background pb-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            انصراف
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'edit' ? 'ویرایش محصول' : 'افزودن محصول'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

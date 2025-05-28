
'use client';

import React, { useState, useEffect } from 'react';
import type { Category } from '@/types';
// import { fetchCategoriesAdmin } from '@/app/actions'; // TODO: Create this action
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
// TODO: Import AlertDialog for delete confirmation

// Dummy data until action is created
const dummyCategories: Category[] = [
    { id: 'cat1', name: 'لپ تاپ و کامپیوتر', description: 'انواع لپ تاپ، قطعات و لوازم جانبی', imageUrl: 'https://picsum.photos/seed/cat1/50/50' },
    { id: 'cat2', name: 'موبایل و تبلت', description: 'گوشی های هوشمند، تبلت ها و گجت ها', imageUrl: 'https://picsum.photos/seed/cat2/50/50' },
    { id: 'cat3', name: 'صوتی و تصویری', description: 'تلویزیون، هدفون، اسپیکر و سینمای خانگی', imageUrl: 'https://picsum.photos/seed/cat3/50/50' },
    { id: 'cat4', name: 'لوازم خانگی', description: 'یخچال، لباسشویی، جاروبرقی و ...', imageUrl: 'https://picsum.photos/seed/cat4/50/50' },
];


export function CategoryListAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // const [deletingId, setDeletingId] = useState<string | null>(null); // For delete loading state

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        // const result = await fetchCategoriesAdmin(); // TODO: Use the actual action when created
        // if (result.success && result.categories) {
        //   setCategories(result.categories);
        // } else {
        //   setError(result.error || 'خطا در دریافت دسته‌بندی‌ها.');
        //   toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست دسته‌بندی‌ها.', variant: "destructive" });
        // }
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setCategories(dummyCategories); // Use dummy data
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
        toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات دسته‌بندی‌ها رخ داد.', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [toast]);

  // TODO: Implement handleDelete function using a server action
  // const handleDelete = async (categoryId: string) => { ... };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری دسته‌بندی‌ها...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (categories.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ دسته‌بندی یافت نشد.</p>;
  }

  return (
    <Table>
      <TableCaption>لیست دسته‌بندی‌های محصولات</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>تصویر</TableHead>
          <TableHead>نام دسته‌بندی</TableHead>
          <TableHead>توضیحات</TableHead>
          {/* Add other relevant headers like Parent Category, Order */}
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <Image
                src={category.imageUrl || `https://picsum.photos/seed/defaultcat/50/50`}
                alt={category.name}
                width={50}
                height={50}
                className="rounded object-cover"
                 data-ai-hint="category image"
              />
            </TableCell>
            <TableCell className="font-semibold">{category.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{category.description || '-'}</TableCell>
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

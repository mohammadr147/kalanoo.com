
'use client';

import React, { useState, useEffect } from 'react';
// import type { LandingPage } from '@/types'; // TODO: Define LandingPage type
// import { fetchLandingPagesAdmin } from '@/app/actions'; // TODO: Create this action
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
import { Loader2, Pencil, Trash2, Link2, Eye } from 'lucide-react'; // Added Link2, Eye
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
// TODO: Import AlertDialog for delete confirmation

// Dummy LandingPage Type (adjust as needed)
interface LandingPage {
    id: string;
    title: string;
    slug: string; // e.g., 'summer-sale' becomes /landing/summer-sale
    imageUrl?: string;
    description?: string;
    ctaLink?: string;
    ctaText?: string;
    backgroundColor?: string; // Hex code
    isActive: boolean;
    createdAt: Date; // Or Timestamp
}

// Dummy data until action is created
const dummyLandingPages: LandingPage[] = [
    { id: 'lp1', title: 'کمپین عید نوروز', slug: 'nowruz-1404', createdAt: new Date('2025-03-10'), isActive: true, ctaText: 'مشاهده تخفیف‌ها', ctaLink: '/special-offers', backgroundColor: '#e0f2fe' },
    { id: 'lp2', title: 'معرفی محصول جدید X', slug: 'product-x-launch', createdAt: new Date('2025-04-15'), isActive: true, imageUrl: 'https://picsum.photos/seed/lp2/100/50' },
    { id: 'lp3', title: 'جشنواره پاییزه (غیرفعال)', slug: 'autumn-fest-2024', createdAt: new Date('2024-09-01'), isActive: false },
];


export function LandingPageListAdmin() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // const [deletingId, setDeletingId] = useState<string | null>(null); // For delete loading state

  useEffect(() => {
    const loadLandingPages = async () => {
      setLoading(true);
      try {
        // const result = await fetchLandingPagesAdmin(); // TODO: Use the actual action when created
        // if (result.success && result.landingPages) {
        //   setLandingPages(result.landingPages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())); // Sort newest first
        // } else {
        //   setError(result.error || 'خطا در دریافت لندینگ پیج‌ها.');
        //   toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست لندینگ پیج‌ها.', variant: "destructive" });
        // }
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setLandingPages(dummyLandingPages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())); // Use dummy data, sort
        setError(null);
      } catch (err) {
        console.error("Error fetching landing pages:", err);
        setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
        toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات لندینگ پیج‌ها رخ داد.', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    loadLandingPages();
  }, [toast]);

  // TODO: Implement handleDelete function using a server action
  // const handleDelete = async (landingPageId: string) => { ... };

   // Helper to format date
    const formatDate = (date: Date): string => {
        try {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
            return date.toLocaleDateString('fa-IR', options);
        } catch (e) {
            return 'تاریخ نامعتبر';
        }
    }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری لندینگ پیج‌ها...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (landingPages.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ لندینگ پیجی یافت نشد.</p>;
  }

  return (
    <Table>
      <TableCaption>لیست لندینگ پیج‌های تعریف شده</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>عنوان</TableHead>
          <TableHead>آدرس (Slug)</TableHead>
          <TableHead>تاریخ ایجاد</TableHead>
          <TableHead>وضعیت</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {landingPages.map((page) => (
          <TableRow key={page.id}>
            <TableCell className="font-semibold">{page.title}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">/landing/{page.slug}</TableCell>
            <TableCell>{formatDate(page.createdAt)}</TableCell>
             <TableCell>
              <Badge variant={page.isActive ? 'default' : 'outline'} className={page.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                {page.isActive ? 'فعال' : 'غیرفعال'}
              </Badge>
            </TableCell>
            <TableCell className="space-x-1 space-x-reverse">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                     <a href={`/landing/${page.slug}`} target="_blank" rel="noopener noreferrer" title="مشاهده صفحه">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="sr-only">مشاهده</span>
                    </a>
                 </Button>
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

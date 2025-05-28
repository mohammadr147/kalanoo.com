
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Banner } from '@/types';
import { fetchBannersAdmin, deleteBanner } from '@/app/actions';
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
import { Loader2, Pencil, Trash2, Link2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BannerForm } from './banner-form'; // Import the form

export function BannerListAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBannersAdmin();
      if (result.success && result.banners) {
        setBanners(result.banners.sort((a, b) => a.order - b.order));
      } else {
        setError(result.error || 'خطا در دریافت بنرها.');
        toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست بنرها.', variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
      toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات بنرها رخ داد.', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleDelete = async (bannerId: string | number, bannerTitle?: string | null) => {
     const idAsNumber = typeof bannerId === 'string' ? parseInt(bannerId, 10) : bannerId;
     if (isNaN(idAsNumber)) {
        toast({ title: "خطا", description: "شناسه بنر نامعتبر است.", variant: "destructive" });
        return;
     }
    setDeletingId(bannerId);
    try {
      const result = await deleteBanner(idAsNumber);
      if (result.success) {
        toast({ title: "موفقیت", description: `بنر "${bannerTitle || 'انتخابی'}" با موفقیت حذف شد.` });
        await loadBanners(); // Refresh the list
      } else {
        toast({ title: "خطا", description: result.error || "خطا در حذف بنر.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast({ title: "خطای سرور", description: 'مشکلی در حذف بنر رخ داد.', variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsEditDialogOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingBanner(null);
    loadBanners(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری بنرها...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (banners.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ بنری یافت نشد. برای افزودن، روی دکمه "افزودن بنر جدید" کلیک کنید.</p>;
  }

  return (
    <>
      <Table>
        <TableCaption>لیست بنرها و اسلایدرهای صفحه اصلی</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ترتیب</TableHead>
            <TableHead className="w-[120px]">تصویر</TableHead>
            <TableHead>عنوان</TableHead>
            <TableHead>لینک</TableHead>
            <TableHead className="w-[100px]">وضعیت</TableHead>
            <TableHead className="w-[120px]">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell className="font-mono">{banner.order}</TableCell>
              <TableCell>
                <Image
                  src={banner.image_url || `https://picsum.photos/seed/defaultbanner/100/50`}
                  alt={banner.title || `Banner ${banner.id}`}
                  width={100}
                  height={50}
                  className="rounded object-cover"
                  data-ai-hint="admin banner list image"
                />
              </TableCell>
              <TableCell className="font-semibold">{banner.title || '-'}</TableCell>
              <TableCell>
                {banner.link ? (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                    <Link2 className="h-3 w-3" />
                    {banner.link.length > 30 ? banner.link.substring(0, 30) + '...' : banner.link}
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={banner.is_active ? 'default' : 'outline'} className={banner.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {banner.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 space-x-reverse">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(banner)}>
                  <Pencil className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">ویرایش</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === banner.id}>
                      {deletingId === banner.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                      <span className="sr-only">حذف</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>آیا از حذف بنر مطمئن هستید؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        این عملیات قابل بازگشت نیست. بنر "{banner.title || 'انتخابی'}" برای همیشه حذف خواهد شد.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(banner.id, banner.title)} className="bg-destructive hover:bg-destructive/90">
                        حذف بنر
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>ویرایش بنر: {editingBanner?.title || 'بنر'}</DialogTitle>
            <DialogDescription>
              اطلاعات بنر را ویرایش کنید.
            </DialogDescription>
          </DialogHeader>
          {editingBanner && (
            <BannerForm
              mode="edit"
              banner={editingBanner}
              onFormSubmitSuccess={handleFormSubmitSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingBanner(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

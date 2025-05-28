
'use client';

import React, { useState, useEffect } from 'react';
import type { InfoPage } from '@/types'; // Import InfoPage type
import { fetchInfoPagesAdmin, deleteInfoPage } from '@/app/actions'; // Import actions
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
import { Loader2, Pencil, Trash2, Link2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InfoPageForm } from './info-page-form'; // Import the form for editing

// Helper to format date
const formatDate = (date: Date | string | undefined | null): string => {
    if (!date) return '-';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return dateObj.toLocaleDateString('fa-IR', options);
    } catch (e) {
        return 'تاریخ نامعتبر';
    }
}

export function PageListAdmin() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<InfoPage | null>(null); // State to hold page being edited
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // Control edit dialog visibility
  const { toast } = useToast();

  const loadPages = async () => {
      setLoading(true);
      try {
        const result = await fetchInfoPagesAdmin();
        if (result.success && result.pages) {
          setPages(result.pages.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'fa'))); // Sort alphabetically by title
          setError(null);
        } else {
          setError(result.error || 'خطا در دریافت صفحات.');
          toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست صفحات.', variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching info pages:", err);
        setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
        toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات صفحات رخ داد.', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadPages();
  }, [toast]);

  const handleDelete = async (pageId: number | undefined, pageTitle: string) => {
    if (pageId === undefined) {
        toast({ title: "خطا", description: "شناسه صفحه نامعتبر است.", variant: "destructive" });
        return;
    }
    setDeletingId(String(pageId));
    try {
        const result = await deleteInfoPage(pageId);
        if (result.success) {
            toast({ title: "موفقیت", description: `صفحه "${pageTitle}" با موفقیت حذف شد.` });
            // Refresh the list after deletion
            await loadPages();
        } else {
            toast({ title: "خطا", description: result.error || "خطا در حذف صفحه.", variant: "destructive" });
        }
    } catch (err) {
        console.error("Error deleting info page:", err);
        toast({ title: "خطای پیش بینی نشده", description: "مشکلی در سرور هنگام حذف صفحه رخ داده است.", variant: "destructive" });
    } finally {
        setDeletingId(null);
    }
   };

   const handleEdit = (page: InfoPage) => {
       setEditingPage(page);
       setIsEditDialogOpen(true);
   };

   const handleCloseEditDialog = (refreshNeeded: boolean) => {
       setIsEditDialogOpen(false);
       setEditingPage(null); // Clear editing state
       if (refreshNeeded) {
           loadPages(); // Reload pages if changes were made
       }
   };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری صفحات...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (pages.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ صفحه‌ای یافت نشد.</p>;
  }

  return (
    <>
      <Table>
        <TableCaption>لیست صفحات اطلاعاتی (مانند سوالات متداول، درباره ما)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان صفحه</TableHead>
            <TableHead>آدرس (Slug)</TableHead>
            <TableHead>تاریخ بروزرسانی</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-semibold">{page.title}</TableCell>
              <TableCell>
                 <a href={`/info/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs dir-ltr text-left">
                    <Link2 className="h-3 w-3"/>
                     /info/{page.slug}
                 </a>
              </TableCell>
               <TableCell>{formatDate(page.updated_at || page.created_at)}</TableCell>
               <TableCell>
                <Badge variant={page.is_active ? 'default' : 'outline'} className={page.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {page.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 space-x-reverse">
                   {/* Edit Button */}
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(page)}>
                       <Pencil className="h-4 w-4 text-blue-600" />
                       <span className="sr-only">ویرایش</span>
                   </Button>

                    {/* Delete Button */}
                   <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === String(page.id)}>
                            {deletingId === String(page.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                 <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                            <span className="sr-only">حذف</span>
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent dir="rtl">
                       <AlertDialogHeader>
                         <AlertDialogTitle>آیا از حذف صفحه مطمئن هستید؟</AlertDialogTitle>
                         <AlertDialogDescription>
                            این عملیات قابل بازگشت نیست. صفحه "{page.title}" برای همیشه حذف خواهد شد.
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(page.id, page.title)} className="bg-destructive hover:bg-destructive/90">
                              حذف صفحه
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
           <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                 <DialogTitle>ویرایش صفحه: {editingPage?.title}</DialogTitle>
                 <DialogDescription>
                    محتوا و تنظیمات صفحه را ویرایش کنید.
                 </DialogDescription>
              </DialogHeader>
               {editingPage && (
                   <InfoPageForm
                       mode="edit"
                       page={editingPage}
                       onFormSubmitSuccess={() => handleCloseEditDialog(true)} // Close and refresh on success
                       onCancel={() => handleCloseEditDialog(false)} // Just close on cancel
                    />
               )}
           </DialogContent>
         </Dialog>
    </>
  );
}

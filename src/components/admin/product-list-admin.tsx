
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';
import { fetchProductsAdmin, deleteProduct } from '@/app/actions'; // Import actions
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
import { Loader2, Pencil, Trash2, Check, X } from 'lucide-react'; // Added Check, X
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
import { ProductForm } from './product-form'; // Import the form for editing

export function ProductListAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProductsAdmin();
      if (result.success && result.products) {
        setProducts(result.products);
      } else {
        setError(result.error || 'خطا در دریافت محصولات.');
        toast({ title: "خطا", description: result.error || 'خطا در دریافت لیست محصولات.', variant: "destructive" });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError('خطای پیش‌بینی نشده در ارتباط با سرور.');
      toast({ title: "خطای سرور", description: 'مشکلی در دریافت اطلاعات محصولات رخ داد.', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (productId: string, productName: string) => {
     const idAsNumber = parseInt(productId, 10);
     if (isNaN(idAsNumber)) {
        toast({ title: "خطا", description: "شناسه محصول نامعتبر است.", variant: "destructive" });
        return;
     }
    setDeletingId(productId);
    try {
      const result = await deleteProduct(idAsNumber);
      if (result.success) {
        toast({ title: "موفقیت", description: `محصول "${productName}" با موفقیت حذف شد.` });
        await loadProducts(); // Refresh the list
      } else {
        toast({ title: "خطا", description: result.error || "خطا در حذف محصول.", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast({ title: "خطای سرور", description: 'مشکلی در حذف محصول رخ داد.', variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

   const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleFormSubmitSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    loadProducts(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span>در حال بارگذاری محصولات...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ محصولی یافت نشد. برای افزودن، روی دکمه "افزودن محصول جدید" کلیک کنید.</p>;
  }

  return (
    <>
      <Table>
        <TableCaption>لیست محصولات تعریف شده در فروشگاه</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">تصویر</TableHead>
            <TableHead>نام محصول</TableHead>
            <TableHead>دسته بندی</TableHead>
            <TableHead>قیمت (تومان)</TableHead>
            <TableHead>موجودی</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead className="w-[120px]">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Image
                  src={product.image_url || `https://picsum.photos/seed/${product.id}/50/50`}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded object-cover border"
                  data-ai-hint="admin product list image"
                />
              </TableCell>
              <TableCell className="font-semibold">{product.name}</TableCell>
              <TableCell>{product.category_name || '-'}</TableCell>
              <TableCell>
                {product.price.toLocaleString('fa-IR')}
                {product.discount_percent ? (
                  <Badge variant="secondary" className="mr-2 text-xs bg-primary/10 text-primary">
                      {product.discount_percent}%
                  </Badge>
                 ) : null}
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Badge variant={product.is_active ? 'default' : 'outline'} className={product.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {product.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 space-x-reverse">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                     <Pencil className="h-4 w-4 text-blue-600" />
                     <span className="sr-only">ویرایش</span>
                 </Button>
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="h-8 w-8" disabled={deletingId === product.id}>
                       {deletingId === product.id ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                       ) : (
                         <Trash2 className="h-4 w-4 text-destructive" />
                       )}
                       <span className="sr-only">حذف</span>
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent dir="rtl">
                     <AlertDialogHeader>
                       <AlertDialogTitle>آیا از حذف محصول مطمئن هستید؟</AlertDialogTitle>
                       <AlertDialogDescription>
                         این عملیات قابل بازگشت نیست. محصول "{product.name}" برای همیشه حذف خواهد شد.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>انصراف</AlertDialogCancel>
                       <AlertDialogAction onClick={() => handleDelete(product.id, product.name)} className="bg-destructive hover:bg-destructive/90">
                         حذف محصول
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
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>ویرایش محصول: {editingProduct?.name}</DialogTitle>
            <DialogDescription>
              اطلاعات محصول را ویرایش کنید.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              mode="edit"
              product={editingProduct}
              onFormSubmitSuccess={handleFormSubmitSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

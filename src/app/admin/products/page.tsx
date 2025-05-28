
'use client';

import { Suspense, useState, useCallback } from 'react';
import { Loader2, Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductListAdmin } from '@/components/admin/product-list-admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from '@/components/admin/product-form';

export default function AdminProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-fetch

  const handleFormSubmitSuccess = useCallback(() => {
    setIsCreateDialogOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت محصولات</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن محصول جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px]"> {/* Wider dialog for more fields */}
            <DialogHeader>
              <DialogTitle>افزودن محصول جدید</DialogTitle>
              <DialogDescription>
                اطلاعات محصول جدید را وارد کنید.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              mode="create"
              onFormSubmitSuccess={handleFormSubmitSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>در حال بارگذاری لیست محصولات...</span>
        </div>
      }>
        <ProductListAdmin key={refreshKey} />
      </Suspense>
    </div>
  );
}

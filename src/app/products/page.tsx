
import { Suspense } from 'react';
import { ProductList } from '@/components/product/product-list';
import { fetchAllActiveProductsClient } from '@/app/actions/client/fetch-products-client';
import type { Product } from '@/types';
import { Loader2, Filter, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

async function ProductsDisplay() {
  // TODO: Implement actual filtering and sorting based on query params or state
  const { products, error, total } = await fetchAllActiveProductsClient({ limit: 12 }); // Fetch initial 12 products

  if (error) {
    return <p className="text-center text-destructive col-span-full py-8">{error}</p>;
  }
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full py-8">محصولی برای نمایش یافت نشد.</p>;
  }

  return (
    <>
      <ProductList products={products} />
      {/* TODO: Add pagination if total > products.length */}
      {total && total > products.length && (
        <div className="mt-8 text-center">
          <Button variant="outline">مشاهده بیشتر (نمونه)</Button>
        </div>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">فروشگاه محصولات ما</h1>
        <p className="text-muted-foreground mt-2">آخرین محصولات و بهترین پیشنهادها را اینجا پیدا کنید.</p>
      </div>

      {/* Placeholder for Filters and Sorting */}
      <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="search-product" className="text-sm font-medium text-muted-foreground mb-1 block">جستجو</label>
            <Input id="search-product" placeholder="نام محصول را وارد کنید..." disabled />
          </div>
          <div>
            <label htmlFor="category-filter" className="text-sm font-medium text-muted-foreground mb-1 block">دسته‌بندی</label>
            <Select disabled>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="همه دسته‌بندی‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
                {/* TODO: Populate categories dynamically */}
                <SelectItem value="cat1">دسته‌بندی ۱ (نمونه)</SelectItem>
                <SelectItem value="cat2">دسته‌بندی ۲ (نمونه)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
             <label htmlFor="sort-order" className="text-sm font-medium text-muted-foreground mb-1 block">ترتیب نمایش</label>
            <Select disabled>
              <SelectTrigger id="sort-order">
                <SelectValue placeholder="جدیدترین" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
                <SelectItem value="price_desc">گران‌ترین</SelectItem>
                <SelectItem value="popular">محبوب‌ترین</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
         <div className="mt-4 text-center md:text-right">
            <Button variant="outline" disabled>
                <Filter className="ml-2 h-4 w-4" />
                اعمال فیلترها (نمونه)
            </Button>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">در حال بارگذاری محصولات...</p>
        </div>
      }>
        <ProductsDisplay />
      </Suspense>
    </div>
  );
}

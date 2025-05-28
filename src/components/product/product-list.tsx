'use client'; // Required because ProductCard is a Client Component

import type { Product } from '@/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground">هیچ محصولی یافت نشد.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

'use client'; // Required because ProductCard is a Client Component

import type { Product } from '@/types';
import { ProductCard } from './product-card';

interface RecommendationsProps {
  products: Product[];
}

export function Recommendations({ products }: RecommendationsProps) {
  if (!products || products.length === 0) {
    return null; // Don't render if no recommendations
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 text-center">محصولات پیشنهادی</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

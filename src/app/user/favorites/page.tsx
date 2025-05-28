
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for product details page
import { useToast } from '@/hooks/use-toast';
// Assuming Product type is available from types
import type { Product } from '@/types';
// Assuming useCart hook is available for adding to cart functionality
import { useCart } from '@/context/cart-context';
// NOTE: Replace with actual favorites fetching and removal logic (non-Firebase)

// Placeholder data - replace with actual data fetching
const dummyFavorites: Product[] = [
  { id: 'prod_4', name: 'هدفون بی سیم با نویز کنسلینگ', price: 3500000, imageUrl: 'https://picsum.photos/seed/prod_4/200/150' },
  { id: 'prod_6', name: 'دوربین دیجیتال DSLR', price: 31000000, imageUrl: 'https://picsum.photos/seed/prod_6/200/150' },
  { id: 'prod_1', name: 'گوشی هوشمند مدل X', price: 15000000, imageUrl: 'https://picsum.photos/seed/prod_1/200/150', originalPrice: 16500000, discountPercent: 9 },
];


export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart(); // Assuming useCart provides addToCart


  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch user favorites ---
    const fetchFavorites = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const response = await fetch('/api/user/favorites'); const data = await response.json();
            setFavorites(dummyFavorites); // Use dummy data
        } catch (err) {
            setError("خطا در دریافت لیست علاقه‌مندی‌ها.");
        } finally {
            setLoading(false);
        }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (productId: string) => {
    // --- TODO: Implement API call to remove favorite ---
    console.log("Removing favorite:", productId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setFavorites(prev => prev.filter(item => item.id !== productId));
    toast({ title: "موفقیت", description: "محصول از لیست علاقه‌مندی‌ها حذف شد." });
    // Handle potential errors from API call
  };

   const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "محصول به سبد خرید اضافه شد",
      description: product.name,
    });
    // Optionally remove from favorites after adding to cart
    // handleRemoveFavorite(product.id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">علاقه‌مندی‌ها</h1>
      <p className="text-muted-foreground">محصولاتی که به لیست علاقه‌مندی‌های خود اضافه کرده‌اید.</p>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>در حال بارگذاری...</span>
        </div>
      )}

      {error && <p className="text-center text-destructive">{error}</p>}

      {!loading && !error && (
        favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden">
                <CardHeader className="p-0 relative aspect-video">
                  <Link href={`/product/${product.id}`} legacyBehavior>
                     <a>
                       <Image
                          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`}
                          alt={product.name}
                          layout="fill" // Use fill layout for responsive image
                          objectFit="cover" // Cover the container
                          className="hover:opacity-90 transition-opacity"
                          data-ai-hint="favorite product image"
                        />
                     </a>
                   </Link>
                   {product.discountPercent && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                          {product.discountPercent}% تخفیف
                      </div>
                   )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-base font-semibold mb-1">
                    <Link href={`/product/${product.id}`} legacyBehavior>
                       <a className="hover:text-primary">{product.name}</a>
                    </Link>
                  </CardTitle>
                   <div className="flex items-center justify-between text-sm">
                       <span className="text-primary font-bold">
                           {product.price.toLocaleString('fa-IR')} تومان
                       </span>
                       {product.originalPrice && (
                           <span className="text-muted-foreground line-through text-xs">
                               {product.originalPrice.toLocaleString('fa-IR')} تومان
                           </span>
                       )}
                    </div>
                </CardContent>
                <CardFooter className="p-2 border-t grid grid-cols-2 gap-2">
                   <Button variant="outline" size="sm" onClick={() => handleRemoveFavorite(product.id)}>
                     <Trash2 className="ml-1 h-4 w-4" /> حذف
                   </Button>
                   <Button size="sm" onClick={() => handleAddToCart(product)}>
                     <ShoppingCart className="ml-1 h-4 w-4" /> افزودن به سبد
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
           <Card>
               <CardContent className="p-10 text-center text-muted-foreground">
                   <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    لیست علاقه‌مندی‌های شما خالی است.
               </CardContent>
           </Card>
        )
      )}
    </div>
  );
}

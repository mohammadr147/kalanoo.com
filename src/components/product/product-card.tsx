
'use client';

import type { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: "محصول به سبد خرید اضافه شد",
      description: product.name,
      // action: ( // Optional: Add action to view cart
      //   <ToastAction altText="مشاهده سبد">مشاهده سبد</ToastAction>
      // ),
    });
  };

  return (
    <Link href={`/product/${product.id}`} passHref legacyBehavior>
      <a className="block group h-full">
        <Card className="w-full h-full rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col border border-border/50 hover:border-primary/30">
          <CardHeader className="p-0 relative aspect-square overflow-hidden">
            <Image
              src={product.image_url || `https://placehold.co/400x400.png`}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="product placeholder"
            />
            {product.discount_percent && product.discount_percent > 0 && (
              <Badge
                variant="destructive"
                className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full z-10 bg-primary text-primary-foreground shadow"
              >
                {product.discount_percent}%
              </Badge>
            )}
             {product.is_new && (
                <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full z-10 bg-green-500 text-white shadow"
                >
                    جدید
                </Badge>
            )}
          </CardHeader>
          <CardContent className="p-3 md:p-4 flex-grow flex flex-col justify-between">
            <div>
              <CardTitle className="text-sm md:text-base font-medium leading-tight text-foreground mb-1 group-hover:text-primary transition-colors h-10 md:h-12 line-clamp-2">
                {product.name}
              </CardTitle>
              {/* Optional: Short description or category */}
              {product.category_name && (
                <p className="text-xs text-muted-foreground mb-2">{product.category_name}</p>
              )}
            </div>
            <div className="mt-2 text-left"> {/* Prices aligned to left for RTL */}
              <div className="flex items-baseline justify-end gap-2">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {product.original_price.toLocaleString('fa-IR')}
                  </span>
                )}
                <span className="text-primary font-bold text-base md:text-lg">
                  {product.price.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2 md:p-3 border-t bg-muted/30">
            <Button
              variant="default"
              className="w-full text-xs md:text-sm h-9 md:h-10 bg-primary/90 hover:bg-primary text-primary-foreground"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="ml-1.5 h-4 w-4" />
              افزودن به سبد
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}

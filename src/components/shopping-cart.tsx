'use client';

import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/cart-context';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react'; // Added CreditCard icon

export function ShoppingCart({ children }: { children: React.ReactNode }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4 space-y-1">
          <SheetTitle>سبد خرید</SheetTitle>
        </SheetHeader>
        <Separator />
        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="relative h-16 w-16 overflow-hidden rounded">
                        <Image
                          src={item.imageUrl || `https://picsum.photos/seed/${item.id}/100/100`}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                          data-ai-hint="cart item image"
                        />
                      </div>
                      <div className="flex flex-col self-start">
                        <span className="line-clamp-1 text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {item.price.toLocaleString('fa-IR')} تومان
                        </span>
                        <div className="flex items-center mt-2">
                           <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="mx-2 text-sm font-medium">{item.quantity}</span>
                           <Button
                             variant="outline"
                             size="icon"
                             className="h-6 w-6"
                             onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                             disabled={item.quantity <= 1}
                           >
                             <Minus className="h-3 w-3" />
                           </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">حذف محصول</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-4" />
            <SheetFooter className="px-4 space-y-4">
              <div className="flex items-center justify-between font-medium">
                <span>جمع کل:</span>
                <span>{totalAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex gap-2">
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">
                        ادامه خرید
                    </Button>
                  </SheetClose>
                  {/* Update button to link to checkout */}
                   <SheetClose asChild>
                     <Button asChild className="w-full" disabled={cart.length === 0}>
                       <Link href="/checkout">
                         <CreditCard className="ml-2 h-4 w-4" />
                         نهایی کردن خرید
                       </Link>
                     </Button>
                   </SheetClose>
              </div>
               <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                پاک کردن سبد خرید
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

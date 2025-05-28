
'use client';

import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import {
  ShoppingCart as ShoppingCartIcon,
  User,
  LogOut,
  FileText,
  Search,
  Heart,
  GitCompareArrows, // Using this as a stand-in for compare icon
  Menu,
  Youtube,
  Instagram,
  Send, // Using this as a stand-in for Telegram
  Facebook,
  Image as ImageIconLucide // Using this as a stand-in for Pinterest
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart } from '@/components/shopping-cart';
import { useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
// TODO: Import server action for user logout
// import { logoutUserAction } from '@/app/auth-actions';

// Placeholder for Mobile Menu component
function MobileMenu() {
   const { user, loading, userData, isUserProfileComplete, checkAuthState } = useAuth(); // Use custom context. userData included for getInitials
   const { toast } = useToast();
   const router = useRouter();

    const handleSignOut = async () => {
      try {
        // --- TODO: Replace with Server Action call for Logout ---
        // const result = await logoutUserAction();
        // if(result.success) {
        //     toast({ title: "خروج موفقیت آمیز بود." });
        //     await checkAuthState(); // Refresh auth state
        //     router.push('/'); // Redirect to home after logout
        // } else {
        //     toast({ title: "خطا در خروج", description: result.error || "مشکلی رخ داد.", variant: "destructive" });
        // }
        // --- Placeholder ---
         await new Promise(res => setTimeout(res, 500));
         toast({ title: "خروج موفقیت آمیز بود (شبیه‌سازی)." });
         await checkAuthState(); // Refresh auth state
         router.push('/');
        // --- End Placeholder ---
      } catch (error) {
        console.error("Error signing out: ", error);
        toast({ title: "خطا در خروج", variant: "destructive" });
      }
    };

    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return `${first}${last}`.toUpperCase() || <User className="h-5 w-5" />; // Default to User icon
    };


  return (
      <Sheet>
          <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">باز کردن منو</span>
              </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs p-4">
             <SheetClose asChild>
                <button className="absolute top-4 right-4 opacity-70 hover:opacity-100 outline-none">&times;</button>
             </SheetClose>
              <SheetHeader className="mb-4 border-b pb-4">
                  <SheetTitle>منو</SheetTitle>
              </SheetHeader>
               {/* Mobile Auth Section */}
               <div className="mb-4">
                    {loading ? (
                        <div className="flex items-center gap-2 p-2 rounded border animate-pulse">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ) : user ? (
                         <div className="flex items-center gap-2 p-2 rounded border">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={userData?.profile_image_url || undefined} alt="User Avatar" />
                                <AvatarFallback>{getInitials(userData?.first_name, userData?.last_name)}</AvatarFallback>
                             </Avatar>
                             <span className="text-sm font-medium truncate">
                                 {userData?.first_name || user.phone}
                             </span>
                         </div>
                     ) : (
                        <SheetClose asChild>
                            <Button className="w-full" onClick={() => router.push('/auth')}>
                            <User className="ml-2 h-4 w-4" />
                                ورود / ثبت نام
                            </Button>
                        </SheetClose>
                     )}
                </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                   <SheetClose asChild><Link href="/" className="block p-2 hover:bg-accent rounded">صفحه نخست</Link></SheetClose>
                   <SheetClose asChild><Link href="/products" className="block p-2 hover:bg-accent rounded">فروشگاه</Link></SheetClose>
                   {/* Placeholder for categories */}
                   <SheetClose asChild><Button variant="ghost" className="justify-start p-2">دسته‌بندی کالاها</Button></SheetClose>

                    {/* Add other top bar links if needed */}
                    <Separator className="my-2" />
                   <SheetClose asChild><Link href="/info/shipping" className="block p-2 text-sm text-muted-foreground hover:bg-accent rounded">شرایط ارسال</Link></SheetClose>
                   <SheetClose asChild><Link href="/info/faq" className="block p-2 text-sm text-muted-foreground hover:bg-accent rounded">سوالات متداول</Link></SheetClose>
                   <SheetClose asChild><Link href="/info/contact-us" className="block p-2 text-sm text-muted-foreground hover:bg-accent rounded">تماس با ما</Link></SheetClose>
                   <SheetClose asChild><Link href="/info/about-us" className="block p-2 text-sm text-muted-foreground hover:bg-accent rounded">درباره ما</Link></SheetClose>
                    <Separator className="my-2" />
                   {/* Mobile actions */}
                   <SheetClose asChild>
                        <Link href="/user/favorites" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                            <Heart className="h-4 w-4" /> علاقه‌مندی‌ها
                        </Link>
                   </SheetClose>
                   {/* <Link href="#" className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                       <GitCompareArrows className="h-4 w-4" /> مقایسه
                   </Link> */}

                   {user && (
                      <>
                        <Separator className="my-2" />
                         <SheetClose asChild><Link href="/user/dashboard" className="block p-2 hover:bg-accent rounded">داشبورد کاربری</Link></SheetClose>
                         {!isUserProfileComplete && (
                             <SheetClose asChild>
                                <Link href="/profile/complete" className="block p-2 text-destructive focus:text-destructive hover:bg-accent rounded">
                                    تکمیل اطلاعات
                                </Link>
                             </SheetClose>
                         )}
                         <SheetClose asChild>
                            <Button variant="ghost" className="justify-start p-2 text-destructive hover:text-destructive" onClick={handleSignOut}>
                                <LogOut className="ml-2 h-4 w-4" />
                                خروج از حساب
                            </Button>
                         </SheetClose>
                       </>
                   )}
              </nav>
          </SheetContent>
      </Sheet>
  );
}

// Placeholder Skeleton component for loading state
function Skeleton({ className }: { className?: string }) {
    return <div className={cn("bg-muted animate-pulse rounded", className)} />;
}

// Placeholder Separator component if not already defined
function Separator({ className }: { className?: string }) {
    return <div className={cn("h-px bg-border", className)} />;
}


export default function Header() {
  const { cart } = useCart();
  const { user, loading, userData, isUserProfileComplete, checkAuthState } = useAuth(); // Use custom context, userData for initials
  const { toast } = useToast();
  const router = useRouter();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSignOut = async () => {
    try {
         // --- TODO: Replace with Server Action call for Logout ---
         // const result = await logoutUserAction();
         // if(result.success) {
         //     toast({ title: "خروج موفقیت آمیز بود." });
         //     await checkAuthState(); // Refresh auth state
         //     router.push('/'); // Redirect to home after logout
         // } else {
         //     toast({ title: "خطا در خروج", description: result.error || "مشکلی رخ داد.", variant: "destructive" });
         // }
        // --- Placeholder ---
         await new Promise(res => setTimeout(res, 500));
         toast({ title: "خروج موفقیت آمیز بود (شبیه‌سازی)." });
         await checkAuthState(); // Refresh auth state
         router.push('/');
        // --- End Placeholder ---
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ title: "خطا در خروج", variant: "destructive" });
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || <User className="h-5 w-5" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">

      {/* 1. Top Bar */}
      <div className="bg-secondary text-secondary-foreground border-b hidden md:block">
        <div className="container flex h-10 items-center justify-between text-xs">
          {/* Right Links */}
          <nav className="flex gap-4 lg:gap-6">
            {/* Updated links based on provided text */}
            <Link href="/products" className="hover:text-primary transition-colors">فروشگاه اینترنتی</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">مجله</Link> {/* Assuming /blog for مجله */}
            <Link href="/user-content" className="hover:text-primary transition-colors">مطالب کاربران</Link> {/* Placeholder link */}
            <Link href="/consulting" className="hover:text-primary transition-colors">مشاوره</Link> {/* Placeholder link */}
            <Link href="/info/contact-us" className="hover:text-primary transition-colors">تماس با ما</Link>
            <Link href="/brands" className="hover:text-primary transition-colors">برندها</Link> {/* Placeholder link */}
          </nav>

          {/* Left Social Icons */}
          <div className="flex items-center gap-3">
             <Link href="#" aria-label="Pinterest" className="hover:text-primary transition-colors"><ImageIconLucide className="h-4 w-4" /></Link> {/* Placeholder */}
             <Link href="#" aria-label="YouTube" className="hover:text-primary transition-colors"><Youtube className="h-4 w-4" /></Link>
             <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram className="h-4 w-4" /></Link>
             <Link href="#" aria-label="Telegram" className="hover:text-primary transition-colors"><Send className="h-4 w-4" /></Link> {/* Placeholder */}
             <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="border-b">
        <div className="container flex h-20 items-center">
          {/* Right: Logo */}
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center">
              <Image
                src="/images/logo.png" // Path to your new logo
                alt="KalaNow Logo"
                width={40}      // Intrinsic width for aspect ratio calculation
                height={40}     // Intrinsic height for aspect ratio calculation
                className="h-10 w-10" // Tailwind classes for display size (e.g., 40px x 40px)
                priority        // Good for LCP elements like logos
              />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 mx-4 lg:mx-8 hidden md:flex justify-center">
            <div className="relative w-full max-w-lg">
              <Input
                type="search"
                placeholder="جستجوی محصولات..."
                className="h-10 pr-10 pl-4 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-md">
                <Search className="h-4 w-4 text-primary-foreground" />
                <span className="sr-only">جستجو</span>
              </Button>
            </div>
          </div>

          {/* Left: Actions & Auth */}
          <div className="flex items-center justify-end space-x-1 space-x-reverse ml-auto"> {/* Adjusted spacing */}
             {/* Auth Dropdown/Button - Hidden on smaller screens initially */}
             <div className="hidden md:flex items-center">
                 {loading ? (
                     <Button variant="ghost" size="icon" disabled>
                        <User className="h-5 w-5 animate-pulse" />
                     </Button>
                 ) : user ? (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-sm">
                               <Avatar className="h-6 w-6">
                                <AvatarImage src={userData?.profile_image_url || undefined} alt="User Avatar" />
                                <AvatarFallback>{getInitials(userData?.first_name, userData?.last_name)}</AvatarFallback>
                               </Avatar>
                               <span className="hidden lg:inline">{userData?.first_name || 'حساب کاربری'}</span>
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {user ? `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || user?.phone : 'حساب کاربری'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/user/dashboard')}>
                                <User className="ml-2 h-4 w-4" />
                                <span>پنل کاربری</span>
                            </DropdownMenuItem>
                             {!isUserProfileComplete && (
                                 <DropdownMenuItem onClick={() => router.push('/profile/complete')} className="text-destructive focus:text-destructive">
                                <FileText className="ml-2 h-4 w-4" />
                                <span>تکمیل اطلاعات</span>
                                 </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="ml-2 h-4 w-4" />
                                <span>خروج از حساب</span>
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
                 ) : (
                    <Button variant="ghost" onClick={() => router.push('/auth')} className="text-sm px-2 py-1">
                        <User className="ml-2 h-4 w-4" />
                        ورود / ثبت نام
                    </Button>
                 )}
                <Separator orientation="vertical" className="h-6 mx-2" /> {/* Vertical Separator */}
             </div>

            {/* Wishlist - Hidden on smaller screens initially */}
            <Button asChild variant="ghost" size="icon" aria-label="علاقه‌مندی‌ها" className="relative hidden md:inline-flex">
              <Link href="/user/favorites">
                 <Heart className="h-5 w-5" />
                 {/* TODO: Add actual wishlist count */}
                 {/* <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">0</Badge> */}
                 <span className="sr-only">علاقه‌مندی‌ها</span>
              </Link>
            </Button>

             {/* Compare - Hidden on smaller screens initially */}
             <Button variant="ghost" size="icon" aria-label="مقایسه" className="relative hidden md:inline-flex">
                 <GitCompareArrows className="h-5 w-5" />
                 {/* <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">0</Badge> */}
                 <span className="sr-only">مقایسه</span>
             </Button>

              {/* Shopping Cart - Always visible */}
             <ShoppingCart>
                 <Button variant="ghost" size="icon" aria-label="سبد خرید" className="relative flex items-center gap-1 px-2 py-1">
                    <ShoppingCartIcon className="h-5 w-5" />
                     {itemCount > 0 && (
                         <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
                             {itemCount}
                         </Badge>
                     )}
                     <span className="text-xs hidden sm:inline">{totalAmount.toLocaleString('fa-IR')} تومان</span>
                    <span className="sr-only">سبد خرید ({itemCount} محصول)</span>
                 </Button>
             </ShoppingCart>

             {/* Mobile Menu Trigger */}
             <MobileMenu />
          </div>
        </div>
      </div>

       {/* Mobile Search Bar - Visible only on smaller screens */}
       <div className="container py-2 border-b md:hidden">
          <div className="relative w-full">
             <Input
                type="search"
                placeholder="جستجوی محصولات..."
                className="h-10 pr-10 pl-4 text-sm border-border focus:border-primary focus:ring-1 focus:ring-primary"
             />
             <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 rounded-md">
                <Search className="h-4 w-4 text-primary-foreground" />
                <span className="sr-only">جستجو</span>
             </Button>
          </div>
       </div>


      {/* 3. Bottom Menu Bar */}
      <div className="bg-background border-b hidden md:block">
        <div className="container flex h-12 items-center justify-between">
          {/* Left Menu */}
          <nav className="flex items-center gap-4 lg:gap-6 text-sm">
             {/* Categories Dropdown/Button */}
             {/* TODO: Implement dropdown functionality */}
             <Button variant="ghost" className="px-3 py-1.5">
                 <Menu className="ml-2 h-4 w-4" />
                 دسته‌بندی کالاها
             </Button>
             <Separator orientation="vertical" className="h-6" />
             <Link href="/" className="hover:text-primary transition-colors font-medium">صفحه نخست</Link>
             {/* TODO: Add dropdown for "فروشگاه" */}
             <Link href="/products" className="hover:text-primary transition-colors">فروشگاه</Link>
          </nav>

          {/* Right: Daily Deals Button */}
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-1.5 text-sm h-auto">
            ٪ تخفیف‌های روز
          </Button>
        </div>
      </div>
    </header>
  );
}

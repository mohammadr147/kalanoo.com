
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BannerSlider } from '@/components/layout/banner-slider';
import { ProductList } from '@/components/product/product-list';
import { fetchAllActiveProductsClient, fetchFeaturedProductsClient } from '@/app/actions/client/fetch-products-client';
import { fetchActiveCategoriesClient } from '@/app/actions/client/fetch-categories-client';
import { Gift, Package, Tv, Sparkles, Zap, ChevronLeft, LucideIcon, ChefHat } from 'lucide-react';
import type { Product, Category } from '@/types';

interface GiftIdea {
  title: string;
  icon: LucideIcon;
  link: string;
  dataAiHint: string;
}

const giftIdeas: GiftIdea[] = [
  { title: 'جهیزیه کامل', icon: Package, link: '/gift-ideas/trousseau', dataAiHint: 'wedding gift home' },
  { title: 'لوازم ضروری آشپزخانه', icon: ChefHat, link: '/gift-ideas/kitchen-essentials', dataAiHint: 'kitchen appliance cooking' },
  { title: 'بهترین‌های صوتی و تصویری', icon: Tv, link: '/gift-ideas/audio-video', dataAiHint: 'television sound system' },
  { title: 'نظافت هوشمند خانه', icon: Sparkles, link: '/gift-ideas/smart-cleaning', dataAiHint: 'vacuum cleaner robot' },
  { title: 'لوازم کوچک و کاربردی', icon: Zap, link: '/gift-ideas/small-appliances', dataAiHint: 'toaster kettle' },
];

interface InfoBoxProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const infoBoxes: InfoBoxProps[] = [
    { icon: Package, title: "ارسال اکسپرس به سراسر کشور", description: "سفارشات شما در سریع‌ترین زمان ممکن به دستتان می‌رسد." },
    { icon: Zap, title: "تخفیف‌های روزانه و ویژه", description: "بهترین قیمت‌ها و پیشنهادات جذاب را از دست ندهید." },
    { icon: Gift, title: "ضمانت اصالت و کیفیت کالا", description: "با اطمینان کامل از کالانو خرید کنید." },
];


async function FeaturedProductsSection() {
  // Fetch more products to ensure variety, ProductList will limit display
  const { products, error } = await fetchFeaturedProductsClient({ limit: 8 });

  if (error) {
    console.error("HomePage - Error fetching featured products:", error);
    return <p className="text-center text-destructive col-span-full py-8">{error}</p>;
  }
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full py-8">محصول ویژه‌ای یافت نشد.</p>;
  }
  // Display only up to 4 featured products in this section
  return <ProductList products={products.slice(0, 4)} />;
}

async function NewestProductsSection() {
  const { products, error } = await fetchAllActiveProductsClient({ limit: 8, sortBy: 'created_at', sortOrder: 'DESC' });

  if (error) {
    console.error("HomePage - Error fetching newest products:", error);
    return <p className="text-center text-destructive col-span-full py-8">{error}</p>;
  }
  if (!products || products.length === 0) {
    return <p className="text-center text-muted-foreground col-span-full py-8">محصول جدیدی یافت نشد.</p>;
  }
  return <ProductList products={products} />;
}

async function CategoriesSection() {
    const { categories, error } = await fetchActiveCategoriesClient({ limit: 6, sortBy: 'order', sortOrder: 'ASC' });

    if (error) {
        console.error("HomePage - Error fetching categories:", error);
        return <p className="text-center text-destructive col-span-full py-8">{error}</p>;
    }
    if (!categories || categories.length === 0) {
        return <p className="text-center text-muted-foreground col-span-full py-8">دسته‌بندی یافت نشد.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map(category => (
                <Link href={`/products?category=${category.slug}`} key={category.id} legacyBehavior>
                    <a className="block group">
                        <Card className="text-center hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden h-full flex flex-col items-center justify-center p-3 md:p-4 shadow-sm border border-border/50 rounded-lg hover:border-primary/30">
                            {category.image_url ? (
                                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2">
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        layout="fill"
                                        objectFit="contain"
                                        className="group-hover:scale-105 transition-transform"
                                        data-ai-hint={category.slug || "category icon"}
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 md:w-20 md:h-20 mb-2 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                    <Package className="w-8 h-8" />
                                </div>
                            )}
                            <p className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{category.name}</p>
                        </Card>
                    </a>
                </Link>
            ))}
        </div>
    );
}


export default async function HomePage() {
  return (
    <div className="container mx-auto px-0 sm:px-4 space-y-10 md:space-y-16 py-8">
      {/* Main Banner Slider */}
      <section className="w-full">
        <Suspense fallback={<div className="w-full h-64 md:h-96 bg-muted rounded-lg animate-pulse flex items-center justify-center text-muted-foreground">در حال بارگذاری بنرها...</div>}>
            <BannerSlider />
        </Suspense>
      </section>

      {/* Info Boxes Section */}
      <section className="px-4 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {infoBoxes.map((box) => (
            <Card key={box.title} className="shadow-sm border-border/50 rounded-lg hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-4 md:p-5">
                <box.icon className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground">{box.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{box.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


      {/* Two Medium Banners */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 sm:px-0">
        <Link href="/products?category=large-kitchen-appliances" legacyBehavior>
          <a className="block rounded-lg overflow-hidden group">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow border-border/50">
              <CardContent className="p-0 relative aspect-[2.5/1]">
                <Image
                  src="https://placehold.co/600x240.png"
                  alt="جدیدترین یخچال‌فریزرها"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg group-hover:scale-105 transition-transform"
                  data-ai-hint="refrigerator kitchen"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col items-start justify-center p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">جدیدترین یخچال‌فریزرها</h3>
                  <p className="text-xs text-gray-200 mb-3">با فناوری‌های روز دنیا</p>
                  <Button variant="secondary" size="sm" className="text-xs">مشاهده مجموعه</Button>
                </div>
              </CardContent>
            </Card>
          </a>
        </Link>
        <Link href="/products?category=laundry-cleaning" legacyBehavior>
          <a className="block rounded-lg overflow-hidden group">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow border-border/50">
              <CardContent className="p-0 relative aspect-[2.5/1]">
                <Image
                  src="https://placehold.co/600x240.png"
                  alt="جشنواره ماشین‌های لباسشویی"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg group-hover:scale-105 transition-transform"
                  data-ai-hint="washing machine laundry"
                />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col items-start justify-center p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">جشنواره ماشین‌های لباسشویی</h3>
                  <p className="text-xs text-gray-200 mb-3">تا ۲۰٪ تخفیف ویژه</p>
                  <Button variant="secondary" size="sm" className="text-xs">مشاهده محصولات</Button>
                </div>
              </CardContent>
            </Card>
          </a>
        </Link>
      </section>

        {/* Categories Section */}
      <section className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">دسته‌بندی لوازم خانگی</h2>
          <Button variant="link" asChild className="text-sm text-primary hover:text-primary/80 px-0">
            <Link href="/categories">
              همه دسته‌بندی‌ها <ChevronLeft className="mr-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"><div className="h-32 bg-muted rounded-lg animate-pulse col-span-full"></div></div>}>
            <CategoriesSection />
        </Suspense>
      </section>

      {/* "پیشنهاد شگفت انگیز" Section */}
      <section className="bg-gradient-to-r from-primary/5 via-background to-primary/5 py-10 md:py-16 rounded-lg mx-0 sm:-mx-4 px-4 sm:px-8">
        <div className="container mx-auto px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <h2 className="text-2xl md:text-3xl font-bold text-right mb-6 text-primary">پیشنهاد شگفت انگیز لوازم خانگی</h2>
              <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="h-64 bg-muted rounded-lg animate-pulse col-span-full sm:col-span-2"></div></div>}>
                <FeaturedProductsSection />
              </Suspense>
            </div>
            <div className="lg:col-span-4 hidden lg:block relative aspect-[3/4.5] rounded-xl overflow-hidden shadow-lg group">
              <Image
                src="https://placehold.co/400x550.png"
                alt="بنر پیشنهاد شگفت انگیز لوازم خانگی"
                layout="fill"
                objectFit="cover"
                className="rounded-xl group-hover:scale-105 transition-transform"
                data-ai-hint="smart home appliances"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-end p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">لوازم خانگی هوشمند</h3>
                  <p className="text-sm text-gray-200 mb-4">زندگی آسان‌تر با تکنولوژی</p>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href="/amazing-offers">مشاهده همه</Link>
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </section>


      {/* "هدیه چی بدم؟" Section */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">ایده‌های هدیه لوازم خانگی</h2>
            <Button variant="link" asChild className="text-sm text-primary hover:text-primary/80 px-0">
                <Link href="/gift-ideas">
                    مشاهده همه <ChevronLeft className="mr-1 h-4 w-4" />
                </Link>
            </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {giftIdeas.map((idea) => (
            <Link href={idea.link} key={idea.title} legacyBehavior>
              <a className="block group">
                <Card className="text-center hover:shadow-lg transition-shadow duration-300 py-5 px-2 h-full flex flex-col justify-center items-center rounded-lg shadow-sm border-border/50 hover:border-primary/30">
                   <div className="relative w-12 h-12 md:w-14 md:h-14 mb-3 group-hover:scale-110 transition-transform text-primary">
                       <idea.icon className="w-full h-full" />
                   </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{idea.title}</p>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </section>

      {/* Newest Products Section */}
      <section className="bg-muted/50 py-10 md:py-16 rounded-lg mx-0 sm:-mx-4 px-4 sm:px-8">
        <div className="container mx-auto px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">جدیدترین لوازم خانگی</h2>
                <Button variant="link" asChild className="text-sm text-primary hover:text-primary/80 px-0">
                    <Link href="/products?sort=newest&type=appliances">
                        مشاهده همه <ChevronLeft className="mr-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><div className="h-80 bg-background rounded-lg animate-pulse col-span-full sm:col-span-2 lg:col-span-4"></div></div>}>
            <NewestProductsSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

    
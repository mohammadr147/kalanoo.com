import type { Product } from '@/types';

export const dummyProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'گوشی هوشمند مدل X',
    description: 'جدیدترین گوشی هوشمند با دوربین پیشرفته و صفحه نمایش OLED.',
    price: 15000000,
    originalPrice: 16500000,
    discountPercent: 9,
    imageUrl: 'https://picsum.photos/seed/prod_1/400/300',
  },
  {
    id: 'prod_2',
    name: 'لپ تاپ گیمینگ Legion',
    description: 'لپ تاپ قدرتمند برای بازی با گرافیک RTX و پردازنده Core i7.',
    price: 45000000,
    imageUrl: 'https://picsum.photos/seed/prod_2/400/300',
  },
  {
    id: 'prod_3',
    name: 'تلویزیون هوشمند 55 اینچ 4K',
    description: 'تلویزیون با کیفیت تصویر فوق العاده و سیستم عامل هوشمند.',
    price: 22000000,
    imageUrl: 'https://picsum.photos/seed/prod_3/400/300',
  },
  {
    id: 'prod_4',
    name: 'هدفون بی سیم با نویز کنسلینگ',
    description: 'تجربه شنیداری بی نظیر با حذف صدای محیط.',
    price: 3500000,
     originalPrice: 4000000,
     discountPercent: 12,
    imageUrl: 'https://picsum.photos/seed/prod_4/400/300',
  },
   {
    id: 'prod_5',
    name: 'ساعت هوشمند سری 8',
    description: 'پیگیری فعالیت های ورزشی و نمایش اعلان ها.',
    price: 8900000,
    imageUrl: 'https://picsum.photos/seed/prod_5/400/300',
  },
   {
    id: 'prod_6',
    name: 'دوربین دیجیتال DSLR',
    description: 'عکاسی حرفه ای با لنز قابل تعویض.',
    price: 31000000,
    imageUrl: 'https://picsum.photos/seed/prod_6/400/300',
  },
   {
    id: 'prod_7',
    name: 'کنسول بازی PlayStation 5',
    description: 'جدیدترین نسل کنسول بازی سونی.',
    price: 28500000,
    originalPrice: 30000000,
    discountPercent: 5,
    imageUrl: 'https://picsum.photos/seed/prod_7/400/300',
  },
   {
    id: 'prod_8',
    name: 'جاروبرقی رباتیک هوشمند',
    description: 'نظافت خودکار منزل با قابلیت نقشه برداری.',
    price: 12000000,
    imageUrl: 'https://picsum.photos/seed/prod_8/400/300',
  },
];

// Select a few products for recommendations
export const dummyRecommendations: Product[] = dummyProducts.slice(4, 8);

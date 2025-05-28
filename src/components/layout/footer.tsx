
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Youtube, Instagram, Send, Facebook, Image as ImageIcon, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground pt-10 pb-6">
      <div className="container">
        {/* Top section: Links and Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">تماس با کالانو</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span>آدرس: تهران، خیابان آزادی، پلاک ۱۲۳، واحد ۴</span> {/* TODO: Make dynamic from settings */}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:02112345678" className="hover:text-primary transition-colors" dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</a> {/* TODO: Make dynamic */}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@kalano.example.com" className="hover:text-primary transition-colors">info@kalano.example.com</a> {/* TODO: Make dynamic */}
              </li>
            </ul>
          </div>

          {/* Quick Access Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm">
              {/* Use slugs defined in info_pages */}
              <li><Link href="/info/faq" className="hover:text-primary transition-colors">سوالات متداول</Link></li>
              <li><Link href="/info/terms" className="hover:text-primary transition-colors">شرایط استفاده</Link></li>
              <li><Link href="/info/privacy" className="hover:text-primary transition-colors">حریم خصوصی</Link></li>
              <li><Link href="/info/contact-us" className="hover:text-primary transition-colors">تماس با ما</Link></li>
              <li><Link href="/info/about-us" className="hover:text-primary transition-colors">درباره ما</Link></li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">خدمات مشتریان</h4>
            <ul className="space-y-2 text-sm">
               {/* Use slugs defined in info_pages */}
              <li><Link href="/info/returns" className="hover:text-primary transition-colors">رویه بازگرداندن کالا</Link></li>
              <li><Link href="/info/shipping" className="hover:text-primary transition-colors">شرایط ارسال</Link></li>
              <li><Link href="/info/payment-methods" className="hover:text-primary transition-colors">روش‌های پرداخت</Link></li>
               <li><Link href="/user/orders" className="hover:text-primary transition-colors">پیگیری سفارش</Link></li> {/* Link to user panel */}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
             <h4 className="text-lg font-semibold mb-4">عضویت در خبرنامه</h4>
             <p className="text-sm mb-3">از آخرین تخفیف‌ها و جدیدترین محصولات باخبر شوید!</p>
             <form className="flex items-center gap-2">
               <Input type="email" placeholder="ایمیل خود را وارد کنید..." className="flex-grow bg-background h-9 text-xs" dir="ltr" />
               <Button type="submit" size="sm" className="h-9">عضویت</Button>
             </form>
             {/* Social Media Links */}
             <div className="flex items-center gap-3 mt-6">
                <span className="text-sm">ما را دنبال کنید:</span>
                 <Link href="#" aria-label="Pinterest" className="hover:text-primary transition-colors"><ImageIcon className="h-5 w-5" /></Link> {/* TODO: Add real links */}
                 <Link href="#" aria-label="YouTube" className="hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></Link>
                 <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                 <Link href="#" aria-label="Telegram" className="hover:text-primary transition-colors"><Send className="h-5 w-5" /></Link>
                 <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
             </div>
          </div>
        </div>

        <hr className="border-border mb-6" />

        {/* Bottom section: Copyright and Payment Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-center text-xs leading-loose text-muted-foreground md:text-right">
             تمامی حقوق برای{' '}
             <a
               href="/" // Link to homepage
               rel="noopener noreferrer"
               className="font-medium underline underline-offset-4 text-primary"
             >
               کالانو
             </a>{' '}
             محفوظ است. &copy; {new Date().getFullYear()}
           </p>
           {/* Placeholder for Payment Method Icons */}
           <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">پرداخت امن با:</span>
              {/* Replace with actual payment icons/logos */}
              <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">پرداخت ۱</div>
              <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">پرداخت ۲</div>
              <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">پرداخت ۳</div>
           </div>
        </div>
      </div>
    </footer>
  );
}

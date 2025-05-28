
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function AdminHomepageEditorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Construction className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت محتوای صفحه اصلی</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>پیکربندی بخش‌های صفحه اصلی</CardTitle>
          <CardDescription>
            در این بخش می‌توانید ترتیب و محتوای المان‌های مختلف صفحه اصلی فروشگاه را مدیریت کنید.
            این ویژگی در حال توسعه است.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Construction className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              بخش مدیریت محتوای صفحه اصلی به زودی در اینجا قرار خواهد گرفت.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              شما قادر خواهید بود بنرهای تبلیغاتی، لیست محصولات ویژه، لینک‌های هدیه و سایر بخش‌ها را از اینجا کنترل کنید.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
import { Suspense } from 'react';
import { Loader2, MessageSquareText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SmsSenderForm } from '@/components/admin/sms-sender-form';

export default function AdminSmsMarketingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-6 gap-2">
          <MessageSquareText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">ارسال پیامک تبلیغاتی / اطلاع‌رسانی</h1>
      </div>

       <Card className="max-w-3xl mx-auto">
           <CardHeader>
               <CardTitle>ارسال پیامک گروهی</CardTitle>
                <CardDescription>
                    پیامک خود را برای کاربران ارسال کنید. در حال حاضر فقط ارسال به تمام کاربران فعال است.
                    قابلیت زمان‌بندی و انتخاب گروه در آینده اضافه خواهد شد.
                </CardDescription>
           </CardHeader>
           <CardContent>
                <Suspense fallback={
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span>در حال بارگذاری فرم...</span>
                    </div>
                }>
                    <SmsSenderForm />
                </Suspense>
           </CardContent>
       </Card>

    </div>
  );
}
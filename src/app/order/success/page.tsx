'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Inner component to handle Suspense for useSearchParams
function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">سفارش شما با موفقیت ثبت شد!</CardTitle>
                <CardDescription>
                    از خرید شما متشکریم. سفارش شما در حال پردازش است.
                    {orderId && (
                         <p className="mt-2 text-sm">شماره سفارش شما: <span className="font-mono text-primary">{orderId}</span></p>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    جزئیات سفارش و وضعیت آن را می‌توانید در بخش "سفارشات من" پیگیری کنید.
                    (لینک پیگیری سفارشات در آینده اضافه خواهد شد)
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                        <Link href="/">بازگشت به صفحه اصلی</Link>
                    </Button>
                    {/* Future button: */}
                    {/* <Button asChild variant="outline">
                       <Link href="/profile/orders">مشاهده سفارشات من</Link>
                    </Button> */}
                </div>
            </CardContent>
        </Card>
    );
}


export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
            <Suspense fallback={
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
            }>
                <OrderSuccessContent />
            </Suspense>
        </div>
    );
}

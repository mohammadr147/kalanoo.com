
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Import setting components when created
// import { GeneralSiteSettingsForm } from '@/components/admin/settings/general-settings-form';
// import { CommissionSettingsForm } from '@/components/admin/settings/commission-settings-form';
// import { PaymentGatewaySettings } from '@/components/admin/settings/payment-gateway-settings';
// import { SmtpSettingsForm } from '@/components/admin/settings/smtp-settings-form'; // For email

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-6 gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">تنظیمات فروشگاه</h1>
      </div>

       <Tabs defaultValue="general" className="w-full">
         <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
           <TabsTrigger value="general">تنظیمات عمومی</TabsTrigger>
           <TabsTrigger value="commissions">پورسانت و بازاریابی</TabsTrigger>
           <TabsTrigger value="payment">درگاه پرداخت</TabsTrigger>
           <TabsTrigger value="notifications">اطلاع‌رسانی</TabsTrigger>
         </TabsList>

         {/* General Settings Tab */}
         <TabsContent value="general">
           <Card>
             <CardHeader>
               <CardTitle>تنظیمات عمومی سایت</CardTitle>
               <CardDescription>اطلاعات اصلی فروشگاه، لوگو و رنگ‌بندی را ویرایش کنید.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-muted-foreground">[فرم تنظیمات عمومی در اینجا قرار می‌گیرد]</p>
                {/* <GeneralSiteSettingsForm /> */}
             </CardContent>
           </Card>
         </TabsContent>

          {/* Commissions/Marketing Settings Tab */}
         <TabsContent value="commissions">
            <Card id="commissions"> {/* Add ID for direct linking */}
             <CardHeader>
               <CardTitle>تنظیمات پورسانت و بازاریابی</CardTitle>
               <CardDescription>درصد پورسانت سطوح مختلف و تنظیمات مربوط به دعوت دوستان.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-muted-foreground">[فرم تنظیمات پورسانت در اینجا قرار می‌گیرد]</p>
                {/* <CommissionSettingsForm /> */}
             </CardContent>
           </Card>
         </TabsContent>

         {/* Payment Gateway Settings Tab */}
         <TabsContent value="payment">
           <Card>
             <CardHeader>
               <CardTitle>تنظیمات درگاه پرداخت</CardTitle>
               <CardDescription>اتصال و مدیریت درگاه‌های پرداخت آنلاین.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <p className="text-muted-foreground">[فرم تنظیمات درگاه پرداخت در اینجا قرار می‌گیرد]</p>
                {/* <PaymentGatewaySettings /> */}
             </CardContent>
           </Card>
         </TabsContent>

          {/* Notification Settings Tab */}
         <TabsContent value="notifications">
           <Card>
             <CardHeader>
               <CardTitle>تنظیمات اطلاع‌رسانی</CardTitle>
               <CardDescription>پیکربندی ارسال ایمیل و پیامک.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <h3 className="font-semibold">تنظیمات ارسال پیامک (SMS)</h3>
                 <p className="text-muted-foreground">[فرم تنظیمات پنل SMS در اینجا قرار می‌گیرد]</p>
                 {/* <SmsProviderSettings /> */}

                 <h3 className="font-semibold mt-6">تنظیمات ارسال ایمیل (SMTP)</h3>
                 <p className="text-muted-foreground">[فرم تنظیمات SMTP در اینجا قرار می‌گیرد]</p>
                 {/* <SmtpSettingsForm /> */}
             </CardContent>
           </Card>
         </TabsContent>

       </Tabs>
    </div>
  );
}

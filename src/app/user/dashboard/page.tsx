
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, CreditCard, Gift, Wallet, Loader2, Users, Info } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { fetchUserWalletData, fetchUserReferrals } from '@/app/actions'; // Import server actions
import type { UserProfile, Transaction } from '@/types';

// Static notifications for now
const notifications = [
    { id: 1, title: 'سفارش #ORD-12345 تایید شد', date: '۲ ساعت پیش' },
    { id: 2, title: 'کد تخفیف تولد برای شما!', date: 'دیروز' },
    { id: 3, title: 'محصول مورد علاقه شما موجود شد', date: '۳ روز پیش' },
];

// Static last order for now
const staticLastOrder = { id: 'ORD-54321', date: '۱۴۰۳/۰۳/۰۱' };

export default function UserDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [referralCount, setReferralCount] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.uid) {
      const fetchData = async () => {
        setLoadingData(true);
        setError(null);
        try {
          const [walletResult, referralsResult] = await Promise.all([
            fetchUserWalletData(user.uid),
            fetchUserReferrals(user.uid)
          ]);

          if (walletResult.success && walletResult.balance !== undefined) {
            setWalletBalance(walletResult.balance);
          } else {
            setError(walletResult.error || "خطا در دریافت موجودی کیف پول.");
          }

          if (referralsResult.success && referralsResult.referrals) {
            setReferralCount(referralsResult.referrals.length);
          } else {
            // Do not overwrite previous error if wallet fetch failed
            if (!error) setError(referralsResult.error || "خطا در دریافت اطلاعات کاربران معرفی شده.");
          }

        } catch (err: any) {
          console.error("Error fetching user dashboard data:", err);
          setError(err.message || "خطای پیش‌بینی نشده در دریافت اطلاعات داشبورد.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else if (!authLoading) {
      // If user is not logged in and auth is not loading, stop data loading
      setLoadingData(false);
    }
  }, [user, authLoading, error]); // Added error to dependency array to avoid issues

  const isLoading = authLoading || loadingData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">داشبورد کاربری</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {isLoading ? 'در حال بارگذاری اطلاعات...' : 
         userData?.first_name ? `خوش آمدید، ${userData.first_name}!` : user ? 'خوش آمدید!' : 'برای مشاهده داشبورد، لطفاً وارد شوید.'
        }
      </p>

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موجودی کیف پول</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : user && walletBalance !== null ? (
              <>
                <div className="text-2xl font-bold">
                  {walletBalance.toLocaleString('fa-IR')} تومان
                </div>
                <p className="text-xs text-muted-foreground pt-1">موجودی قابل استفاده شما</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">ابتدا وارد شوید.</p>
            )}
          </CardContent>
        </Card>

        {/* Last Order Card (Static for now) */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">آخرین سفارش</CardTitle>
               <CreditCard className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
                {isLoading ? (
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : user && staticLastOrder ? ( // Using staticLastOrder
                     <>
                         <div className="text-lg font-semibold">{staticLastOrder.id}</div>
                         <p className="text-xs text-muted-foreground pt-1">
                             ثبت شده در تاریخ {staticLastOrder.date} (ایستا)
                         </p>
                     </>
                ) : user ? (
                    <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
                ): (
                     <p className="text-sm text-muted-foreground">ابتدا وارد شوید.</p>
                )}
           </CardContent>
        </Card>

         {/* Referral Points/Count Card */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تعداد دعوت‌ها (سطح ۱)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             ) : user && referralCount !== null ? (
                <>
                    <div className="text-2xl font-bold">{referralCount.toLocaleString('fa-IR')} نفر</div>
                    <p className="text-xs text-muted-foreground pt-1">تعداد کاربران معرفی شده توسط شما</p>
                </>
             ) : (
                <p className="text-sm text-muted-foreground">ابتدا وارد شوید.</p>
             )}
            </CardContent>
        </Card>
      </div>

      {/* Recent Notifications (Static for now) */}
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                اعلان‌های اخیر
            </CardTitle>
            <CardDescription>آخرین پیام‌ها و اعلان‌های مربوط به حساب شما (ایستا).</CardDescription>
         </CardHeader>
         <CardContent>
            {notifications.length > 0 ? (
                 <ul className="space-y-3">
                    {notifications.map((notif) => (
                        <li key={notif.id} className="flex items-center justify-between p-3 border rounded-md">
                             <span className="text-sm">{notif.title}</span>
                             <span className="text-xs text-muted-foreground">{notif.date}</span>
                        </li>
                    ))}
                 </ul>
            ) : (
                <p className="text-sm text-muted-foreground text-center p-4">
                    هیچ اعلان جدیدی وجود ندارد.
                </p>
            )}
         </CardContent>
      </Card>

    </div>
  );
}

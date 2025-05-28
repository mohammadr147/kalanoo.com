
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added import for Label
import { Loader2, Copy, Gift, Users, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
// NOTE: Replace with actual referral data fetching logic (non-Firebase)

// Placeholder types
interface ReferredUser {
    id: string;
    name: string; // Full name or identifier
    registrationDate: string; // Format: 'YYYY-MM-DD' or similar
    level: 1 | 2 | 3;
    commissionEarned: number;
}

// Placeholder data
const referralCode = 'KALANO-XYZ123';
const referralLink = `https://kalano.example.com/register?ref=${referralCode}`;
const totalCommission = 15000;
const dummyReferredUsers: ReferredUser[] = [
    { id: 'u1', name: 'مریم رضایی', registrationDate: '2024-04-20', level: 1, commissionEarned: 5000 },
    { id: 'u2', name: 'حسن قاسمی', registrationDate: '2024-04-22', level: 1, commissionEarned: 5000 },
    { id: 'u3', name: 'سارا احمدی (معرفی توسط مریم)', registrationDate: '2024-05-01', level: 2, commissionEarned: 3000 },
    { id: 'u4', name: 'رضا محمودی', registrationDate: '2024-05-03', level: 1, commissionEarned: 0 }, // No commission yet
    { id: 'u5', name: 'شیوا حسینی (معرفی توسط حسن)', registrationDate: '2024-05-05', level: 2, commissionEarned: 2000 },
    { id: 'u6', name: 'امیر نوری (معرفی توسط سارا)', registrationDate: '2024-05-06', level: 3, commissionEarned: 0 },
];

export default function UserInvitesPage() {
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // --- TODO: Replace with actual API call to fetch referral data ---
    const fetchReferralData = async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // const response = await fetch('/api/user/referrals'); const data = await response.json();
            // setReferralCode(data.code);
            // setTotalCommission(data.commission);
            setReferredUsers(dummyReferredUsers); // Use dummy data
        } catch (err) {
            setError("خطا در دریافت اطلاعات دعوت دوستان.");
        } finally {
            setLoading(false);
        }
    };
    fetchReferralData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "موفقیت", description: "کد/لینک دعوت کپی شد!" });
    }).catch(err => {
      toast({ title: "خطا", description: "خطا در کپی کردن.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    });
  };

  // Group users by level for display
  const groupedUsers = referredUsers.reduce((acc, user) => {
      (acc[user.level] = acc[user.level] || []).push(user);
      return acc;
  }, {} as Record<number, ReferredUser[]>);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">دعوت از دوستان</h1>
      <p className="text-muted-foreground">با دعوت دوستان خود به کالانو، از خرید آن‌ها پورسانت دریافت کنید!</p>

      {/* Referral Code/Link Card */}
      <Card>
        <CardHeader>
          <CardTitle>کد و لینک دعوت شما</CardTitle>
          <CardDescription>این کد یا لینک را با دوستان خود به اشتراک بگذارید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">کد دعوت</Label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Input id="referral-code" value={referralCode} readOnly className="font-mono text-left" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">کپی کد</span>
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral-link">لینک دعوت</Label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Input id="referral-link" value={referralLink} readOnly dir="ltr" className="text-left" />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">کپی لینک</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مجموع پورسانت دریافتی</CardTitle>
          <Gift className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
             {loading ? <Loader2 className="h-6 w-6 animate-spin"/> : `${totalCommission.toLocaleString('fa-IR')} تومان`}
          </div>
          <p className="text-xs text-muted-foreground pt-1">این مبلغ به کیف پول شما واریز شده است.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Referred Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            کاربران معرفی شده
          </CardTitle>
           <CardDescription>لیست کاربرانی که با کد شما یا از طریق معرفی‌های شما ثبت‌نام کرده‌اند.</CardDescription>
        </CardHeader>
        <CardContent>
           {loading && (
              <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
           )}
           {error && <p className="text-center text-destructive">{error}</p>}
           {!loading && !error && (
               <div className="space-y-4">
                 {Object.keys(groupedUsers).length > 0 ? (
                   Object.entries(groupedUsers).sort(([levelA], [levelB]) => Number(levelA) - Number(levelB)).map(([level, users]) => (
                    <div key={level}>
                      <h3 className="font-semibold mb-2">سطح {level}</h3>
                      <Table>
                         <TableHeader>
                             <TableRow>
                                 <TableHead>نام کاربر</TableHead>
                                 <TableHead>تاریخ ثبت‌نام</TableHead>
                                 <TableHead>پورسانت دریافتی (تومان)</TableHead>
                             </TableRow>
                         </TableHeader>
                         <TableBody>
                           {users.map(user => (
                              <TableRow key={user.id}>
                                 <TableCell>{user.name}</TableCell>
                                 <TableCell>{user.registrationDate}</TableCell>
                                 <TableCell className={user.commissionEarned > 0 ? 'text-green-600 font-medium' : ''}>
                                     {user.commissionEarned.toLocaleString('fa-IR')}
                                 </TableCell>
                              </TableRow>
                           ))}
                         </TableBody>
                      </Table>
                    </div>
                   ))
                 ) : (
                      <p className="text-sm text-muted-foreground text-center p-4">
                         هنوز هیچ کاربری با کد شما ثبت‌نام نکرده است.
                      </p>
                 )}
               </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { generateReferralCode } from '@/lib/utils';
import { sendSms } from '@/services/sms';
import { sendOtpAction, verifyOtpAction } from '@/app/actions'; // Import server actions
import { SendOtpSchema, VerifyOtpSchema } from '@/types'; // Import schemas from types
import * as z from 'zod';

export function PhoneAuthForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
  };

   const validatePhoneNumber = (number: string): boolean => {
    const iranianPhoneRegex = /^09[0-9]{9}$/;
    return iranianPhoneRegex.test(number);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPhone = SendOtpSchema.safeParse({ phone: phoneNumber });
    if (!parsedPhone.success) {
       toast({ title: "شماره موبایل نامعتبر", description: parsedPhone.error.errors[0].message, variant: "destructive" });
       return;
    }

    setLoading(true);
    try {
      const result = await sendOtpAction({ phone: parsedPhone.data.phone });
      if (result.success) {
          setOtpSent(true);
          toast({ title: "کد تایید ارسال شد", description: "کد ۶ رقمی ارسال شده به موبایل خود را وارد کنید." });
      } else {
          toast({ title: "خطا", description: result.error || "خطا در ارسال کد تایید.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({ title: "خطا", description: "خطای پیش‌بینی نشده در ارسال کد تایید.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
     e.preventDefault();
     // TODO: Get inviterReferralCode from an input field if needed
     const inviterReferralCode = (document.getElementById('inviter-code') as HTMLInputElement)?.value || null;

     const parsedOtpData = VerifyOtpSchema.safeParse({ phone: phoneNumber, otp, inviterReferralCode });
      if (!parsedOtpData.success) {
         toast({ title: "کد تایید نامعتبر", description: parsedOtpData.error.errors[0].message, variant: "destructive" });
         return;
     }

    setLoading(true);
    try {
        const result = await verifyOtpAction(parsedOtpData.data);
        if (result.success && result.user) {
            toast({ title: "ورود موفقیت آمیز بود!", description: `خوش آمدید ${result.user.phone}` });
            if (result.isNewUser || !result.user.is_profile_complete) {
                 router.push('/profile/complete');
            } else {
                 router.push('/');
            }
        } else {
            toast({ title: "خطا", description: result.error || "کد تایید نامعتبر یا منقضی شده است.", variant: "destructive" });
        }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({ title: "خطا", description: "خطای پیش‌بینی نشده در تایید کد.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{otpSent ? 'کد تایید را وارد کنید' : 'ورود / ثبت نام'}</CardTitle>
        <CardDescription>
          {otpSent
            ? 'کد ۶ رقمی ارسال شده به شماره موبایل خود را وارد کنید.'
            : 'برای ورود یا ثبت نام شماره موبایل خود را وارد کنید.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09123456789"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                required
                dir="ltr"
                className="text-left"
                 disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !phoneNumber || !validatePhoneNumber(phoneNumber)}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              ارسال کد تایید
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">کد تایید (OTP)</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                required
                dir="ltr"
                className="text-center tracking-[0.5em]"
                 disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviter-code">کد معرف (اختیاری)</Label>
              <Input
                id="inviter-code"
                type="text"
                placeholder="کد معرف را وارد کنید"
                dir="ltr"
                className="text-left"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              تایید و ورود
            </Button>
          </form>
        )}
      </CardContent>
       {otpSent && (
           <CardFooter className="flex justify-center">
             <Button variant="link" onClick={() => { setOtpSent(false); setOtp(''); }} disabled={loading}>
               تغییر شماره موبایل یا ارسال مجدد کد
             </Button>
           </CardFooter>
        )}
    </Card>
  );
}

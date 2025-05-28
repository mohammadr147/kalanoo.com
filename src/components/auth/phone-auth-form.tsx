
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// Removed Firebase Auth imports
// import {
//   getAuth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   ConfirmationResult,
//   UserCredential,
// } from 'firebase/auth';
// Removed Firestore imports
// import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
// Removed Firebase config imports
// import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { generateReferralCode } from '@/lib/utils'; // Import referral code generator
import { sendSms } from '@/services/sms'; // Import the SMS service
// TODO: Import server actions for OTP handling and user creation/login
// import { sendOtpAction, verifyOtpAction } from '@/app/auth-actions';

export function PhoneAuthForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  // Removed Firebase specific state
  // const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  // Removed Firebase reCAPTCHA refs
  // const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  // const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

   // Removed Firebase reCAPTCHA useEffect

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
    if (!validatePhoneNumber(phoneNumber)) {
       toast({ title: "شماره موبایل نامعتبر", description: "لطفاً شماره موبایل معتبر ایرانی وارد کنید (مثال: 09123456789).", variant: "destructive" });
       return;
    }

    setLoading(true);
    try {
      // --- TODO: Replace with Server Action Call to Send OTP ---
      // 1. Call server action `sendOtpAction(phoneNumber)`
      // 2. Server action generates OTP, stores it (e.g., in MySQL table `otp_codes` with expiry)
      // 3. Server action uses `sendSms` service to send the OTP.
      // 4. Server action returns success/failure.

      console.log("Simulating OTP send request for:", phoneNumber);
      // Example call (replace with actual):
      // const result = await sendOtpAction(phoneNumber);
      await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
      const result = { success: true }; // Placeholder result

      if (result.success) {
          setOtpSent(true);
          toast({ title: "کد تایید ارسال شد", description: "کد ۶ رقمی ارسال شده به موبایل خود را وارد کنید." });
      } else {
          // toast({ title: "خطا", description: result.error || "خطا در ارسال کد تایید.", variant: "destructive" });
          toast({ title: "خطا", description: "خطا در ارسال کد تایید (شبیه‌سازی).", variant: "destructive" });
      }
      // --- End TODO ---

    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({ title: "خطا", description: "خطای پیش‌بینی نشده در ارسال کد تایید.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
     e.preventDefault();
     if (otp.length !== 6) { // Assuming 6-digit OTP
         toast({ title: "کد تایید نامعتبر", description: "کد تایید باید ۶ رقم باشد.", variant: "destructive" });
         return;
     }

    setLoading(true);
    try {
        // --- TODO: Replace with Server Action Call to Verify OTP ---
        // 1. Call server action `verifyOtpAction(phoneNumber, otp)`
        // 2. Server action checks OTP against stored value in `otp_codes` table (and expiry).
        // 3. If valid:
        //    a. Find user by phone number in `users` table.
        //    b. If user exists, update `last_login_at`, generate session token/cookie.
        //    c. If user doesn't exist, create new user in `users` table (with referral code etc.), generate session token/cookie.
        //    d. Invalidate/delete used OTP code.
        //    e. Return { success: true, isNewUser: boolean, userProfile?: UserProfile, sessionToken?: string }
        // 4. If invalid, return { success: false, error: '...' }

        console.log("Simulating OTP verification for:", phoneNumber, "OTP:", otp);
        // Example call (replace with actual):
        // const result = await verifyOtpAction(phoneNumber, otp);
        await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
        const result = { success: true, isNewUser: Math.random() > 0.5 }; // Placeholder result
        // --- End TODO ---


        if (result.success) {
            toast({ title: "ورود موفقیت آمیز بود!", description: `خوش آمدید ${phoneNumber}` });

            // TODO: Store the session token/cookie returned by the server action
            // e.g., cookies().set('user_session', result.sessionToken, { ...options });

            if (result.isNewUser) {
                 console.log("New user registration detected.");
                 router.push('/profile/complete'); // Redirect new users to complete profile
            } else {
                 console.log("Existing user login.");
                 router.push('/'); // Redirect existing users to homepage
            }
        } else {
            // toast({ title: "خطا", description: result.error || "کد تایید نامعتبر یا منقضی شده است.", variant: "destructive" });
            toast({ title: "خطا", description: "کد تایید نامعتبر یا منقضی شده است (شبیه‌سازی).", variant: "destructive" });
             // Optionally allow resend if code was invalid/expired
             // setOtpSent(false);
             // setOtp('');
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
                dir="ltr" // Ensure LTR for phone number input
                className="text-left"
                 disabled={loading}
              />
            </div>
             {/* Removed Firebase reCAPTCHA container */}
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
                maxLength={6} // Assuming 6 digits
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
                required
                dir="ltr" // Ensure LTR for OTP input
                className="text-center tracking-[0.5em]" // Center text and add letter spacing
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
             <Button variant="link" onClick={() => { setOtpSent(false); setOtp(''); /* Reset any relevant state */ }} disabled={loading}>
               تغییر شماره موبایل یا ارسال مجدد کد
             </Button>
           </CardFooter>
        )}
    </Card>
  );
}

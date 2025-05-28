
'use server';

import { cookies } from 'next/headers';
import { sendBulkSms, type SmsResult, sendOrderConfirmationSmsToCustomer, sendOrderConfirmationSmsToAdmin, sendOrderStatusUpdateSmsToCustomer } from '@/services/sms';
import { sendOrderConfirmationEmailToCustomer, sendOrderConfirmationEmailToAdmin, sendOrderStatusUpdateEmailToCustomer, sendEmailPlaceholder } from '@/services/email';
import type { Coupon, UserProfile, Order, Product, Category, Banner, LandingPage, InfoPage, CartItem, Address, OrderStatus, SiteSettings, Transaction, Ticket, TicketMessage, TicketStatus, TicketPriority } from '@/types';
import * as z from 'zod';
import pool from '@/lib/mysql';
import type { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import { generateReferralCode } from '@/lib/utils';

import fs from 'fs/promises';
import path from 'path';

// --- Constants ---
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123@'; // In a real app, use hashed passwords
const UPLOADS_DIR_BANNERS = path.join(process.cwd(), 'public', 'uploads', 'banners');
const PUBLIC_UPLOADS_PATH_BANNERS = '/uploads/banners';
const UPLOADS_DIR_PRODUCTS = path.join(process.cwd(), 'public', 'uploads', 'products');
const PUBLIC_UPLOADS_PATH_PRODUCTS = '/uploads/products';
const UPLOADS_DIR_CHECKS = path.join(process.cwd(), 'public', 'uploads', 'checks');
const PUBLIC_UPLOADS_PATH_CHECKS = '/uploads/checks';
const UPLOADS_DIR_PROFILES = path.join(process.cwd(), 'public', 'uploads', 'profiles');
const PUBLIC_UPLOADS_PATH_PROFILES = '/uploads/profiles';


const ADMIN_NOTIFICATION_PHONE = process.env.ADMIN_NOTIFICATION_PHONE;
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;


async function saveBase64Image(base64String: string, fileNamePrefix: string, uploadDir: string, publicPath: string): Promise<string | null> {
    if (!base64String || !base64String.startsWith('data:image')) {
        return base64String || null; // Return existing URL or null if empty
    }
    try {
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            console.error('Invalid base64 image string format');
            return null;
        }
        const imageType = matches[1].replace('jpeg', 'jpg'); // Common normalization
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        await fs.mkdir(uploadDir, { recursive: true }); // Ensure directory exists

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${fileNamePrefix}-${timestamp}-${randomSuffix}.${imageType}`;
        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, buffer);
        return `${publicPath}/${filename}`; // Return the public URL path
    } catch (error) {
        console.error('Error saving base64 image:', error);
        return null;
    }
}

// --- Site Settings ---
export async function getSiteSettings(): Promise<Partial<SiteSettings>> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>("SELECT setting_key, setting_value FROM settings");
        const settings: Partial<SiteSettings> = {};
        rows.forEach(row => {
            if (row.setting_key === 'mlm_level_percentages') {
                try {
                    settings[row.setting_key as keyof SiteSettings] = JSON.parse(row.setting_value) as any;
                } catch (e) {
                    console.error(`Error parsing mlm_level_percentages JSON: ${row.setting_value}`, e);
                    settings[row.setting_key as keyof SiteSettings] = [] as any;
                }
            } else if (row.setting_key.includes('percent') || row.setting_key.includes('amount') || row.setting_key.includes('levels')) {
                 settings[row.setting_key as keyof SiteSettings] = parseFloat(row.setting_value) as any;
            } else {
                 settings[row.setting_key as keyof SiteSettings] = row.setting_value;
            }
        });
        // Default values if not found in DB - important for commission calculation
        settings.mlm_number_of_levels = settings.mlm_number_of_levels ?? 0;
        settings.mlm_level_percentages = settings.mlm_level_percentages ?? [];
        return settings;
    } catch (error) {
        console.error("Error fetching site settings from MySQL:", error);
        return { mlm_number_of_levels: 0, mlm_level_percentages: [] }; // Fallback
    } finally {
        if (connection) connection.release();
    }
}

export async function updateCommissionSettings(numberOfLevels: number, percentages: number[]): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    if (numberOfLevels < 0 || numberOfLevels > 10) return { success: false, error: 'تعداد سطوح باید بین ۰ تا ۱۰ باشد.' };
    if (percentages.length !== numberOfLevels) return { success: false, error: 'تعداد درصدها باید با تعداد سطوح برابر باشد.' };
    for (const p of percentages) {
        if (p < 0 || p > 100) return { success: false, error: 'درصد هر سطح باید بین ۰ تا ۱۰۰ باشد.' };
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        await connection.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
            ['mlm_number_of_levels', String(numberOfLevels)]
        );
        await connection.query(
            "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
            ['mlm_level_percentages', JSON.stringify(percentages)]
        );
        await connection.commit();
        return { success: true };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("Error updating commission settings:", error);
        return { success: false, error: 'خطا در ذخیره تنظیمات پورسانت.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- Authentication Actions ---
const adminLoginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است."),
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export async function loginAdmin(formData: z.infer<typeof adminLoginSchema>): Promise<{ success: boolean; error?: string }> {
    const validation = adminLoginSchema.safeParse(formData);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است.' };
    const { username, password } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection();
        // In a real app, you'd query the 'admins' table and compare a hashed password
        // For this project, we use hardcoded admin credentials from .env
        // const [rows] = await connection.query<RowDataPacket[]>('SELECT password_hash FROM admins WHERE username = ? LIMIT 1', [username]);
        // if (rows.length === 0) return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
        // const passwordMatch = await bcrypt.compare(password, rows[0].password_hash); // Example with bcrypt

        const envAdminUsername = process.env.ADMIN_USERNAME || 'admin';
        const envAdminPassword = process.env.ADMIN_PASSWORD || 'Admin123@';

        if (username === envAdminUsername && password === envAdminPassword) {
            const sessionValue = JSON.stringify({ username: username, loggedInAt: Date.now() });
            cookies().set('admin_session', sessionValue, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 1, path: '/', sameSite: 'lax' });
            return { success: true };
        }
        return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
    } catch (error) {
        console.error("Error during admin login:", error);
        return { success: false, error: 'خطای داخلی سرور هنگام ورود.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
    try {
        cookies().delete('admin_session');
        return { success: true };
    } catch (error) {
        console.error("Error logging out admin:", error);
        return { success: false };
    }
}

export async function verifyAdminSession(): Promise<{ isAuthenticated: boolean; username?: string }> {
    const cookie = cookies().get('admin_session');
    if (!cookie) return { isAuthenticated: false };
    try {
        const sessionData = JSON.parse(cookie.value);
        // Compare with env variables for simplicity in this project
        if (sessionData.username && sessionData.username === (process.env.ADMIN_USERNAME || 'admin')) {
            const now = Date.now();
            const sessionDuration = 60 * 60 * 24 * 1000; // 1 day in milliseconds
            if (!sessionData.loggedInAt || (now - sessionData.loggedInAt > sessionDuration)) {
                cookies().delete('admin_session'); // Expire session
                return { isAuthenticated: false };
            }
            return { isAuthenticated: true, username: sessionData.username };
        }
    } catch (error) {
        console.error("VerifyAdminSession: Error verifying admin session:", error);
        cookies().delete('admin_session'); // Clear malformed cookie
    }
    return { isAuthenticated: false };
}

// --- User Auth & Registration with OTP ---
const SendOtpSchema = z.object({
  phone: z.string().regex(/^09[0-9]{9}$/, "شماره موبایل معتبر ایرانی وارد کنید."),
});
const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست."),
  otp: z.string().length(6, "کد تایید باید ۶ رقم باشد."),
  inviterReferralCode: z.string().optional().nullable(),
});

async function handleUserLoginOrRegistration(phone: string, inviterReferralCode?: string | null): Promise<{ success: boolean; user?: UserProfile; error?: string, isNewUser?: boolean }> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [existingUsers] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE phone = ?', [phone]);

        if (existingUsers.length > 0) {
            const user = existingUsers[0] as UserProfile;
            // Ensure ID is string
            user.id = String(user.id);
            user.uid = String(user.uid);
            if (user.invited_by_user_id) user.invited_by_user_id = String(user.invited_by_user_id);

            await connection.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
            return { success: true, user, isNewUser: false };
        } else {
            // New user registration
            const referralCode = generateReferralCode();
            let invitedByUserId: number | null = null;
            if (inviterReferralCode) {
                const [inviterRows] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE referral_code = ?', [inviterReferralCode]);
                if (inviterRows.length > 0) {
                    invitedByUserId = inviterRows[0].id;
                } else {
                    console.warn(`Inviter referral code ${inviterReferralCode} not found.`);
                }
            }

            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO users (phone, referral_code, invited_by_user_id, wallet_balance, created_at, last_login_at, is_profile_complete) VALUES (?, ?, ?, 0.00, NOW(), NOW(), 0)',
                [phone, referralCode, invitedByUserId]
            );
            const newUser: UserProfile = {
                id: String(result.insertId),
                uid: String(result.insertId), // uid is often same as id or external id
                phone,
                referral_code: referralCode,
                invited_by_user_id: invitedByUserId ? String(invitedByUserId) : null,
                wallet_balance: 0,
                role: 'user',
                is_profile_complete: false,
                created_at: new Date().toISOString(),
                last_login_at: new Date().toISOString(),
            };
            return { success: true, user: newUser, isNewUser: true };
        }
    } catch (error: any) {
        console.error("Error in handleUserLoginOrRegistration:", error);
        return { success: false, error: 'خطا در پردازش اطلاعات کاربر.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function sendOtpAction(data: z.infer<typeof SendOtpSchema>): Promise<{ success: boolean; error?: string }> {
    const validation = SendOtpSchema.safeParse(data);
    if (!validation.success) return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    const { phone } = validation.data;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    let connection;
    try {
        connection = await pool.getConnection();
        // Invalidate previous OTPs for this number
        await connection.query('UPDATE otp_codes SET is_used = 1, expires_at = NOW() WHERE phone = ? AND is_used = 0 AND expires_at > NOW()', [phone]);
        await connection.query('INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)', [phone, otp, expiresAt]);

        // Simulate SMS sending
        const smsResult = await sendSms(phone, `کد تایید شما در کالانو: ${otp}`);
        if (smsResult.status !== 'Sent' && smsResult.status !== 'Queued') {
             // Log to sms_logs table
            // await connection.query('INSERT INTO sms_logs (recipient_phone, message_content, status, provider_message_id, error_message, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
            //    [phone, `کد تایید شما در کالانو: ${otp}`, smsResult.status, smsResult.messageId, smsResult.error]);
            return { success: false, error: smsResult.error || 'خطا در ارسال پیامک کد تایید.' };
        }
         // Log to sms_logs table
        // await connection.query('INSERT INTO sms_logs (recipient_phone, message_content, status, provider_message_id, sent_at) VALUES (?, ?, ?, ?, NOW())',
        //    [phone, `کد تایید شما در کالانو: ${otp}`, smsResult.status, smsResult.messageId]);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        return { success: false, error: 'خطای داخلی سرور هنگام ارسال کد تایید.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function verifyOtpAction(data: z.infer<typeof VerifyOtpSchema>): Promise<{ success: boolean; user?: UserProfile; error?: string; isNewUser?: boolean }> {
    const validation = VerifyOtpSchema.safeParse(data);
    if (!validation.success) return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    const { phone, otp, inviterReferralCode } = validation.data;

    let connection;
    try {
        connection = await pool.getConnection();
        const [otpRows] = await connection.query<RowDataPacket[]>(
            'SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND expires_at > NOW() AND is_used = 0',
            [phone, otp]
        );

        if (otpRows.length === 0) {
            return { success: false, error: 'کد تایید نامعتبر یا منقضی شده است.' };
        }

        await connection.query('UPDATE otp_codes SET is_used = 1 WHERE id = ?', [otpRows[0].id]);

        // Handle user login or registration
        const userResult = await handleUserLoginOrRegistration(phone, inviterReferralCode);
        if (userResult.success && userResult.user) {
            // In a real app, generate and set a session cookie here
            // For this project, we'll rely on client-side to know user is logged in
            // and subsequent requests might need to pass a token or re-verify.
            // Example: cookies().set('user_session', JSON.stringify({ userId: userResult.user.id, phone: userResult.user.phone }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' });
            return { success: true, user: userResult.user, isNewUser: userResult.isNewUser };
        } else {
            return { success: false, error: userResult.error || 'خطا در پردازش اطلاعات کاربر پس از تایید کد.' };
        }

    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: 'خطای داخلی سرور هنگام تایید کد.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- User Profile Actions ---
const UpdateUserProfileSchema = z.object({
    uid: z.string(),
    first_name: z.string().min(2).optional().nullable(),
    last_name: z.string().min(2).optional().nullable(),
    national_id: z.string().regex(/^\d{10}$/).optional().nullable(),
    email: z.string().email().optional().nullable(),
    secondary_phone: z.string().regex(/^09[0-9]{9}$/).optional().nullable(),
    birth_date: z.string().optional().nullable(), // Expecting YYYY-MM-DD string
    birth_month: z.number().int().min(1).max(12).optional().nullable(),
    birth_day: z.number().int().min(1).max(31).optional().nullable(),
    address: z.string().optional().nullable(), // Expecting JSON string of Address type
    profile_image_data_url: z.string().optional().nullable(), // Base64 data URL for new image
    is_profile_complete: z.boolean().optional(),
});

export async function updateUserProfile(data: Partial<UserProfile> & { uid: string; profile_image_data_url?: string | null }): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    // TODO: Add proper session verification to ensure only the logged-in user can update their own profile, or admin can update any.
    // For now, assume UID is correctly passed and authorized.

    // Validate only the fields that are actually passed for update
    const partialSchemaToValidate = UpdateUserProfileSchema.partial().required({ uid: true });
    const validation = partialSchemaToValidate.safeParse(data);

    if (!validation.success) {
        return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    const { uid, profile_image_data_url, ...updateData } = validation.data;

    let connection;
    try {
        connection = await pool.getConnection();

        let newProfileImageUrl: string | null = null;
        if (profile_image_data_url) {
            newProfileImageUrl = await saveBase64Image(profile_image_data_url, `profile-${uid}`, UPLOADS_DIR_PROFILES, PUBLIC_UPLOADS_PATH_PROFILES);
            if (newProfileImageUrl) {
                (updateData as any).profile_image_url = newProfileImageUrl;
            } else {
                console.warn(`Could not save new profile image for user ${uid}.`)
            }
        }

        const updateFields: Record<string, any> = {};
        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) { // Only include defined values
                updateFields[key] = value;
            }
        }
        
        if (Object.keys(updateFields).length === 0) {
            return { success: false, error: 'هیچ اطلاعاتی برای به‌روزرسانی ارسال نشده است.' };
        }
        updateFields.profile_updated_at = new Date(); // Set update timestamp

        const setClauses = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateFields);

        const [result] = await connection.query<OkPacket>(
            `UPDATE users SET ${setClauses} WHERE id = ?`,
            [...values, parseInt(uid, 10)]
        );

        if (result.affectedRows === 0) {
            return { success: false, error: 'کاربر یافت نشد یا اطلاعات تغییری نکرد.' };
        }

        const [updatedUserRows] = await connection.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [parseInt(uid, 10)]);
        if (updatedUserRows.length > 0) {
             const user = updatedUserRows[0] as UserProfile;
             user.id = String(user.id);
             user.uid = String(user.uid);
             if (user.invited_by_user_id) user.invited_by_user_id = String(user.invited_by_user_id);
             return { success: true, user };
        }
        return { success: true }; // Profile updated, but couldn't refetch for some reason
    } catch (error: any) {
        console.error("Error updating user profile in MySQL:", error);
        return { success: false, error: 'خطا در به‌روزرسانی پروفایل کاربر در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}


// --- Coupon Actions ---
const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9]+$/, "کد کوپن فقط می‌تواند شامل حروف بزرگ انگلیسی و اعداد باشد."),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive(),
  expiry_date: z.date(),
  usage_limit: z.coerce.number().int().positive().optional().nullable(),
  min_order_value: z.coerce.number().int().nonnegative().optional().nullable(),
  is_active: z.boolean().default(true),
});

const ValidateCouponCodeSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().positive("مبلغ کل سبد خرید باید مثبت باشد."),
});

export async function createCoupon(data: z.infer<typeof CreateCouponSchema>): Promise<{ success: boolean; error?: string; couponId?: number }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = CreateCouponSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const { code, ...couponData } = validation.data;
    const upperCaseCode = code.toUpperCase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [existingRows] = await connection.query<RowDataPacket[]>('SELECT id FROM coupons WHERE code = ?', [upperCaseCode]);
        if (existingRows.length > 0) return { success: false, error: 'کد کوپن وارد شده تکراری است.' };
        const [result] = await connection.query<OkPacket>(
            'INSERT INTO coupons (code, discount_type, discount_value, expiry_date, usage_limit, min_order_value, is_active, usage_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())',
            [upperCaseCode, couponData.discount_type, couponData.discount_value, couponData.expiry_date, couponData.usage_limit, couponData.min_order_value, couponData.is_active]
        );
        return { success: true, couponId: result.insertId };
    } catch (error: any) {
        console.error("Error creating coupon in MySQL:", error);
        return { success: false, error: 'خطا در ایجاد کوپن در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function deleteCoupon(couponId: number): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    if (!couponId) return { success: false, error: 'شناسه کوپن نامعتبر است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>('DELETE FROM coupons WHERE id = ?', [couponId]);
        if (result.affectedRows === 0) return { success: false, error: 'کوپن مورد نظر یافت نشد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting coupon from MySQL:", error);
        return { success: false, error: 'خطا در حذف کوپن از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateCoupon(couponId: number, data: Partial<Coupon>): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    // TODO: Implement update logic with Zod validation for partial data
    console.log("Update coupon action called (not fully implemented)", couponId, data);
    return { success: false, error: 'ویژگی ویرایش هنوز پیاده سازی نشده است.' };
}

export async function fetchCouponsAdmin(): Promise<{ success: boolean; coupons?: Coupon[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT id, code, discount_type, discount_value, expiry_date, usage_limit, usage_count, min_order_value, is_active, created_at, updated_at FROM coupons ORDER BY created_at DESC'
        );
        const coupons: Coupon[] = rows.map(row => ({
            id: String(row.id), code: row.code, discount_type: row.discount_type, discount_value: parseFloat(row.discount_value),
            expiry_date: row.expiry_date, usage_limit: row.usage_limit, usage_count: row.usage_count,
            min_order_value: row.min_order_value ? parseFloat(row.min_order_value) : null, is_active: Boolean(row.is_active),
            created_at: row.created_at, updated_at: row.updated_at,
        }));
        return { success: true, coupons };
    } catch (error: any) {
        console.error("Error fetching coupons from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست کوپن‌ها از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function validateCouponCode(data: z.infer<typeof ValidateCouponCodeSchema>): Promise<{ success: boolean; isValid: boolean; coupon?: Coupon; error?: string; discountAmount?: number; }> {
    const validation = ValidateCouponCodeSchema.safeParse(data);
    if (!validation.success) return { success: false, isValid: false, error: 'داده ورودی نامعتبر است: ' + validation.error.errors.map(e => e.message).join(', ') };
    const { code, cartTotal } = validation.data;
    const upperCaseCode = code.toUpperCase();
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ?', [upperCaseCode]);
        if (rows.length === 0) return { success: true, isValid: false, error: 'کد تخفیف وارد شده معتبر نیست.' };
        const couponRow = rows[0];
        const coupon: Coupon = {
            id: String(couponRow.id), code: couponRow.code, discount_type: couponRow.discount_type, discount_value: couponRow.discount_value,
            expiry_date: couponRow.expiry_date, usage_limit: couponRow.usage_limit, usage_count: couponRow.usage_count,
            min_order_value: couponRow.min_order_value, is_active: Boolean(couponRow.is_active),
            created_at: couponRow.created_at, updated_at: couponRow.updated_at,
        };
        if (!coupon.is_active) return { success: true, isValid: false, error: 'این کد تخفیف فعال نیست.' };
        if (new Date(coupon.expiry_date) < new Date()) return { success: true, isValid: false, error: 'این کد تخفیف منقضی شده است.' };
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) return { success: true, isValid: false, error: 'ظرفیت استفاده از این کد تخفیف به پایان رسیده است.' };
        if (coupon.min_order_value !== null && cartTotal < coupon.min_order_value) return { success: true, isValid: false, error: `حداقل مبلغ سفارش برای استفاده از این کد ${coupon.min_order_value.toLocaleString('fa-IR')} تومان است.` };
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') discountAmount = Math.round(cartTotal * (coupon.discount_value / 100));
        else { discountAmount = coupon.discount_value; if (discountAmount > cartTotal) discountAmount = cartTotal; }
        return { success: true, isValid: true, coupon, discountAmount };
    } catch (error: any) {
        console.error("Error validating coupon code from MySQL:", error);
        return { success: false, isValid: false, error: 'خطا در بررسی کد تخفیف.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function applyCouponToOrder(couponId: number): Promise<{ success: boolean; error?: string }> {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM coupons WHERE id = ? FOR UPDATE', [couponId]);
        if (rows.length === 0) { await connection.rollback(); return { success: false, error: "کوپن یافت نشد." }; }
        const couponRow = rows[0];
        const coupon: Coupon = {
            id: String(couponRow.id), code: couponRow.code, discount_type: couponRow.discount_type, discount_value: couponRow.discount_value,
            expiry_date: couponRow.expiry_date, usage_limit: couponRow.usage_limit, usage_count: couponRow.usage_count,
            min_order_value: couponRow.min_order_value, is_active: Boolean(couponRow.is_active),
        };
        if (!coupon.is_active) { await connection.rollback(); return { success: false, error: "کوپن فعال نیست."}; }
        if (new Date(coupon.expiry_date) < new Date()) { await connection.rollback(); return { success: false, error: "کوپن منقضی شده است."}; }
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) { await connection.rollback(); return { success: false, error: "ظرفیت استفاده از کوپن به پایان رسیده است."}; }
        await connection.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [couponId]);
        await connection.commit();
        return { success: true };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error(`Error applying coupon ${couponId} in transaction:`, error);
        return { success: false, error: 'خطا در اعمال کوپن در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- SMS & Email Marketing Actions ---
const SendSmsSchema = z.object({
  message: z.string().min(5, { message: "متن پیامک باید حداقل ۵ کاراکتر باشد." }).max(500, { message: "متن پیامک نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد." }),
  targetGroup: z.enum(['all_users']).default('all_users'),
});
const SendEmailSchema = z.object({
    subject: z.string().min(3, "موضوع ایمیل باید حداقل ۳ کاراکتر باشد.").max(100, "موضوع ایمیل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد."),
    htmlBody: z.string().min(10, "محتوای ایمیل باید حداقل ۱۰ کاراکتر باشد."),
    targetGroup: z.enum(['all_users']).default('all_users'),
});

export async function sendPromotionalSms(data: z.infer<typeof SendSmsSchema>): Promise<{ success: boolean; message?: string; error?: string; results?: SmsResult[]; sentCount?: number; failedCount?: number; }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = SendSmsSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const { message, targetGroup } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection(); // Get connection for logging
        let phoneNumbers: string[] = [];
        if (targetGroup === 'all_users') {
            const [rows] = await connection.query<RowDataPacket[]>('SELECT phone FROM users WHERE phone IS NOT NULL AND phone != "" AND is_profile_complete = 1');
            phoneNumbers = rows.map(row => row.phone).filter(phone => phone && /^09[0-9]{9}$/.test(phone));
        } else return { success: false, error: 'گروه هدف نامعتبر است.' };
        if (phoneNumbers.length === 0) return { success: false, error: 'هیچ شماره موبایل معتبری برای ارسال یافت نشد.' };
        const results = await sendBulkSms(phoneNumbers, message);
        const sentCount = results.filter(r => r.status === 'Sent' || r.status === 'Queued').length;
        const failedCount = results.length - sentCount;
        
        // Log to sms_logs table
        for (const result of results) {
            await connection.query('INSERT INTO sms_logs (recipient_phone, message_content, status, provider_message_id, error_message, sent_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [result.messageId.split('_')[2], message, result.status, result.messageId, result.error]); // Assuming phone is in messageId for mock
        }
        return { success: failedCount === 0, message: `ارسال پیامک به ${results.length} شماره انجام شد. (${sentCount} موفق، ${failedCount} ناموفق)`, results, sentCount, failedCount };
    } catch (error: any) {
        console.error("Error sending promotional SMS:", error);
        return { success: false, error: 'خطای پیش‌بینی نشده در سرور هنگام ارسال پیامک.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function sendPromotionalEmail(data: z.infer<typeof SendEmailSchema>): Promise<{ success: boolean; message?: string; error?: string; sentCount?: number; failedCount?: number; }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = SendEmailSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر: ' + validation.error.errors.map(e => e.message).join(', ') };
    const { subject, htmlBody, targetGroup } = validation.data;
    let connection;
    let sentCount = 0;
    let failedCount = 0;
    try {
        connection = await pool.getConnection(); // Get connection for logging
        let emails: string[] = [];
        if (targetGroup === 'all_users') {
            const [rows] = await connection.query<RowDataPacket[]>('SELECT email FROM users WHERE email IS NOT NULL AND email != "" AND is_profile_complete = 1');
            emails = rows.map(row => row.email).filter(email => email); // Basic filter
        } else return { success: false, error: 'گروه هدف نامعتبر.' };

        if (emails.length === 0) return { success: false, error: 'هیچ ایمیل معتبری برای ارسال یافت نشد.' };

        for (const email of emails) {
            const result = await sendEmailPlaceholder(email, subject, htmlBody); // Using placeholder
            if (result.status === 'Sent') sentCount++; else failedCount++;
             // Log to email_logs table
             await connection.query('INSERT INTO email_logs (recipient_email, subject, status, error_message, sent_at) VALUES (?, ?, ?, ?, NOW())',
                [email, subject, result.status, result.error]);
        }
        return { success: failedCount === 0, message: `ارسال ایمیل به ${emails.length} آدرس انجام شد. (${sentCount} موفق، ${failedCount} ناموفق)`, sentCount, failedCount };
    } catch (error: any) {
        console.error("Error sending promotional email:", error);
        return { success: false, error: 'خطای سرور هنگام ارسال ایمیل.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- User Management Actions (Admin) ---
const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, "شناسه کاربر الزامی است."),
  role: z.enum(['user', 'agent', 'admin', 'blocked']), // Make sure this matches UserRoleSchema in types
});

export async function fetchUsers(): Promise<{ success: boolean; users?: (UserProfile & {direct_referral_count?: number})[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT u.id, u.first_name, u.last_name, u.phone, u.email, u.referral_code, u.role, u.created_at, u.is_profile_complete, 
             (SELECT COUNT(*) FROM users r WHERE r.invited_by_user_id = u.id) as direct_referral_count 
             FROM users u ORDER BY u.created_at DESC LIMIT 50`
        );
        const users: (UserProfile & {direct_referral_count?: number})[] = rows.map(row => ({
            id: String(row.id), uid: String(row.id), first_name: row.first_name, last_name: row.last_name, phone: row.phone, email: row.email,
            referral_code: row.referral_code, role: row.role, created_at: row.created_at, is_profile_complete: Boolean(row.is_profile_complete),
            direct_referral_count: row.direct_referral_count
        }));
        return { success: true, users };
    } catch (error: any) {
        console.error("Error fetching users from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست کاربران از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateUserRole(data: z.infer<typeof UpdateUserRoleSchema>): Promise<{ success: boolean; error?: string }> {
    const isAdminAuth = await verifyAdminSession();
    if (!isAdminAuth.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = UpdateUserRoleSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است.' };
    const { userId, role } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>('UPDATE users SET role = ? WHERE id = ?', [role, parseInt(userId, 10)]);
        if (result.affectedRows === 0) return { success: false, error: 'کاربر یافت نشد یا نقش تغییر نکرد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user role in MySQL:", error);
        return { success: false, error: 'خطا در به‌روزرسانی نقش کاربر.' };
    } finally {
        if (connection) connection.release();
    }
}


// --- Product Management Actions (Admin) ---
const ProductSchema = z.object({
    name: z.string().min(3, "نام محصول باید حداقل ۳ کاراکتر باشد."), description: z.string().optional().nullable(),
    price: z.coerce.number().positive("قیمت نقدی باید مثبت باشد."), installment_price: z.coerce.number().positive("قیمت اقساطی باید مثبت باشد.").optional().nullable(),
    check_price: z.coerce.number().positive("قیمت چکی باید مثبت باشد.").optional().nullable(), original_price: z.coerce.number().positive("قیمت اصلی باید مثبت باشد.").optional().nullable(),
    discount_percent: z.coerce.number().min(0).max(100, "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.").optional().nullable(),
    image_url: z.string().optional().nullable(), category_id: z.string().optional().nullable(), stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
    is_active: z.boolean().default(true), is_featured: z.boolean().default(false), is_new: z.boolean().default(false),
});

export async function createProduct(data: z.infer<typeof ProductSchema>): Promise<{ success: boolean; error?: string; productId?: number }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = ProductSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const validatedData = validation.data;
    let connection;
    try {
        const imageUrl = await saveBase64Image(validatedData.image_url || '', 'product', UPLOADS_DIR_PRODUCTS, PUBLIC_UPLOADS_PATH_PRODUCTS);
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>(
            `INSERT INTO products (name, description, price, installment_price, check_price, original_price, discount_percent, image_url, category_id, stock, is_active, is_featured, is_new, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [ validatedData.name, validatedData.description, validatedData.price, validatedData.installment_price, validatedData.check_price, validatedData.original_price,
              validatedData.discount_percent, imageUrl, validatedData.category_id, validatedData.stock, validatedData.is_active, validatedData.is_featured, validatedData.is_new ]
        );
        return { success: true, productId: result.insertId };
    } catch (error: any) {
        console.error("Error creating product in MySQL:", error);
        return { success: false, error: 'خطا در ایجاد محصول در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateProduct(productId: number, data: Partial<z.infer<typeof ProductSchema>>): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const partialSchema = ProductSchema.partial();
    const validation = partialSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const validatedData = validation.data;
    if (Object.keys(validatedData).length === 0) return { success: false, error: 'هیچ داده‌ای برای بروزرسانی ارسال نشده است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const updatePayload: Record<string, any> = { ...validatedData };
        if (validatedData.image_url && validatedData.image_url.startsWith('data:image')) {
            const newImagePath = await saveBase64Image(validatedData.image_url, 'product', UPLOADS_DIR_PRODUCTS, PUBLIC_UPLOADS_PATH_PRODUCTS);
            if (!newImagePath) return { success: false, error: 'خطا در ذخیره تصویر جدید محصول.' };
            updatePayload.image_url = newImagePath;
        } else if (validatedData.image_url === '') updatePayload.image_url = null;
        
        const setClauses = Object.keys(updatePayload).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updatePayload);
        if (values.length === 0) return { success: false, error: "هیچ فیلد معتبری برای بروزرسانی وجود ندارد." };
        const [result] = await connection.query<OkPacket>(`UPDATE products SET ${setClauses}, updated_at = NOW() WHERE id = ?`, [...values, productId]);
        if (result.affectedRows === 0) return { success: false, error: 'محصول مورد نظر یافت نشد یا تغییری ایجاد نشد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product in MySQL:", error);
        return { success: false, error: 'خطا در بروزرسانی محصول در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function deleteProduct(productId: number): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    if (!productId) return { success: false, error: 'شناسه محصول نامعتبر است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [productRows] = await connection.query<RowDataPacket[]>('SELECT image_url FROM products WHERE id = ?', [productId]);
        const [result] = await connection.query<OkPacket>('DELETE FROM products WHERE id = ?', [productId]);
        if (result.affectedRows === 0) return { success: false, error: 'محصول مورد نظر یافت نشد.' };
        if (productRows.length > 0 && productRows[0].image_url) {
            try { await fs.unlink(path.join(process.cwd(), 'public', productRows[0].image_url)); }
            catch (fsError: any) { if (fsError.code !== 'ENOENT') console.error(`Error deleting product image ${productRows[0].image_url}:`, fsError); }
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product from MySQL:", error);
        return { success: false, error: 'خطا در حذف محصول از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchProductsAdmin(): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT p.id, p.name, p.price, p.original_price, p.discount_percent, p.image_url, p.stock, p.is_active, p.is_featured, p.is_new, p.category_id, c.name as category_name, p.created_at, p.updated_at, p.installment_price, p.check_price
             FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC LIMIT 100`
        );
        const products: Product[] = rows.map(row => ({
            id: String(row.id), name: row.name, price: row.price, installment_price: row.installment_price, check_price: row.check_price, original_price: row.original_price,
            discount_percent: row.discount_percent, image_url: row.image_url, stock: row.stock, is_active: Boolean(row.is_active), is_featured: Boolean(row.is_featured),
            is_new: Boolean(row.is_new), category_id: row.category_id ? String(row.category_id) : null, category_name: row.category_name, created_at: row.created_at, updated_at: row.updated_at
        }));
        return { success: true, products };
    } catch (error: any) {
        console.error("Error fetching products from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست محصولات از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchCategoriesForForm(): Promise<{ success: boolean; categories?: Pick<Category, 'id' | 'name'>[]; error?: string }> {
    // This can be called by admin or public context depending on usage
    // const isAdmin = await verifyAdminSession(); 
    // if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name ASC');
        const categories: Pick<Category, 'id' | 'name'>[] = rows.map(row => ({ id: String(row.id), name: row.name }));
        return { success: true, categories };
    } catch (error: any) {
        console.error("Error fetching categories for form from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست دسته‌بندی‌ها.' };
    } finally {
        if (connection) connection.release();
    }
}


// --- Order Management Actions (Admin & Client) ---
const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, "شناسه سفارش الزامی است."),
  status: z.nativeEnum(OrderStatus), // Using the existing OrderStatus type
});

const CreateOrderInputSchema = z.object({
    user_id: z.string(),
    items: z.string(), // JSON string of CartItem[]
    subtotal: z.number(),
    discount_amount: z.number().optional().default(0),
    total_amount: z.number(),
    shipping_address: z.string(), // JSON string of Address
    applied_coupon_code: z.string().optional().nullable(),
    payment_method: z.enum(['cash', 'installments', 'check']),
    payment_details: z.string().optional().nullable(), // JSON string of payment specific details
    check_image_data_url: z.string().optional().nullable(), // Base64 for check image
});


export async function createOrder(
    orderInput: z.infer<typeof CreateOrderInputSchema>
): Promise<{ success: boolean; error?: string; orderId?: number }> {
    const validation = CreateOrderInputSchema.safeParse(orderInput);
    if (!validation.success) {
        return { success: false, error: 'داده‌های ورودی سفارش نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    const { check_image_data_url, ...orderData } = validation.data;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        let finalPaymentDetails = orderData.payment_details;
        if (orderData.payment_method === 'check' && check_image_data_url) {
            const checkImagePath = await saveBase64Image(check_image_data_url, 'check', UPLOADS_DIR_CHECKS, PUBLIC_UPLOADS_PATH_CHECKS);
            if (!checkImagePath) {
                await connection.rollback();
                return { success: false, error: 'خطا در ذخیره تصویر چک.' };
            }
            const details = finalPaymentDetails ? JSON.parse(finalPaymentDetails) : {};
            details.checkInfo = { ...(details.checkInfo || {}), check_image_url: checkImagePath };
            finalPaymentDetails = JSON.stringify(details);
        }

        let orderStatus: OrderStatus = 'pending_confirmation';
        if (orderData.payment_method === 'cash') orderStatus = 'processing';
        else if (orderData.payment_method === 'check') orderStatus = 'pending_check_confirmation';
        else if (orderData.payment_method === 'installments') orderStatus = 'pending_installment_approval';

        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO orders (user_id, items, subtotal, discount_amount, total_amount, status, shipping_address, applied_coupon_code, payment_method, payment_details, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [ parseInt(orderData.user_id, 10), orderData.items, orderData.subtotal, orderData.discount_amount, orderData.total_amount, orderStatus,
              orderData.shipping_address, orderData.applied_coupon_code, orderData.payment_method, finalPaymentDetails ]
        );
        const orderId = result.insertId;

        // --- Commission Logic ---
        const siteSettings = await getSiteSettings();
        const [customerRows] = await connection.query<RowDataPacket[]>('SELECT id, invited_by_user_id, phone, email, first_name FROM users WHERE id = ?', [parseInt(orderData.user_id,10)]);
        
        if (customerRows.length > 0) {
            const customer = customerRows[0];
            let currentInviterId: number | null = customer.invited_by_user_id;
            const numberOfLevels = siteSettings.mlm_number_of_levels || 0;
            const levelPercentages = siteSettings.mlm_level_percentages || [];

            for (let level = 0; level < numberOfLevels; level++) {
                if (!currentInviterId || (levelPercentages[level] ?? 0) <= 0) break;

                const [inviterRows] = await connection.query<RowDataPacket[]>('SELECT id, invited_by_user_id, wallet_balance FROM users WHERE id = ?', [currentInviterId]);
                if (inviterRows.length > 0) {
                    const inviter = inviterRows[0];
                    const commissionAmount = (orderData.total_amount * (levelPercentages[level] / 100));
                    if (commissionAmount > 0) {
                        const newBalance = parseFloat(inviter.wallet_balance) + commissionAmount;
                        await connection.query('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, inviter.id]);
                        await connection.query(
                            'INSERT INTO transactions (user_id, order_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                            [inviter.id, orderId, 'commission', commissionAmount, `پورسانت سطح ${level + 1} از سفارش ${orderId}`]
                        );
                    }
                    currentInviterId = inviter.invited_by_user_id; 
                } else {
                    break; 
                }
            }
            // Send notifications after commission logic
            if (customer.phone) sendOrderConfirmationSmsToCustomer(customer.phone, String(orderId), customer.first_name).catch(e => console.error(`SMS Error: ${e.message}`));
            if (customer.email) sendOrderConfirmationEmailToCustomer(customer.email, String(orderId), customer.first_name, `/user/orders/${orderId}`).catch(e => console.error(`Email Error: ${e.message}`));
        }
        
        if (ADMIN_NOTIFICATION_PHONE) sendOrderConfirmationSmsToAdmin(ADMIN_NOTIFICATION_PHONE, String(orderId), customerRows[0]?.first_name, orderData.total_amount).catch(e => console.error(`Admin SMS Error: ${e.message}`));
        if (ADMIN_NOTIFICATION_EMAIL) sendOrderConfirmationEmailToAdmin(ADMIN_NOTIFICATION_EMAIL, String(orderId), customerRows[0]?.first_name, orderData.total_amount, `/admin/orders/${orderId}`).catch(e => console.error(`Admin Email Error: ${e.message}`));

        await connection.commit();
        return { success: true, orderId };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("Error creating order in MySQL:", error);
        return { success: false, error: 'خطا در ثبت سفارش در پایگاه داده: ' + error.message };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchOrders(): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT id, user_id, total_amount, status, payment_method, created_at, items, shipping_address, payment_details, subtotal, discount_amount, applied_coupon_code FROM orders ORDER BY created_at DESC LIMIT 50'
        );
        const orders: Order[] = rows.map(row => {
             let items: CartItem[] = []; let shippingAddress: Address | null = null; let paymentDetails: any = {};
             try { items = JSON.parse(row.items || '[]'); } catch (e) { console.error(`Error parsing items for order ${row.id}:`, e); }
             try { shippingAddress = JSON.parse(row.shipping_address || '{}'); } catch (e) { console.error(`Error parsing address for order ${row.id}:`, e); }
             try { paymentDetails = JSON.parse(row.payment_details || '{}'); } catch (e) { console.error(`Error parsing payment details for order ${row.id}:`, e); }
            return { id: String(row.id), user_id: String(row.user_id), total_amount: row.total_amount, status: row.status, payment_method: row.payment_method,
                     created_at: row.created_at, items: items, shipping_address: shippingAddress, subtotal: row.subtotal, discount_amount: row.discount_amount,
                     payment_details: paymentDetails, applied_coupon_code: row.applied_coupon_code };
        });
        return { success: true, orders };
    } catch (error: any) {
        console.error("Error fetching orders from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست سفارشات از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateOrderStatus(data: z.infer<typeof OrderStatusUpdateSchema>): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = OrderStatusUpdateSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')  };
    const { orderId, status } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [orderRows] = await connection.query<RowDataPacket[]>('SELECT user_id FROM orders WHERE id = ?', [parseInt(orderId, 10)]);
        if (orderRows.length === 0) { await connection.rollback(); return { success: false, error: 'سفارش یافت نشد.' }; }
        const orderUserId = orderRows[0].user_id;
        const [result] = await connection.query<OkPacket>('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, parseInt(orderId, 10)]);
        if (result.affectedRows === 0) { await connection.rollback(); return { success: false, error: 'وضعیت سفارش تغییر نکرد یا سفارش یافت نشد.' }; }
        
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT phone, email, first_name FROM users WHERE id = ?', [orderUserId]);
        await connection.commit();

        if (userRows.length > 0) {
            const customer = userRows[0];
            // const translatedStatus = status; // TODO: Implement translation if needed
            if (customer.phone) sendOrderStatusUpdateSmsToCustomer(customer.phone, orderId, status, customer.first_name).catch(e => console.error(`SMS Error: ${e.message}`));
            if (customer.email) sendOrderStatusUpdateEmailToCustomer(customer.email, orderId, status, customer.first_name, `/user/orders/${orderId}`).catch(e => console.error(`Email Error: ${e.message}`));
        }
        return { success: true };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("Error updating order status in MySQL:", error);
        return { success: false, error: 'خطا در به‌روزرسانی وضعیت سفارش.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchUserOrders(userId: string, filters?: { status?: OrderStatus; searchTerm?: string }): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    // TODO: Add user session verification if this is meant to be called directly by the user
    let connection;
    try {
        connection = await pool.getConnection();
        let query = 'SELECT id, user_id, total_amount, status, payment_method, created_at FROM orders WHERE user_id = ?';
        const queryParams: (string | number)[] = [parseInt(userId, 10)];

        if (filters?.status && filters.status !== 'all') { // Assuming 'all' is a UI filter option not passed here
            query += ' AND status = ?';
            queryParams.push(filters.status);
        }
        if (filters?.searchTerm) {
            query += ' AND id LIKE ?'; // Searching by order ID (which is numeric)
            queryParams.push(`%${filters.searchTerm}%`);
        }
        query += ' ORDER BY created_at DESC LIMIT 50';

        const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
        
        const orders: Order[] = rows.map(row => ({
            id: String(row.id),
            orderNumber: String(row.id), // Use id as orderNumber for display
            user_id: String(row.user_id),
            total_amount: parseFloat(row.total_amount),
            status: row.status,
            payment_method: row.payment_method,
            created_at: row.created_at,
            // items and shipping_address would require more complex parsing or separate queries if needed here
            items: [], // Placeholder
            shipping_address: {}, // Placeholder
            subtotal: 0, // Placeholder
            discount_amount: 0, // Placeholder
        }));
        return { success: true, orders };
    } catch (error: any) {
        console.error(`Error fetching orders for user ${userId}:`, error);
        return { success: false, error: 'خطا در دریافت لیست سفارشات کاربر.' };
    } finally {
        if (connection) connection.release();
    }
}


// --- Category Management Actions (Admin) ---
export async function fetchCategoriesAdmin(): Promise<{ success: boolean; categories?: Category[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id, name, slug, description, image_url, parent_id, `order`, is_active FROM categories ORDER BY name ASC');
        const categories: Category[] = rows.map(row => ({
            id: String(row.id), name: row.name, slug: row.slug, description: row.description, image_url: row.image_url,
            parent_id: row.parent_id ? String(row.parent_id) : null, order: row.order, is_active: Boolean(row.is_active),
        }));
        return { success: true, categories };
    } catch (error: any) {
        console.error("Error fetching categories from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست دسته‌بندی‌ها از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- Banner Management Actions (Admin) ---
const BannerSchema = z.object({
  title: z.string().max(100).optional().nullable(), description: z.string().max(255).optional().nullable(),
  image_url: z.string().min(1, { message: "تصویر بنر (دسکتاپ) الزامی است." }), mobile_image_url: z.string().optional().nullable().or(z.literal('')),
  link: z.string().url({ message: "لینک نامعتبر است." }).optional().nullable().or(z.literal('')),
  order: z.number().int().min(0, { message: "ترتیب نمایش باید مثبت باشد." }), is_active: z.boolean().default(true),
});

export async function createBanner(data: z.infer<typeof BannerSchema>): Promise<{ success: boolean; error?: string; bannerId?: number }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = BannerSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const validatedData = validation.data;
    let connection;
    try {
        const desktopImagePath = await saveBase64Image(validatedData.image_url, 'banner-desktop', UPLOADS_DIR_BANNERS, PUBLIC_UPLOADS_PATH_BANNERS);
        if (!desktopImagePath) return { success: false, error: 'خطا در ذخیره تصویر دسکتاپ بنر.' };
        let mobileImagePath: string | null = null;
        if (validatedData.mobile_image_url) {
            mobileImagePath = await saveBase64Image(validatedData.mobile_image_url, 'banner-mobile', UPLOADS_DIR_BANNERS, PUBLIC_UPLOADS_PATH_BANNERS);
            if (!mobileImagePath && validatedData.mobile_image_url.startsWith('data:image')) return { success: false, error: 'خطا در ذخیره تصویر موبایل بنر.' };
        }
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>(
            'INSERT INTO banners (title, description, image_url, mobile_image_url, link, `order`, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [ validatedData.title, validatedData.description, desktopImagePath, mobileImagePath, validatedData.link, validatedData.order, validatedData.is_active ]
        );
        return { success: true, bannerId: result.insertId };
    } catch (error: any) {
        console.error("Error creating banner in MySQL:", error);
        return { success: false, error: 'خطا در ایجاد بنر در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateBanner(bannerId: number, data: Partial<z.infer<typeof BannerSchema>>): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const partialSchema = BannerSchema.partial();
    const validation = partialSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const validatedData = validation.data;
    if (Object.keys(validatedData).length === 0) return { success: false, error: 'هیچ داده‌ای برای بروزرسانی ارسال نشده است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const updatePayload: Record<string, any> = { ...validatedData };
        if (validatedData.image_url && validatedData.image_url.startsWith('data:image')) {
            const newDesktopImagePath = await saveBase64Image(validatedData.image_url, 'banner-desktop', UPLOADS_DIR_BANNERS, PUBLIC_UPLOADS_PATH_BANNERS);
            if (!newDesktopImagePath) return { success: false, error: 'خطا در ذخیره تصویر جدید دسکتاپ.' };
            updatePayload.image_url = newDesktopImagePath;
        } else if (validatedData.image_url === '') updatePayload.image_url = null; // Allow clearing image

        if (validatedData.mobile_image_url && validatedData.mobile_image_url.startsWith('data:image')) {
            const newMobileImagePath = await saveBase64Image(validatedData.mobile_image_url, 'banner-mobile', UPLOADS_DIR_BANNERS, PUBLIC_UPLOADS_PATH_BANNERS);
            if (!newMobileImagePath) return { success: false, error: 'خطا در ذخیره تصویر جدید موبایل.' };
            updatePayload.mobile_image_url = newMobileImagePath;
        } else if (validatedData.mobile_image_url === '') updatePayload.mobile_image_url = null; // Allow clearing image
        
        const setClauses = Object.keys(updatePayload).map(key => `${key === 'order' ? '`order`' : key} = ?`).join(', ');
        const values = Object.values(updatePayload);
        if (values.length === 0) return { success: false, error: "هیچ فیلد معتبری برای بروزرسانی وجود ندارد." };
        const [result] = await connection.query<OkPacket>(`UPDATE banners SET ${setClauses}, updated_at = NOW() WHERE id = ?`, [...values, bannerId]);
        if (result.affectedRows === 0) return { success: false, error: 'بنر مورد نظر یافت نشد یا تغییری ایجاد نشد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error updating banner in MySQL:", error);
        return { success: false, error: 'خطا در بروزرسانی بنر در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function deleteBanner(bannerId: number): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    if (!bannerId) return { success: false, error: 'شناسه بنر نامعتبر است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [bannerRows] = await connection.query<RowDataPacket[]>('SELECT image_url, mobile_image_url FROM banners WHERE id = ?', [bannerId]);
        const [result] = await connection.query<OkPacket>('DELETE FROM banners WHERE id = ?', [bannerId]);
        if (result.affectedRows === 0) return { success: false, error: 'بنر مورد نظر یافت نشد.' };
        if (bannerRows.length > 0) {
            const bannerToDelete = bannerRows[0];
            if (bannerToDelete.image_url) try { await fs.unlink(path.join(process.cwd(), 'public', bannerToDelete.image_url)); } catch (fsError: any) { if (fsError.code !== 'ENOENT') console.error(`Error deleting banner image ${bannerToDelete.image_url}:`, fsError); }
            if (bannerToDelete.mobile_image_url) try { await fs.unlink(path.join(process.cwd(), 'public', bannerToDelete.mobile_image_url)); } catch (fsError: any) { if (fsError.code !== 'ENOENT') console.error(`Error deleting mobile banner image ${bannerToDelete.mobile_image_url}:`, fsError); }
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting banner from MySQL:", error);
        return { success: false, error: 'خطا در حذف بنر از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchBannersAdmin(): Promise<{ success: boolean; banners?: Banner[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id, title, description, image_url, mobile_image_url, link, `order`, is_active, created_at, updated_at FROM banners ORDER BY `order` ASC');
        const banners: Banner[] = rows.map(row => ({
            id: row.id, title: row.title, description: row.description, image_url: row.image_url, mobile_image_url: row.mobile_image_url,
            link: row.link, order: row.order, is_active: Boolean(row.is_active), created_at: row.created_at, updated_at: row.updated_at,
        }));
        return { success: true, banners };
    } catch (error: any) {
        console.error("Error fetching banners from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست بنرها از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- Landing Page Management Actions (Admin) ---
export async function fetchLandingPagesAdmin(): Promise<{ success: boolean; landingPages?: LandingPage[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    // TODO: Implement this function to fetch from MySQL
    console.log("fetchLandingPagesAdmin needs implementation for MySQL.");
    return { success: true, landingPages: [] }; // Placeholder
}

// --- Informational Page Actions (Admin & Public) ---
const infoPageSchema = z.object({
    title: z.string().min(3), slug: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), content: z.string().min(10),
    meta_title: z.string().max(60).optional().nullable(), meta_description: z.string().max(160).optional().nullable(), is_active: z.boolean().default(true),
});

export async function createInfoPage(data: z.infer<typeof infoPageSchema>): Promise<{ success: boolean; error?: string; pageId?: number }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const validation = infoPageSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    let connection;
    try {
        connection = await pool.getConnection();
        const [existing] = await connection.query<RowDataPacket[]>('SELECT id FROM info_pages WHERE slug = ?', [data.slug]);
        if (existing.length > 0) return { success: false, error: 'این آدرس (Slug) قبلا استفاده شده است.' };
        const [result] = await connection.query<OkPacket>(
            'INSERT INTO info_pages (title, slug, content, meta_title, meta_description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [data.title, data.slug, data.content, data.meta_title || null, data.meta_description || null, data.is_active]
        );
        return { success: true, pageId: result.insertId };
    } catch (error: any) {
        console.error("Error creating info page in MySQL:", error);
        return { success: false, error: 'خطا در ایجاد صفحه در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function updateInfoPage(pageId: number, data: z.infer<typeof infoPageSchema>): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    const updateSchema = infoPageSchema.omit({ slug: true }); // Slug should not be updatable this way
    const validation = updateSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'داده‌های ورودی نامعتبر است: ' + validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    const { title, content, meta_title, meta_description, is_active } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>(
            'UPDATE info_pages SET title = ?, content = ?, meta_title = ?, meta_description = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
            [title, content, meta_title || null, meta_description || null, is_active, pageId]
        );
        if (result.affectedRows === 0) return { success: false, error: 'صفحه مورد نظر یافت نشد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error updating info page in MySQL:", error);
        return { success: false, error: 'خطا در بروزرسانی صفحه در پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function deleteInfoPage(pageId: number): Promise<{ success: boolean; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    if (!pageId) return { success: false, error: 'شناسه صفحه نامعتبر است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query<OkPacket>('DELETE FROM info_pages WHERE id = ?', [pageId]);
        if (result.affectedRows === 0) return { success: false, error: 'صفحه مورد نظر یافت نشد.' };
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting info page from MySQL:", error);
        return { success: false, error: 'خطا در حذف صفحه از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchInfoPagesAdmin(): Promise<{ success: boolean; pages?: InfoPage[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id, title, slug, is_active, created_at, updated_at FROM info_pages ORDER BY title ASC');
        const pages: InfoPage[] = rows.map(row => ({
            id: row.id, title: row.title, slug: row.slug, is_active: Boolean(row.is_active), created_at: row.created_at, updated_at: row.updated_at, content: '', // Content not needed for list
        }));
        return { success: true, pages };
    } catch (error: any) {
        console.error("Error fetching info pages for admin from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست صفحات.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchInfoPageBySlug(slug: string): Promise<{ success: boolean; page?: InfoPage; error?: string }> {
    if (!slug) return { success: false, error: 'آدرس صفحه نامعتبر است.' };
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM info_pages WHERE slug = ? AND is_active = 1', [slug]);
        if (rows.length === 0) return { success: false, error: 'صفحه یافت نشد یا غیرفعال است.' };
        const row = rows[0];
        const page: InfoPage = {
            id: row.id, title: row.title, slug: row.slug, content: row.content, meta_title: row.meta_title, meta_description: row.meta_description,
            is_active: Boolean(row.is_active), created_at: row.created_at, updated_at: row.updated_at,
        };
        return { success: true, page };
    } catch (error: any) {
        console.error(`Error fetching info page with slug ${slug} from MySQL:`, error);
        return { success: false, error: 'خطا در بارگذاری اطلاعات صفحه.' };
    } finally {
        if (connection) connection.release();
    }
}


// --- Wallet & Referral Actions ---
const WithdrawalRequestSchema = z.object({
    amount: z.coerce.number().positive("مبلغ تسویه باید مثبت باشد."),
    shabaNumber: z.string().regex(/^IR\d{24}$/, "شماره شبا نامعتبر است. باید با IR شروع شده و ۲۶ کاراکتر باشد (مثال: IR123456789012345678901234).").or(z.string().regex(/^\d{24}$/, "شماره شبا باید ۲۴ رقم باشد (بدون IR).")),
});

export async function fetchUserWalletData(userId: string): Promise<{success: boolean, balance?: number, transactions?: Transaction[], error?: string}> {
    // TODO: Verify user session or ensure this is called by an admin/authorized context
    let connection;
    try {
        connection = await pool.getConnection();
        const [userRows] = await connection.query<RowDataPacket[]>('SELECT wallet_balance, first_name, last_name FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return { success: false, error: "کاربر یافت نشد." };
        
        const balance = parseFloat(userRows[0].wallet_balance);

        const [transactionRows] = await connection.query<RowDataPacket[]>(
            'SELECT id, type, amount, description, created_at, status, shaba_number FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        const transactions: Transaction[] = transactionRows.map(row => ({
            id: String(row.id), type: row.type, amount: parseFloat(row.amount), description: row.description, created_at: row.created_at,
            status: row.status, shaba_number: row.shaba_number, user_id: userId, // user_id added for consistency
        }));
        return { success: true, balance, transactions };
    } catch (error: any) {
        console.error(`Error fetching wallet data for user ${userId}:`, error);
        return { success: false, error: "خطا در دریافت اطلاعات کیف پول." };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchUserReferrals(userId: string): Promise<{success: boolean, referrals?: UserReferralDetail[], error?: string}> {
    // TODO: Verify user session
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT r.id, r.first_name, r.last_name, r.created_at as registrationDate, 
             COALESCE(SUM(t.amount), 0) as commissionEarnedFromThisUser
             FROM users r
             LEFT JOIN orders o ON o.user_id = r.id
             LEFT JOIN transactions t ON t.order_id = o.id AND t.user_id = ? AND t.type = 'commission'
             WHERE r.invited_by_user_id = ?
             GROUP BY r.id, r.first_name, r.last_name, r.created_at
             ORDER BY r.created_at DESC`,
            [parseInt(userId, 10), parseInt(userId, 10)]
        );
        const referrals: UserReferralDetail[] = rows.map(row => ({
            id: String(row.id), 
            name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || `کاربر ${row.id}`, 
            registrationDate: row.registrationDate, 
            commissionEarnedFromThisUser: parseFloat(row.commissionEarnedFromThisUser)
        }));
        return { success: true, referrals };
    } catch (error: any) {
        console.error(`Error fetching referrals for user ${userId}:`, error);
        return { success: false, error: "خطا در دریافت لیست کاربران معرفی شده." };
    } finally {
        if (connection) connection.release();
    }
}

export async function requestWalletWithdrawal(userId: string, data: { amount: number; shabaNumber: string }): Promise<{success: boolean, error?: string}> {
    // TODO: Verify user session
    const validation = WithdrawalRequestSchema.safeParse(data);
    if (!validation.success) {
         return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }
    const { amount, shabaNumber } = validation.data;
    const formattedShaba = shabaNumber.startsWith('IR') ? shabaNumber : `IR${shabaNumber}`;


    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userRows] = await connection.query<RowDataPacket[]>('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
        if (userRows.length === 0) {
            await connection.rollback();
            return { success: false, error: "کاربر یافت نشد." };
        }
        const currentBalance = parseFloat(userRows[0].wallet_balance);
        if (amount > currentBalance) {
            await connection.rollback();
            return { success: false, error: "موجودی کیف پول برای تسویه کافی نیست." };
        }
        
        // Placeholder: Check minimum withdrawal amount from settings
        const siteSettings = await getSiteSettings();
        const minWithdrawal = siteSettings.min_withdrawal_amount || 0;
        if (amount < minWithdrawal) {
             await connection.rollback();
             return { success: false, error: `حداقل مبلغ تسویه ${minWithdrawal.toLocaleString('fa-IR')} تومان است.` };
        }


        // Create a withdrawal request transaction
        await connection.query(
            'INSERT INTO transactions (user_id, type, amount, description, status, shaba_number, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [parseInt(userId, 10), 'withdrawal_request', -amount, `درخواست تسویه به شبا: ${formattedShaba}`, 'pending', formattedShaba]
        );
        
        // Option: Deduct from balance now or when admin approves. For now, let's assume it's deducted upon admin approval.
        // If deducting now:
        // const newBalance = currentBalance - amount;
        // await connection.query('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, userId]);

        await connection.commit();
        // TODO: Notify admin about the new withdrawal request
        return { success: true };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error(`Error requesting withdrawal for user ${userId}:`, error);
        return { success: false, error: "خطا در ثبت درخواست تسویه حساب." };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchTotalReferralCommission(userId: string): Promise<{ success: boolean; totalCommission?: number; error?: string }> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            "SELECT SUM(amount) as totalCommission FROM transactions WHERE user_id = ? AND type = 'commission'",
            [parseInt(userId, 10)]
        );
        const totalCommission = rows.length > 0 && rows[0].totalCommission ? parseFloat(rows[0].totalCommission) : 0;
        return { success: true, totalCommission };
    } catch (error: any) {
        console.error(`Error fetching total commission for user ${userId}:`, error);
        return { success: false, error: "خطا در دریافت مجموع پورسانت." };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchCommissionStructure(): Promise<{ success: boolean; structure?: CommissionStructure; error?: string }> {
    try {
        const settings = await getSiteSettings();
        const structure: CommissionStructure = {
            mlm_number_of_levels: settings.mlm_number_of_levels,
            mlm_level_percentages: settings.mlm_level_percentages,
        };
        return { success: true, structure };
    } catch (error: any) {
        console.error("Error fetching commission structure:", error);
        return { success: false, error: "خطا در دریافت ساختار پورسانت." };
    }
}

// --- Ticket System Actions ---
export const CreateTicketSchema = z.object({
  subject: z.string().min(5, "موضوع تیکت باید حداقل ۵ کاراکتر باشد.").max(100, "موضوع تیکت نباید بیشتر از ۱۰۰ کاراکتر باشد."),
  initialMessage: z.string().min(10, "متن پیام باید حداقل ۱۰ کاراکتر باشد.").max(2000, "متن پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد."),
});

export async function createTicket(userId: string, data: z.infer<typeof CreateTicketSchema>): Promise<{ success: boolean; error?: string; ticketId?: number }> {
    // TODO: Add user session verification
    const validation = CreateTicketSchema.safeParse(data);
    if (!validation.success) return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };

    const { subject, initialMessage } = validation.data;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [ticketResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO tickets (user_id, subject, status, priority, created_at, updated_at, last_reply_at, last_reply_by) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW(), ?)',
            [parseInt(userId, 10), subject, 'open', 'medium', 'user']
        );
        const ticketId = ticketResult.insertId;

        await connection.query(
            'INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message, created_at) VALUES (?, ?, ?, ?, NOW())',
            [ticketId, parseInt(userId, 10), 'user', initialMessage]
        );

        await connection.commit();
        return { success: true, ticketId };
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error("Error creating ticket:", error);
        return { success: false, error: 'خطا در ایجاد تیکت جدید.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchUserTickets(userId: string): Promise<{ success: boolean; tickets?: Ticket[]; error?: string }> {
    // TODO: Add user session verification
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT id, subject, status, priority, created_at, updated_at, last_reply_at, last_reply_by FROM tickets WHERE user_id = ? ORDER BY updated_at DESC',
            [parseInt(userId, 10)]
        );
        const tickets: Ticket[] = rows.map(row => ({
            id: String(row.id),
            user_id: userId,
            subject: row.subject,
            status: row.status,
            priority: row.priority,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_reply_at: row.last_reply_at,
            last_reply_by: row.last_reply_by
        }));
        return { success: true, tickets };
    } catch (error: any) {
        console.error(`Error fetching tickets for user ${userId}:`, error);
        return { success: false, error: 'خطا در دریافت لیست تیکت‌ها.' };
    } finally {
        if (connection) connection.release();
    }
}

export async function fetchAdminTickets(filters?: { status?: TicketStatus }): Promise<{ success: boolean; tickets?: Ticket[]; error?: string }> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };
    
    let connection;
    try {
        connection = await pool.getConnection();
        let query = `
            SELECT t.id, t.user_id, t.subject, t.status, t.priority, t.created_at, t.updated_at, t.last_reply_at, t.last_reply_by, 
                   u.first_name, u.last_name, u.phone 
            FROM tickets t
            JOIN users u ON t.user_id = u.id
        `;
        const queryParams: string[] = [];
        if (filters?.status && filters.status !== 'all') {
            query += ' WHERE t.status = ?';
            queryParams.push(filters.status);
        }
        query += ' ORDER BY t.updated_at DESC';

        const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
        const tickets: Ticket[] = rows.map(row => ({
            id: String(row.id),
            user_id: String(row.user_id),
            user_name: `${row.first_name || ''} ${row.last_name || ''} (${row.phone || 'N/A'})`.trim(),
            subject: row.subject,
            status: row.status,
            priority: row.priority,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_reply_at: row.last_reply_at,
            last_reply_by: row.last_reply_by
        }));
        return { success: true, tickets };
    } catch (error: any) {
        console.error("Error fetching tickets for admin:", error);
        return { success: false, error: 'خطا در دریافت لیست تیکت‌ها برای ادمین.' };
    } finally {
        if (connection) connection.release();
    }
}

// --- MLM Stats for Admin Dashboard ---
export async function fetchMlmStats(): Promise<{
    success: boolean;
    totalCommissionLast14Days?: number;
    totalCommissionThisMonth?: number;
    totalCommissionThisYear?: number;
    error?: string;
}> {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin.isAuthenticated) return { success: false, error: 'دسترسی غیرمجاز.' };

    let connection;
    try {
        connection = await pool.getConnection();
        const now = new Date();
        const last14DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 19).replace('T', ' ');
        const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 19).replace('T', ' ');

        const [rows14Days] = await connection.query<RowDataPacket[]>("SELECT SUM(amount) as total FROM transactions WHERE type = 'commission' AND created_at >= ?", [last14DaysStart]);
        const [rowsMonth] = await connection.query<RowDataPacket[]>("SELECT SUM(amount) as total FROM transactions WHERE type = 'commission' AND created_at >= ?", [thisMonthStart]);
        const [rowsYear] = await connection.query<RowDataPacket[]>("SELECT SUM(amount) as total FROM transactions WHERE type = 'commission' AND created_at >= ?", [thisYearStart]);

        return {
            success: true,
            totalCommissionLast14Days: parseFloat(rows14Days[0]?.total) || 0,
            totalCommissionThisMonth: parseFloat(rowsMonth[0]?.total) || 0,
            totalCommissionThisYear: parseFloat(rowsYear[0]?.total) || 0,
        };
    } catch (error: any) {
        console.error("Error fetching MLM stats:", error);
        return { success: false, error: 'خطا در دریافت آمار بازاریابی.' };
    } finally {
        if (connection) connection.release();
    }
}

    

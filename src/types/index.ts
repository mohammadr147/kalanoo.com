
import type { Timestamp } from 'firebase/firestore'; // Keep for compatibility if needed elsewhere, but avoid for MySQL
import * as z from 'zod';

// --- Zod Schemas (Moved from actions.ts) ---

export const adminLoginSchema = z.object({
  username: z.string().min(1, "نام کاربری الزامی است."),
  password: z.string().min(1, "رمز عبور الزامی است."),
});

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^09[0-9]{9}$/, "شماره موبایل معتبر ایرانی وارد کنید."),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست."),
  otp: z.string().length(6, "کد تایید باید ۶ رقم باشد."),
  inviterReferralCode: z.string().optional().nullable(),
});

export const UpdateUserProfileSchema = z.object({
    uid: z.string(),
    first_name: z.string().min(2, "نام باید حداقل ۲ حرف باشد.").optional().nullable(),
    last_name: z.string().min(2, "نام خانوادگی باید حداقل ۲ حرف باشد.").optional().nullable(),
    national_id: z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد.").optional().nullable(),
    email: z.string().email("ایمیل نامعتبر است.").optional().nullable(),
    secondary_phone: z.string().regex(/^09[0-9]{9}$/, "شماره تماس دوم معتبر نیست.").optional().nullable(),
    birth_date: z.string().optional().nullable(), // Stored as YYYY-MM-DD string
    birth_month: z.number().int().min(1).max(12).optional().nullable(),
    birth_day: z.number().int().min(1).max(31).optional().nullable(),
    address: z.string().optional().nullable(), // JSON string of Address object
    profile_image_data_url: z.string().optional().nullable(), // For sending base64 image data
    is_profile_complete: z.boolean().optional(),
});


export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9]+$/, "کد کوپن فقط می‌تواند شامل حروف بزرگ انگلیسی و اعداد باشد."),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive(),
  expiry_date: z.date(),
  usage_limit: z.coerce.number().int().positive().optional().nullable(),
  min_order_value: z.coerce.number().int().nonnegative().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const ValidateCouponCodeSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().positive("مبلغ کل سبد خرید باید مثبت باشد."),
});

export const SendSmsSchema = z.object({
  message: z.string().min(5, { message: "متن پیامک باید حداقل ۵ کاراکتر باشد." }).max(500, { message: "متن پیامک نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد." }),
  targetGroup: z.enum(['all_users']).default('all_users'),
});
export const SendEmailSchema = z.object({
    subject: z.string().min(3, "موضوع ایمیل باید حداقل ۳ کاراکتر باشد.").max(100, "موضوع ایمیل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد."),
    htmlBody: z.string().min(10, "محتوای ایمیل باید حداقل ۱۰ کاراکتر باشد."),
    targetGroup: z.enum(['all_users']).default('all_users'),
});

export const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, "شناسه کاربر الزامی است."),
  role: z.enum(['user', 'agent', 'admin', 'blocked']),
});

export const ProductSchema = z.object({ // Admin Product Form Schema
    name: z.string().min(3, "نام محصول باید حداقل ۳ کاراکتر باشد."), description: z.string().optional().nullable(),
    price: z.coerce.number().positive("قیمت نقدی باید مثبت باشد."), installment_price: z.coerce.number().positive("قیمت اقساطی باید مثبت باشد.").optional().nullable(),
    check_price: z.coerce.number().positive("قیمت چکی باید مثبت باشد.").optional().nullable(), original_price: z.coerce.number().positive("قیمت اصلی باید مثبت باشد.").optional().nullable(),
    discount_percent: z.coerce.number().min(0).max(100, "درصد تخفیف باید بین ۰ تا ۱۰۰ باشد.").optional().nullable(),
    image_url: z.string().optional().nullable(), category_id: z.string().optional().nullable(), stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
    is_active: z.boolean().default(true), is_featured: z.boolean().default(false), is_new: z.boolean().default(false),
});

export const BannerSchema = z.object({ // Admin Banner Form Schema
  title: z.string().max(100).optional().nullable(), description: z.string().max(255).optional().nullable(),
  image_url: z.string().min(1, { message: "تصویر بنر (دسکتاپ) الزامی است." }), mobile_image_url: z.string().optional().nullable().or(z.literal('')),
  link: z.string().url({ message: "لینک نامعتبر است." }).optional().nullable().or(z.literal('')),
  order: z.number().int().min(0, { message: "ترتیب نمایش باید مثبت باشد." }), is_active: z.boolean().default(true),
});

export const infoPageSchema = z.object({ // Admin Info Page Form Schema
    title: z.string().min(3), slug: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), content: z.string().min(10),
    meta_title: z.string().max(60).optional().nullable(), meta_description: z.string().max(160).optional().nullable(), is_active: z.boolean().default(true),
});

export const CreateOrderInputSchema = z.object({
    user_id: z.string(),
    items: z.string(), // JSON string of CartItem[]
    subtotal: z.number(),
    discount_amount: z.number().optional().default(0),
    total_amount: z.number(),
    shipping_address: z.string(), // JSON string of Address
    applied_coupon_code: z.string().optional().nullable(),
    payment_method: z.enum(['cash', 'installments', 'check']),
    payment_details: z.string().optional().nullable(), // JSON string of payment specific details
    check_image_data_url: z.string().optional().nullable(), // Base64 for check image upload
});


export const OrderStatusSchema = z.enum([
    'pending_confirmation', 'pending_payment', 'payment_failed', 'processing',
    'pending_check_confirmation', 'check_approved', 'check_rejected', // Check specific statuses
    'pending_installment_approval', 'installment_approved', 'installment_rejected', // Installment specific
    'shipped', 'delivered', 'cancelled', 'refunded'
]);

export const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, "شناسه سفارش الزامی است."),
  status: OrderStatusSchema,
});


export const WithdrawalRequestSchema = z.object({
    amount: z.coerce.number().positive("مبلغ تسویه باید مثبت باشد."),
    shabaNumber: z.string().regex(/^IR\d{24}$/, "شماره شبا نامعتبر است. باید با IR شروع شده و ۲۶ کاراکتر باشد (مثال: IR123456789012345678901234).").or(z.string().regex(/^\d{24}$/, "شماره شبا باید ۲۴ رقم باشد (بدون IR).")),
});

export const CreateTicketSchema = z.object({
  subject: z.string().min(5, "موضوع تیکت باید حداقل ۵ کاراکتر باشد.").max(100, "موضوع تیکت نباید بیشتر از ۱۰۰ کاراکتر باشد."),
  initialMessage: z.string().min(10, "متن پیام باید حداقل ۱۰ کاراکتر باشد.").max(2000, "متن پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد."),
});


// --- TypeScript Interfaces ---

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  installment_price?: number | null;
  check_price?: number | null;
  original_price?: number | null;
  discount_percent?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  category_id?: string | null;
  category_name?: string | null;
  stock: number;
  is_featured?: boolean | null;
  is_new?: boolean | null;
  is_active: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
    full_address: string | null;
    province: string | null;
    city: string | null;
    postal_code: string | null;
}

export interface UserProfile {
    id?: string;
    uid: string;
    phone: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    national_id?: string | null;
    secondary_phone?: string | null;
    birth_date?: Date | string | null;
    birth_month?: number | null;
    birth_day?: number | null;
    address?: Address | null; // Can be stored as JSON in DB or separate columns
    referral_code?: string | null;
    invited_by_user_id?: string | null;
    wallet_balance?: number;
    role?: 'user' | 'agent' | 'admin' | 'blocked';
    created_at?: Date | string | null;
    last_login_at?: Date | string | null;
    profile_updated_at?: Date | string | null;
    profile_image_url?: string | null;
    is_profile_complete?: boolean | null;
}

export type PaymentMethod = 'cash' | 'installments' | 'check';

export interface CheckPaymentDetails {
    check_number: string;
    bank_name: string;
    due_date: Date | string;
    sayyad_number: string;
    check_image_url?: string | null;
    amount: number;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface InstallmentPaymentDetails {
    plan_id?: string | null;
    number_of_installments?: number | null;
    status?: 'pending_approval' | 'approved' | 'rejected';
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    expiry_date: Date | string;
    usage_limit?: number | null;
    usage_count: number;
    min_order_value?: number | null;
    is_active: boolean;
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
}

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export interface Order {
    id: string;
    user_id: string;
    items: CartItem[] | string;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    status: OrderStatus;
    shipping_address: Address | string;
    applied_coupon_code?: string | null;
    payment_method: PaymentMethod;
    payment_details?: string | null; // JSON string of CheckPaymentDetails or InstallmentPaymentDetails
    created_at?: Date | string;
    updated_at?: Date | string;
    notes?: string | null;
    tracking_number?: string | null;
    orderNumber?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    parent_id?: string | null;
    order?: number | null;
    is_active: boolean;
}

export interface Banner {
    id: string | number;
    title?: string | null;
    description?: string | null;
    image_url: string;
    mobile_image_url?: string | null;
    link?: string | null;
    order: number;
    is_active: boolean;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface LandingPage {
    id: string;
    title: string;
    slug: string;
    image_url?: string | null;
    description?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    background_color?: string | null;
    is_active: boolean;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export interface InfoPage {
    id?: number;
    title: string;
    slug: string;
    content: string;
    meta_title?: string | null;
    meta_description?: string | null;
    is_active: boolean;
    created_at?: Date | string;
    updated_at?: Date | string;
}

export type UserRole = z.infer<typeof UpdateUserRoleSchema.shape.role>;


export interface SiteSettings {
    id?: string | number;
    store_name?: string;
    contact_email?: string;
    contact_phone?: string;
    main_logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    is_installment_enabled?: boolean | null;
    is_check_payment_enabled?: boolean | null;
    mlm_number_of_levels?: number;
    mlm_level_percentages?: number[]; // Array of percentages for each level
    min_withdrawal_amount?: number;
}

export interface KavenegarSettings {
    api_key: string;
    sender_number: string;
    is_otp_template_enabled?: boolean | null;
    otp_template_name?: string | null;
    is_active: boolean;
}


export type TicketStatus = 'open' | 'pending_reply' | 'closed' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
    id: string | number;
    user_id: string;
    user_name?: string; // For display in admin panel
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    created_at: Date | string;
    updated_at: Date | string;
    last_reply_at?: Date | string | null;
    last_reply_by?: 'user' | 'admin' | null;
}

export interface TicketMessage {
    id: string | number;
    ticket_id: string | number;
    sender_id: string;
    sender_type: 'user' | 'admin';
    message: string;
    created_at: Date | string;
    attachments?: string[] | null;
}

export interface SmsLog {
    id?: number;
    recipient_phone: string;
    message_content: string;
    status: 'Sent' | 'Failed' | 'Queued' | 'Delivered' | 'Unknown';
    provider_message_id?: string | null;
    error_message?: string | null;
    sent_at: Date | string;
}

export interface EmailLog {
    id?: number;
    recipient_email: string;
    subject: string;
    status: 'Sent' | 'Failed' | 'Queued';
    error_message?: string | null;
    sent_at: Date | string;
}

export interface Transaction {
    id: string;
    user_id: string;
    order_id?: string | null;
    type: 'commission' | 'purchase' | 'withdrawal' | 'deposit' | 'refund' | 'withdrawal_request';
    amount: number;
    description?: string | null;
    created_at: Date | string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    shaba_number?: string | null;
}

export interface UserReferralDetail {
    id: string;
    name: string;
    registrationDate: string; // Should be Date or string
    commissionEarnedFromThisUser: number;
}

export interface CommissionStructure {
    mlm_number_of_levels?: number;
    mlm_level_percentages?: number[];
}

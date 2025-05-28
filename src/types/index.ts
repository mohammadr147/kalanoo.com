
import type { Timestamp } from 'firebase/firestore'; // Keep for compatibility if needed elsewhere, but avoid for MySQL
import * as z from 'zod';

// Define Product structure using MySQL conventions (snake_case for columns)
export interface Product {
  id: string; // Assuming 'id' is the primary key column name
  name: string;
  description?: string | null;
  price: number; // Default or cash price
  installment_price?: number | null;
  check_price?: number | null;
  original_price?: number | null;
  discount_percent?: number | null;
  image_url?: string | null; // Single primary image
  images?: string[] | null; // Store as JSON string in MySQL or use a separate table
  category_id?: string | null; // Foreign key to categories table
  category_name?: string | null; // For display purposes, populated by JOIN
  stock: number;
  is_featured?: boolean | null; // Use TINYINT(1) in MySQL
  is_new?: boolean | null; // Use TINYINT(1) in MySQL
  is_active: boolean; // Use TINYINT(1) in MySQL for product visibility
  created_at?: Date | string; // MySQL DATETIME or TIMESTAMP
  updated_at?: Date | string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Define Address structure (could be stored as JSON or separate columns in users/orders table)
export interface Address {
    full_address: string | null;
    province: string | null;
    city: string | null;
    postal_code: string | null;
}

// Define UserProfile structure using MySQL conventions
export interface UserProfile {
    id?: string; // From DB, usually number, but keep as string for consistency if needed
    uid: string; // Corresponds to the 'id' column in the 'users' table (or an external auth ID if used)
    phone: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    national_id?: string | null;
    secondary_phone?: string | null;
    birth_date?: Date | string | null; // MySQL DATE or DATETIME
    birth_month?: number | null; // Stored for querying birthdays
    birth_day?: number | null; // Stored for querying birthdays
    address?: Address | null; // Store as JSON or separate columns
    referral_code?: string | null;
    invited_by_user_id?: string | null; // UID of the inviting user (users.id)
    wallet_balance?: number; // Use DECIMAL(10,2) in MySQL
    commission_balance?: number; // Deprecated, merged into wallet_balance
    role?: 'user' | 'agent' | 'admin' | 'blocked';
    created_at?: Date | string | null; // MySQL DATETIME or TIMESTAMP
    last_login_at?: Date | string | null;
    profile_updated_at?: Date | string | null;
    profile_image_url?: string | null;
    is_profile_complete?: boolean | null; // Use TINYINT(1) in MySQL
}

// Define payment method type
export type PaymentMethod = 'cash' | 'installments' | 'check';

// Define details for check payment
export interface CheckPaymentDetails {
    check_number: string;
    bank_name: string;
    due_date: Date | string; // Store as DATE or DATETIME
    sayyad_number: string; // شماره صیاد چک
    check_image_url?: string | null; // URL of the uploaded check image on the server
    amount: number;
    status?: 'pending' | 'approved' | 'rejected';
}

// Define details for installment payment (basic for now)
export interface InstallmentPaymentDetails {
    plan_id?: string | null; // ID of the selected installment plan
    number_of_installments?: number | null;
    status?: 'pending_approval' | 'approved' | 'rejected';
}


// Define Coupon structure using MySQL conventions
export interface Coupon {
    id: string; // Corresponds to 'id' column
    code: string; // User-facing coupon code (unique index in MySQL)
    discount_type: 'percentage' | 'fixed'; // Enum in MySQL or VARCHAR
    discount_value: number;
    expiry_date: Date | string; // MySQL DATETIME or TIMESTAMP
    usage_limit?: number | null;
    usage_count: number;
    min_order_value?: number | null;
    is_active: boolean; // TINYINT(1) in MySQL
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
}

// Define Order Status type
export const OrderStatusSchema = z.enum([
    'pending_confirmation', 'pending_payment', 'payment_failed', 'processing',
    'pending_check_confirmation', 'check_approved', 'check_rejected',
    'pending_installment_approval', 'installment_approved', 'installment_rejected',
    'shipped', 'delivered', 'cancelled', 'refunded'
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;


// Define Order structure using MySQL conventions
export interface Order {
    id: string; // Corresponds to 'id' column
    user_id: string; // Foreign key to users table
    items: CartItem[] | string; // Store as JSON string in MySQL
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    status: OrderStatus; // Use the new OrderStatus type
    shipping_address: Address | string; // Store as JSON string in MySQL
    applied_coupon_code?: string | null;
    payment_method: PaymentMethod; // Use ENUM or VARCHAR
    payment_details?: string | null; // Store JSON stringified details in MySQL TEXT field
    created_at?: Date | string; // MySQL DATETIME or TIMESTAMP
    updated_at?: Date | string;
    notes?: string | null;
    tracking_number?: string | null;
    orderNumber?: string; // For convenience, often same as id
}


// Define Category structure using MySQL conventions
export interface Category {
    id: string; // Corresponds to 'id' column
    name: string;
    slug: string; // Unique index in MySQL
    description?: string | null;
    image_url?: string | null;
    parent_id?: string | null; // Foreign key to self or null
    order?: number | null; // Column name might be `display_order`
    is_active: boolean; // TINYINT(1)
}

// Define Banner structure using MySQL conventions
export interface Banner {
    id: string | number; // Can be number from DB auto-increment
    title?: string | null;
    description?: string | null;
    image_url: string;
    mobile_image_url?: string | null;
    link?: string | null;
    order: number; // Column name might be `display_order`
    is_active: boolean; // TINYINT(1)
    created_at?: Date | string; // MySQL DATETIME or TIMESTAMP
    updated_at?: Date | string;
}

// Define LandingPage structure using MySQL conventions
export interface LandingPage {
    id: string; // Corresponds to 'id' column
    title: string;
    slug: string; // Unique index in MySQL
    image_url?: string | null;
    description?: string | null; // Use TEXT or LONGTEXT in MySQL for HTML
    cta_text?: string | null;
    cta_link?: string | null;
    background_color?: string | null;
    is_active: boolean; // TINYINT(1)
    created_at?: Date | string; // MySQL DATETIME or TIMESTAMP
    updated_at?: Date | string;
}

// New Type for Informational Pages
export interface InfoPage {
    id?: number; // Auto-increment primary key from MySQL
    title: string;
    slug: string; // Unique identifier for the URL, e.g., 'about-us'
    content: string; // HTML content of the page
    meta_title?: string | null; // For SEO
    meta_description?: string | null; // For SEO
    is_active: boolean; // Whether the page is publicly visible
    created_at?: Date | string; // MySQL timestamp
    updated_at?: Date | string; // MySQL timestamp
}

// Zod schema for User Roles
export const UserRoleSchema = z.enum(['user', 'agent', 'admin', 'blocked']);
export type UserRole = z.infer<typeof UserRoleSchema>;


// Define Commission Settings structure (can be stored in a 'settings' table as JSON or individual columns)
export interface CommissionSettings {
    level1_percent: number; // Example snake_case
    level2_percent: number;
    level3_percent: number;
    min_withdrawal_amount?: number | null;
}

// Define General Site Settings structure (can be stored in a 'settings' table)
// This represents potential keys if settings are stored as key-value pairs in a 'settings' table
// or columns if 'settings' table has one row.
export interface SiteSettings {
    id?: string | number; // Usually a single row with a known ID like 1 or 'global'
    store_name?: string;
    contact_email?: string;
    contact_phone?: string;
    main_logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    is_installment_enabled?: boolean | null; // TINYINT(1)
    is_check_payment_enabled?: boolean | null; // TINYINT(1)
    mlm_number_of_levels?: number;
    mlm_level_percentages?: number[];
}

// Define Payment Gateway Settings (Example for Zarinpal)
export interface ZarinpalSettings {
    merchant_id: string;
    is_sandbox: boolean; // TINYINT(1)
    callback_url: string;
    is_active: boolean; // TINYINT(1)
}

// Define SMS Provider Settings (Example for Kavenegar)
export interface KavenegarSettings {
    api_key: string;
    sender_number: string;
    is_otp_template_enabled?: boolean | null; // TINYINT(1)
    otp_template_name?: string | null;
    is_active: boolean; // TINYINT(1)
}

// Define Ticket structure
export type TicketStatus = 'open' | 'pending_reply' | 'closed' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
    id: string | number;
    user_id: string; // User who submitted the ticket
    user_name?: string; // For display, populated by JOIN or from user data
    subject: string;
    status: TicketStatus;
    priority: TicketPriority;
    created_at: Date | string;
    updated_at: Date | string;
    last_reply_at?: Date | string | null; // For sorting
    last_reply_by?: 'user' | 'admin' | null;
}

// Define Ticket Message structure
export interface TicketMessage {
    id: string | number;
    ticket_id: string | number; // Foreign key to tickets
    sender_id: string; // Can be user_id or admin_id (if admins table exists)
    sender_type: 'user' | 'admin';
    message: string; // TEXT in MySQL
    created_at: Date | string;
    attachments?: string[] | null; // JSON array of attachment URLs (optional)
}

// Define SMS Log structure
export interface SmsLog {
    id?: number; // Auto-increment primary key
    recipient_phone: string;
    message_content: string;
    status: 'Sent' | 'Failed' | 'Queued' | 'Delivered' | 'Unknown'; // Match SmsResult status
    provider_message_id?: string | null;
    error_message?: string | null;
    sent_at: Date | string; // Timestamp of when the send attempt was made
}

// Define Email Log structure
export interface EmailLog {
    id?: number; // Auto-increment primary key
    recipient_email: string;
    subject: string;
    // body_content: string; // Optional, might be too large for logs, or store reference
    status: 'Sent' | 'Failed' | 'Queued'; // Simplified status
    error_message?: string | null;
    sent_at: Date | string;
}

// Define Transaction structure for Wallet
export interface Transaction {
    id: string; // From DB (number, converted to string)
    user_id: string;
    order_id?: string | null; // Foreign key to orders table
    type: 'commission' | 'purchase' | 'withdrawal' | 'deposit' | 'refund' | 'withdrawal_request'; // Added withdrawal_request
    amount: number; // Positive for deposit/commission, negative for withdrawal/purchase
    description?: string | null;
    created_at: Date | string;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled'; // For withdrawals or other pending transactions
    shaba_number?: string | null; // For withdrawal requests
}

export interface UserReferralDetail {
    id: string;
    name: string;
    registrationDate: string;
    commissionEarnedFromThisUser: number;
}

export interface CommissionStructure {
    mlm_number_of_levels?: number;
    mlm_level_percentages?: number[];
}
    

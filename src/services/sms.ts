
/**
 * Represents the result of sending an SMS message.
 */
export interface SmsResult {
  /**
   * A unique identifier for the SMS message (from the provider).
   */
  messageId: string;
  /**
   * The status of the SMS message (e.g., Sent, Failed, Queued).
   */
  status: 'Sent' | 'Failed' | 'Queued' | 'Delivered' | 'Unknown';
  /**
   * Optional error message if the sending failed.
   */
  error?: string;
}

/**
 * Asynchronously simulates sending an SMS message to the specified phone number.
 *
 * In a real application:
 * 1. Replace this mock function with actual API calls to your chosen SMS provider (e.g., Kavenegar, SMS.ir, Twilio).
 * 2. Store API keys securely (e.g., in environment variables).
 * 3. Handle potential errors from the SMS provider API.
 * 4. Consider rate limiting and cost implications.
 *
 * @param phoneNumber The recipient's phone number (should be validated and potentially formatted before calling).
 * @param message The text message to send.
 * @returns A promise that resolves to an SmsResult object.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<SmsResult> {
  console.log(`Simulating SMS send to ${phoneNumber}: "${message}"`);

  // Basic validation simulation
  if (!phoneNumber || !message) {
    console.error("SMS Error: Phone number and message are required.");
    return {
      messageId: `mock_fail_${Date.now()}`,
      status: 'Failed',
      error: 'Phone number and message are required.',
    };
  }
  // Placeholder for Kavenegar or other provider API Key check
  if (!process.env.SMS_API_KEY) {
      console.warn("SMS_API_KEY is not defined. SMS sending will be purely a simulation.");
      // return { messageId: `mock_nosmskey_${Date.now()}`, status: 'Failed', error: 'SMS API Key not configured.'};
  }


  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // Short random delay

  // Simulate potential failure (e.g., invalid number format, provider issue)
  const isSuccess = Math.random() > 0.05; // 95% success rate for simulation

  if (isSuccess) {
    const messageId = `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    // console.log(`SMS simulation successful for ${phoneNumber}. Message ID: ${messageId}`);
    return {
      messageId: messageId,
      status: 'Sent', // Or 'Queued' depending on provider response
    };
  } else {
    const errorMsg = 'Simulated SMS provider failure.';
    console.error(`SMS simulation failed for ${phoneNumber}: ${errorMsg}`);
    return {
      messageId: `mock_fail_${Date.now()}`,
      status: 'Failed',
      error: errorMsg,
    };
  }
}

/**
 * Sends bulk SMS messages.
 * In a real application, check if your provider supports bulk sending APIs for efficiency.
 *
 * @param phoneNumbers An array of recipient phone numbers.
 * @param message The text message to send to all recipients.
 * @returns A promise that resolves to an array of SmsResult objects (one for each recipient).
 */
export async function sendBulkSms(phoneNumbers: string[], message: string): Promise<SmsResult[]> {
    console.log(`Simulating bulk SMS send to ${phoneNumbers.length} numbers.`);
    // Simulate sending one by one (or use bulk API if available)
    const results: SmsResult[] = [];
    for (const number of phoneNumbers) {
        // Add a small delay between sends to avoid overwhelming mock/real service
        await new Promise(resolve => setTimeout(resolve, 10));
        const result = await sendSms(number, message);
        results.push(result);
    }
    return results;
}

// --- Birthday Greeting Logic ---
// NOTE: The following function would typically be called by a scheduled task (e.g., Cloud Function Cron Job).
// This code provides the logic but doesn't set up the scheduler itself.

/**
 * Simulates sending a birthday greeting SMS.
 *
 * @param phoneNumber The recipient's phone number.
 * @param recipientName The recipient's first name (optional).
 * @returns A promise resolving to the SmsResult.
 */
export async function sendBirthdayGreeting(phoneNumber: string, recipientName?: string | null): Promise<SmsResult> {
    const namePart = recipientName ? ` ${recipientName}` : '';
    const message = `کاربر گرامی${namePart}، کالانو تولد شما را تبریک می‌گوید! 🎂 امیدواریم سالی پر از شادی و موفقیت پیش رو داشته باشید.`;
    return sendSms(phoneNumber, message);
}


// --- Order Specific SMS ---

export async function sendOrderConfirmationSmsToCustomer(
    phoneNumber: string,
    orderId: string,
    customerName?: string | null
): Promise<SmsResult> {
    const namePart = customerName ? ` ${customerName}` : '';
    const message = `مشتری گرامی${namePart}، سفارش شما با شماره ${orderId} در کالانو ثبت شد و در حال بررسی است. از خرید شما متشکریم.`;
    // TODO: Add to sms_logs table in actions.ts
    return sendSms(phoneNumber, message);
}

export async function sendOrderConfirmationSmsToAdmin(
    adminPhoneNumber: string,
    orderId: string,
    customerName?: string | null,
    totalAmount?: number
): Promise<SmsResult> {
    const customerInfo = customerName ? ` توسط ${customerName}` : '';
    const amountInfo = totalAmount ? ` به مبلغ ${totalAmount.toLocaleString('fa-IR')} تومان` : '';
    const message = `اطلاع مدیر: سفارش جدید ${orderId}${customerInfo}${amountInfo} در کالانو ثبت شد.`;
    // TODO: Add to sms_logs table in actions.ts
    return sendSms(adminPhoneNumber, message);
}

export async function sendOrderStatusUpdateSmsToCustomer(
    phoneNumber: string,
    orderId: string,
    newStatus: string, // Translated status
    customerName?: string | null
): Promise<SmsResult> {
    const namePart = customerName ? ` ${customerName}` : '';
    const message = `مشتری گرامی${namePart}، وضعیت سفارش شما با شماره ${orderId} به "${newStatus}" تغییر کرد. کالانو`;
    // TODO: Add to sms_logs table in actions.ts
    return sendSms(phoneNumber, message);
}


// --- How to use for Birthday Greetings (Conceptual Example for Backend/Cron Job using MySQL) ---
/*
import pool from '@/lib/mysql'; // Import MySQL pool
import { sendBirthdayGreeting } from '@/services/sms';
import type { UserProfile } from '@/types';
import type { RowDataPacket } from 'mysql2';

async function sendDailyBirthdayGreetings() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31

    console.log(`Checking for birthdays on Month: ${currentMonth}, Day: ${currentDay}`);

    let connection;
    try {
        connection = await pool.getConnection();
        // Query users whose birth_month and birth_day match today
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT uid, phone, first_name FROM users WHERE birth_month = ? AND birth_day = ? AND phone IS NOT NULL AND phone != ""',
            [currentMonth, currentDay]
        );

        let greetingsSent = 0;
        if (rows.length === 0) {
             console.log("No users found with birthdays today.");
             return;
        }

        for (const row of rows) {
            const user = row as Pick<UserProfile, 'uid' | 'phone' | 'first_name'>;
            if (user.phone) {
                 console.log(`Sending birthday greeting to ${user.phone} (User ID: ${user.uid}, Name: ${user.first_name})`);
                 // Send SMS (consider sending in parallel with Promise.all for large numbers)
                 sendBirthdayGreeting(user.phone, user.first_name).then(result => {
                     if (result.status !== 'Sent' && result.status !== 'Queued') {
                         console.warn(`Failed to send birthday SMS to ${user.phone}: ${result.error}`);
                         // TODO: Log failure to sms_logs table
                     } else {
                         // TODO: Log success to sms_logs table
                     }
                 }).catch(smsError => {
                      console.error(`Error sending birthday SMS to ${user.phone}:`, smsError);
                 });
                greetingsSent++;
            }
        }
        console.log(`Finished birthday check. Attempted to send ${greetingsSent} greetings.`);

    } catch (error) {
        console.error("Error fetching/processing users for birthday greetings:", error);
    } finally {
         if (connection) connection.release();
    }
}

// Example call (would be triggered by cron):
// sendDailyBirthdayGreetings();
*/

    
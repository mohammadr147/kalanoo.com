
/**
 * Represents the result of sending an email.
 */
export interface EmailResult {
  /**
   * A unique identifier for the email message (from the provider, if available).
   */
  messageId?: string;
  /**
   * The status of the email (e.g., Sent, Failed, Queued).
   */
  status: 'Sent' | 'Failed' | 'Queued';
  /**
   * Optional error message if the sending failed.
   */
  error?: string;
}

/**
 * Asynchronously simulates sending an email.
 * In a real application, replace this with actual email sending logic
 * using a service like Nodemailer with an SMTP provider, or an Email API service.
 *
 * @param to Recipient's email address.
 * @param subject Email subject.
 * @param htmlBody HTML content of the email.
 * @param textBody Plain text content of the email (optional, for fallback).
 * @returns A promise that resolves to an EmailResult object.
 */
export async function sendEmailPlaceholder(
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string
): Promise<EmailResult> {
  console.log(`Simulating Email Send to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`HTML Body: ${htmlBody.substring(0, 100)}...`); // Log a snippet
  if (textBody) {
    console.log(`Text Body: ${textBody.substring(0, 100)}...`);
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulate success/failure
  const isSuccess = Math.random() > 0.05; // 95% success rate

  if (isSuccess) {
    // console.log(`Email simulation successful for ${to}.`);
    return {
      messageId: `mock_email_${Date.now()}`,
      status: 'Sent',
    };
  } else {
    const errorMsg = 'Simulated email provider failure.';
    console.error(`Email simulation failed for ${to}: ${errorMsg}`);
    return {
      status: 'Failed',
      error: errorMsg,
    };
  }
}


// --- Order Specific Emails ---

export async function sendOrderConfirmationEmailToCustomer(
    customerEmail: string,
    orderId: string,
    customerName?: string | null,
    orderDetailsLink?: string // e.g., /user/orders/{orderId}
): Promise<EmailResult> {
    const namePart = customerName ? ` ${customerName}` : '';
    const subject = `کالانو - تایید سفارش شماره ${orderId}`;
    const linkHtml = orderDetailsLink ? `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}${orderDetailsLink}">مشاهده جزئیات سفارش</a></p>` : '';
    const htmlBody = `
        <h1>سفارش شما در کالانو ثبت شد!</h1>
        <p>سلام${namePart} عزیز،</p>
        <p>سفارش شما با شماره <strong>${orderId}</strong> با موفقیت در سیستم ما ثبت شد و به زودی پردازش خواهد شد.</p>
        ${linkHtml}
        <p>از خرید شما سپاسگزاریم،<br/>تیم کالانو</p>
    `;
    // TODO: Add to email_logs table in actions.ts
    return sendEmailPlaceholder(customerEmail, subject, htmlBody);
}

export async function sendOrderConfirmationEmailToAdmin(
    adminEmail: string,
    orderId: string,
    customerName?: string | null,
    totalAmount?: number,
    adminOrderLink?: string // e.g., /admin/orders/{orderId}
): Promise<EmailResult> {
    const customerInfo = customerName ? ` توسط ${customerName}` : '';
    const amountInfo = totalAmount ? ` به مبلغ ${totalAmount.toLocaleString('fa-IR')} تومان` : '';
    const subject = `اطلاع مدیر: سفارش جدید ${orderId} در کالانو`;
    const linkHtml = adminOrderLink ? `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}${adminOrderLink}">مشاهده سفارش در پنل ادمین</a></p>` : '';
    const htmlBody = `
        <h1>سفارش جدید ثبت شد!</h1>
        <p>سفارش جدید با شماره <strong>${orderId}</strong>${customerInfo}${amountInfo} در فروشگاه ثبت شده است.</p>
        ${linkHtml}
        <p>لطفاً جهت بررسی و پردازش به پنل مدیریت مراجعه کنید.</p>
    `;
    // TODO: Add to email_logs table in actions.ts
    return sendEmailPlaceholder(adminEmail, subject, htmlBody);
}

export async function sendOrderStatusUpdateEmailToCustomer(
    customerEmail: string,
    orderId: string,
    newStatus: string, // Translated status
    customerName?: string | null,
    orderDetailsLink?: string
): Promise<EmailResult> {
    const namePart = customerName ? ` ${customerName}` : '';
    const subject = `کالانو - به‌روزرسانی وضعیت سفارش ${orderId}`;
    const linkHtml = orderDetailsLink ? `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}${orderDetailsLink}">مشاهده جزئیات سفارش</a></p>` : '';
    const htmlBody = `
        <h1>وضعیت سفارش شما به‌روز شد!</h1>
        <p>سلام${namePart} عزیز،</p>
        <p>وضعیت سفارش شما با شماره <strong>${orderId}</strong> به <strong>"${newStatus}"</strong> تغییر کرد.</p>
        ${linkHtml}
        <p>با تشکر،<br/>تیم کالانو</p>
    `;
    // TODO: Add to email_logs table in actions.ts
    return sendEmailPlaceholder(customerEmail, subject, htmlBody);
}

// Placeholder for a more generic notification email
export async function sendGenericNotificationEmail(
  to: string,
  subject: string,
  message: string
): Promise<EmailResult> {
    const htmlBody = `<p>${message.replace(/\n/g, '<br>')}</p><p>با احترام،<br/>تیم کالانو</p>`;
    return sendEmailPlaceholder(to, subject, htmlBody, message);
}

    
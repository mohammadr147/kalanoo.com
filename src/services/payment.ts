/**
 * Represents the result of a payment transaction.
 */
export interface PaymentResult {
  /**
   * A unique identifier for the payment transaction.
   */
  transactionId: string;
  /**
   * The status of the payment (e.g., Success, Pending, Failed).
   */
  status: 'Success' | 'Pending' | 'Failed'; // Use specific statuses
}

/**
 * Asynchronously simulates processing a payment for the specified amount.
 * In a real application, this would call a payment gateway API.
 *
 * @param amount The amount to charge.
 * @param paymentMethodIdentifier A string identifying the payment method/gateway being used (for simulation logic).
 * @returns A promise that resolves to a PaymentResult object.
 */
export async function processPayment(amount: number, paymentMethodIdentifier: string): Promise<PaymentResult> {
  console.log(`Simulating payment processing for ${amount} via ${paymentMethodIdentifier}...`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay

  // Simulate success/failure (e.g., based on amount or random chance)
  // For this mock, let's assume success most of the time
  const isSuccess = Math.random() > 0.1; // 90% success rate

  if (isSuccess) {
    const transactionId = `mock_trx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    console.log(`Payment successful. Transaction ID: ${transactionId}`);
    return {
      transactionId: transactionId,
      status: 'Success',
    };
  } else {
    console.error('Payment failed (simulated).');
    return {
      transactionId: `mock_fail_${Date.now()}`,
      status: 'Failed',
    };
  }
}

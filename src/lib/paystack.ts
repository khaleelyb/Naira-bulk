/**
 * Paystack Integration Utility
 * This handles the payment flow using Paystack Inline Javascript
 */

export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('paystack-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.id = 'paystack-script';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Paystack SDK failed to load'));
    document.body.appendChild(script);
  });
};

interface PaystackConfig {
  key: string;
  email: string;
  amount: number; // in Kobo
  ref: string;
  onSuccess: (response: any) => void;
  onCancel: () => void;
}

export const initializePayment = async (config: PaystackConfig) => {
  await loadPaystackScript();
  
  // @ts-ignore
  const handler = window.PaystackPop.setup({
    key: config.key,
    email: config.email,
    amount: config.amount,
    ref: config.ref,
    currency: 'NGN',
    callback: config.onSuccess,
    onClose: config.onCancel,
  });

  handler.openIframe();
};

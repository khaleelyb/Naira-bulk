declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_SCRIPT_ID = 'paystack-inline-js';

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(PAYSTACK_SCRIPT_ID)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.id = PAYSTACK_SCRIPT_ID;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Paystack SDK failed to load'));
    document.body.appendChild(script);
  });
}

export interface PaystackConfig {
  key: string;
  email: string;
  /** Amount in Kobo (multiply NGN by 100) */
  amount: number;
  ref: string;
  onSuccess: (response: { reference: string }) => void;
  onCancel: () => void;
}

export async function initializePayment(config: PaystackConfig): Promise<void> {
  await loadPaystackScript();
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
}

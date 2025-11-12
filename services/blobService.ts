import { Order, OrderFormData } from '../types';

/**
 * Storage service using Claude's built-in persistent storage API.
 * This works in Claude artifacts without any external dependencies.
 */

interface ServiceStatus {
  isServiceOpen: boolean;
}

/**
 * Convert File to base64 string for storage
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get service status (open/closed)
 */
export async function getServiceStatus(): Promise<boolean> {
  try {
    const result = await window.storage.get('service-status', true);
    if (result && result.value) {
      const statusData: ServiceStatus = JSON.parse(result.value);
      return statusData.isServiceOpen;
    }
    // Default to open if not set
    return true;
  } catch (error) {
    console.log('Service status not found, defaulting to open');
    return true; // Default to open
  }
}

/**
 * Set service status
 */
export async function setServiceStatus(isServiceOpen: boolean): Promise<void> {
  const statusData: ServiceStatus = { isServiceOpen };
  await window.storage.set('service-status', JSON.stringify(statusData), true);
}

/**
 * Create a new order
 */
export async function createOrder(data: OrderFormData): Promise<string> {
  const orderId = `NB-${Date.now()}`;
  
  try {
    // Convert screenshot to base64
    const screenshotBase64 = await fileToBase64(data.screenshot);

    // Create order object
    const order: Order = {
      orderId,
      createdAt: Date.now(),
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      store: data.store,
      notes: data.notes,
      screenshot: screenshotBase64,
      isProcessed: false,
    };

    // Store order (using shared storage so admin can see it)
    await window.storage.set(`order:${orderId}`, JSON.stringify(order), true);

    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add payment proof to an order
 */
export async function addPaymentProof(orderId: string, proofFile: File): Promise<void> {
  try {
    // Get existing order
    const result = await window.storage.get(`order:${orderId}`, true);
    
    if (!result || !result.value) {
      throw new Error('Order not found');
    }

    const order: Order = JSON.parse(result.value);

    // Convert proof to base64
    const proofBase64 = await fileToBase64(proofFile);
    order.paymentProof = proofBase64;

    // Save updated order
    await window.storage.set(`order:${orderId}`, JSON.stringify(order), true);
  } catch (error) {
    console.error('Error adding payment proof:', error);
    throw new Error(`Failed to add payment proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Mark order as processed
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
  try {
    const result = await window.storage.get(`order:${orderId}`, true);
    
    if (!result || !result.value) {
      throw new Error('Order not found');
    }

    const order: Order = JSON.parse(result.value);
    order.isProcessed = true;
    
    await window.storage.set(`order:${orderId}`, JSON.stringify(order), true);
  } catch (error) {
    console.error('Error marking order as processed:', error);
    throw new Error(`Failed to mark order as processed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    // List all order keys
    const listResult = await window.storage.list('order:', true);
    
    if (!listResult || !listResult.keys || listResult.keys.length === 0) {
      return [];
    }

    // Fetch all orders
    const orders: Order[] = [];
    
    for (const key of listResult.keys) {
      try {
        const result = await window.storage.get(key, true);
        if (result && result.value) {
          const order: Order = JSON.parse(result.value);
          orders.push(order);
        }
      } catch (error) {
        console.error(`Error fetching order ${key}:`, error);
        // Continue with other orders
      }
    }

    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw new Error(`Failed to get orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

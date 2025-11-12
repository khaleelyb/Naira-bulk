import { Order, OrderFormData } from '../types';

// WARNING: This approach is insecure for production!
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_D22iusycMNJAXLVz_hyoGM0AmyFt3czH5rkywSlHLC55yv8";
const FOLDER_PREFIX = 'nairabulk_orders';
const CONFIG_PATH = `${FOLDER_PREFIX}/service-status.json`;

interface VercelBlobResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

interface VercelBlobListResult {
  blobs: VercelBlobResult[];
  hasMore: boolean;
  cursor?: string;
}

interface ServiceStatus {
  isServiceOpen: boolean;
}

/**
 * Upload file or data to Vercel Blob
 */
async function put(pathname: string, body: File | string | Blob): Promise<VercelBlobResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("Vercel Blob API token is not configured.");
  }
  
  try {
    const url = `https://blob.vercel-storage.com/${pathname}?token=${BLOB_READ_WRITE_TOKEN}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-vercel-blob-client': 'NairaBulk-App-0.1',
        'x-add-or-replace': '1',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blob PUT Error:', errorText);
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch and parse JSON from a public URL
 */
async function get<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, { 
      cache: 'no-store',
      mode: 'cors' 
    });
    
    if (!response.ok) {
      throw new Error(`Fetch failed (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all blobs with the orders prefix
 */
async function list(): Promise<VercelBlobListResult> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("Vercel Blob API token is not configured.");
  }

  try {
    const url = `https://blob.vercel-storage.com?prefix=${FOLDER_PREFIX}/&limit=1000`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blob LIST Error:', errorText);
      throw new Error(`List failed (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('List error:', error);
    throw new Error(`Failed to list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find a blob by its exact pathname
 */
async function findBlobByPathname(pathname: string): Promise<VercelBlobResult | null> {
  try {
    const listResult = await list();
    return listResult.blobs.find(b => b.pathname === pathname) || null;
  } catch (error) {
    console.error('Error finding blob:', error);
    return null;
  }
}

/**
 * Get service status (open/closed)
 */
export async function getServiceStatus(): Promise<boolean> {
  try {
    const statusBlob = await findBlobByPathname(CONFIG_PATH);
    if (statusBlob) {
      const statusData = await get<ServiceStatus>(statusBlob.url);
      return statusData.isServiceOpen;
    }
    // Default to open if file doesn't exist
    await setServiceStatus(true);
    return true;
  } catch (error) {
    console.error("Could not fetch service status:", error);
    return true; // Fail-safe: default to open
  }
}

/**
 * Set service status
 */
export async function setServiceStatus(isServiceOpen: boolean): Promise<void> {
  const statusData: ServiceStatus = { isServiceOpen };
  const blob = new Blob([JSON.stringify(statusData)], { type: 'application/json' });
  await put(CONFIG_PATH, blob);
}

/**
 * Create a new order
 */
export async function createOrder(data: OrderFormData): Promise<string> {
  const orderId = `NB-${Date.now()}`;
  
  try {
    // 1. Upload screenshot
    const screenshotExtension = data.screenshot.name.split('.').pop() || 'png';
    const screenshotPath = `${FOLDER_PREFIX}/${orderId}-screenshot.${screenshotExtension}`;
    const screenshotResult = await put(screenshotPath, data.screenshot);

    // 2. Create order object
    const order: Order = {
      orderId,
      createdAt: Date.now(),
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      store: data.store,
      notes: data.notes,
      screenshot: screenshotResult.url,
      isProcessed: false,
    };

    // 3. Upload order JSON
    const orderPath = `${FOLDER_PREFIX}/${orderId}.json`;
    const orderBlob = new Blob([JSON.stringify(order)], { type: 'application/json' });
    await put(orderPath, orderBlob);

    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find order blob by ID
 */
async function findOrderBlob(orderId: string): Promise<VercelBlobResult> {
  const orderPathname = `${FOLDER_PREFIX}/${orderId}.json`;
  const orderBlob = await findBlobByPathname(orderPathname);
  
  if (!orderBlob) {
    throw new Error(`Order ${orderId} not found`);
  }
  
  return orderBlob;
}

/**
 * Add payment proof to an order
 */
export async function addPaymentProof(orderId: string, proofFile: File): Promise<void> {
  try {
    // 1. Get existing order
    const orderBlob = await findOrderBlob(orderId);
    const order = await get<Order>(orderBlob.url);

    // 2. Upload payment proof
    const proofExtension = proofFile.name.split('.').pop() || 'png';
    const proofPath = `${FOLDER_PREFIX}/${orderId}-proof.${proofExtension}`;
    const proofResult = await put(proofPath, proofFile);
    
    // 3. Update order with proof URL
    order.paymentProof = proofResult.url;

    // 4. Save updated order
    const updatedOrderBlob = new Blob([JSON.stringify(order)], { type: 'application/json' });
    await put(orderBlob.pathname, updatedOrderBlob);
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
    const orderBlob = await findOrderBlob(orderId);
    const order = await get<Order>(orderBlob.url);
    order.isProcessed = true;
    
    const updatedOrderBlob = new Blob([JSON.stringify(order)], { type: 'application/json' });
    await put(orderBlob.pathname, updatedOrderBlob);
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
    const listResult = await list();
    const orderJsonBlobs = listResult.blobs.filter(
      blob => blob.pathname.endsWith('.json') && blob.pathname !== CONFIG_PATH
    );

    if (orderJsonBlobs.length === 0) {
      return [];
    }
    
    const orders = await Promise.all(
      orderJsonBlobs.map(blob => get<Order>(blob.url))
    );

    return orders;
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw new Error(`Failed to get orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

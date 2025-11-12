import { Order, OrderFormData } from '../types';

/**
 * IMPORTANT SECURITY NOTE:
 * In a production application, the BLOB_READ_WRITE_TOKEN should NEVER be exposed on the client side.
 * Doing so gives anyone with browser developer tools full read/write access to your blob store.
 * The correct approach is to have a secure backend (e.g., using serverless functions) that
 * handles these operations. The client would then make authenticated API calls to your backend,
 * which would in turn interact with Vercel Blob.
 *
 * For the purpose of this self-contained example, we are using the token on the client,
 * but this is NOT recommended for production.
 */
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_API_URL = 'https://blob.vercel-storage.com';
const FOLDER_PREFIX = 'nairabulk_orders'; // Use a distinct folder

if (!BLOB_READ_WRITE_TOKEN) {
  // Disable functionality and log an error to the console.
  console.error("Missing Vercel Blob API token. Please set BLOB_READ_WRITE_TOKEN environment variable. Data operations will fail.");
}

/**
 * Represents the response from a Vercel Blob upload operation.
 */
interface VercelBlobResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

/**
 * Represents the response from a Vercel Blob list operation.
 */
interface VercelBlobListResult {
    blobs: VercelBlobResult[];
    hasMore: boolean;
    cursor?: string;
}


/**
 * Uploads a file or JSON data to Vercel Blob storage.
 * @param pathname - The desired path for the file in the blob store.
 * @param body - The content to upload (File or stringified JSON).
 * @returns The result of the upload operation.
 */
async function put(pathname: string, body: File | string): Promise<VercelBlobResult> {
  if (!BLOB_READ_WRITE_TOKEN) throw new Error("Vercel Blob API token is not configured.");
  
  const response = await fetch(`${BLOB_API_URL}/${pathname}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
      'x-vercel-blob-client': 'NairaBulk-App-0.1',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to blob storage: ${errorText}`);
  }
  return response.json();
}

/**
 * Fetches and parses a JSON file from a given URL.
 * @param url - The public URL of the JSON file to fetch.
 * @returns The parsed JSON object.
 */
async function get<T>(url: string): Promise<T> {
    // Public blob URLs can be fetched directly without auth
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch from blob storage: ${await response.text()}`);
    }
    return response.json();
}

/**
 * Lists all files in the blob store under the designated orders folder.
 * @returns A list of blob metadata objects.
 */
async function list(): Promise<VercelBlobListResult> {
    if (!BLOB_READ_WRITE_TOKEN) throw new Error("Vercel Blob API token is not configured.");

    const response = await fetch(`${BLOB_API_URL}?list=1`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: `${FOLDER_PREFIX}/`, limit: 1000 })
    });
     if (!response.ok) {
        throw new Error(`Failed to list blobs: ${await response.text()}`);
    }
    return response.json();
}

/**
 * Creates a new order by uploading the screenshot and order data.
 * @param data - The order data from the form.
 * @returns The generated Order ID.
 */
export async function createOrder(data: OrderFormData): Promise<string> {
    const orderId = `NB-${Date.now()}`;
    
    // 1. Upload screenshot
    const screenshotExtension = data.screenshot.name.split('.').pop() || 'png';
    const screenshotPath = `${FOLDER_PREFIX}/${orderId}-screenshot.${screenshotExtension}`;
    const screenshotResult = await put(screenshotPath, data.screenshot);

    // 2. Create order JSON object with the screenshot URL
    const order: Order = {
        ...data,
        orderId,
        createdAt: Date.now(),
        screenshot: screenshotResult.url,
        isProcessed: false,
    };

    // 3. Upload order JSON
    const orderPath = `${FOLDER_PREFIX}/${orderId}.json`;
    await put(orderPath, JSON.stringify(order));

    return orderId;
}

/**
 * Finds an order's JSON file blob metadata by its ID.
 * @param orderId - The ID of the order to find.
 * @returns The blob metadata for the order's JSON file.
 */
async function findOrderBlob(orderId: string): Promise<VercelBlobResult> {
    const listResult = await list();
    const orderPathname = `${FOLDER_PREFIX}/${orderId}.json`;
    const orderBlob = listResult.blobs.find(b => b.pathname === orderPathname);
    if (!orderBlob) {
        throw new Error(`Order with ID ${orderId} not found.`);
    }
    return orderBlob;
}

/**
 * Adds a payment proof to an existing order.
 * @param orderId - The ID of the order to update.
 * @param proofFile - The payment proof image file.
 */
export async function addPaymentProof(orderId: string, proofFile: File): Promise<void> {
    // 1. Find the existing order JSON to get its data
    const orderBlob = await findOrderBlob(orderId);
    const order = await get<Order>(orderBlob.url);

    // 2. Upload the new payment proof file
    const proofExtension = proofFile.name.split('.').pop() || 'png';
    const proofPath = `${FOLDER_PREFIX}/${orderId}-proof.${proofExtension}`;
    const proofResult = await put(proofPath, proofFile);
    
    // 3. Update the order object with the new proof URL
    order.paymentProof = proofResult.url;

    // 4. Re-upload the updated order JSON, overwriting the old one
    await put(orderBlob.pathname, JSON.stringify(order));
}

/**
 * Marks an order as processed.
 * @param orderId - The ID of the order to mark as processed.
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
    const orderBlob = await findOrderBlob(orderId);
    const order = await get<Order>(orderBlob.url);
    order.isProcessed = true;
    await put(orderBlob.pathname, JSON.stringify(order));
}

/**
 * Retrieves all orders from the blob store.
 * @returns An array of all orders.
 */
export async function getAllOrders(): Promise<Order[]> {
    const listResult = await list();
    const orderJsonBlobs = listResult.blobs.filter(blob => blob.pathname.endsWith('.json'));

    if (orderJsonBlobs.length === 0) {
        return [];
    }
    
    const orders = await Promise.all(
        orderJsonBlobs.map(blob => get<Order>(blob.url))
    );

    return orders;
}

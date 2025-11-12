
import { createClient } from '@supabase/supabase-js';
import { Order, OrderFormData } from '../types';

const supabaseUrl = 'https://dqgzeswlviazddrgxidd.supabase.co';
// This key should be the public anonymous key, provided via environment variables.
// The execution environment provides API keys via process.env.API_KEY.
const supabaseKey = process.env.API_KEY;

if (!supabaseKey) {
    throw new Error("API key for Supabase is not configured. Please ensure the API_KEY environment variable is set.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'nairabulk'; // The name of the public storage bucket
const FOLDER_PREFIX = 'orders'; // A folder within the bucket for organization

interface ServiceStatus {
    isServiceOpen: boolean;
}

/**
 * Retrieves the current service status from the database.
 * Defaults to 'open' if the status isn't set.
 * @returns A boolean indicating if the service is open.
 */
export async function getServiceStatus(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'service-status')
            .single();

        if (error) {
            // 'PGRST116' is the error code for "Not Found".
            if (error.code === 'PGRST116') {
                console.log('Service status not found, creating default (open).');
                await setServiceStatus(true);
                return true;
            }
            throw error;
        }

        // data.value could be null or not the shape we expect
        if (data?.value && typeof (data.value as ServiceStatus).isServiceOpen === 'boolean') {
            return (data.value as ServiceStatus).isServiceOpen;
        }
        
        // If data is malformed or value is null, treat it as not found and reset it.
        console.warn('Service status value is malformed or null. Resetting to default (open).');
        await setServiceStatus(true);
        return true;

    } catch (error) {
        const errorMessage = (error && typeof error === 'object' && 'message' in error) 
            ? (error as { message: string }).message 
            : String(error);
        console.error("Could not fetch service status, defaulting to open:", errorMessage);
        return true; // Fail-safe: default to open on any error
    }
}

/**
 * Sets the service's open/closed status in the database.
 * @param isServiceOpen - The new status to set.
 */
export async function setServiceStatus(isServiceOpen: boolean): Promise<void> {
    const statusData: ServiceStatus = { isServiceOpen };
    const { error } = await supabase
        .from('config')
        .upsert({ key: 'service-status', value: statusData });
    
    if (error) {
        console.error('Failed to set service status:', error);
        throw new Error(`Failed to set service status: ${error.message}`);
    }
}


/**
 * Creates a new order by uploading the screenshot and creating a database record.
 * @param data - The order data from the form.
 * @returns The generated Order ID.
 */
export async function createOrder(data: OrderFormData): Promise<string> {
    const orderId = `NB-${Date.now()}`;
    
    const screenshotExtension = data.screenshot.name.split('.').pop() || 'png';
    const screenshotPath = `${FOLDER_PREFIX}/${orderId}-screenshot.${screenshotExtension}`;
    
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(screenshotPath, data.screenshot);

    if (uploadError) {
        console.error('Screenshot upload failed:', uploadError);
        throw new Error(`Failed to upload screenshot: ${uploadError.message}`);
    }

    const { data: { publicUrl: screenshotUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(screenshotPath);
        
    if (!screenshotUrl) {
        throw new Error("Could not retrieve public URL for screenshot.");
    }

    const orderRecordForDb = {
        orderId,
        createdAt: new Date().toISOString(),
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        store: data.store,
        screenshot: screenshotUrl,
        notes: data.notes || null,
        isProcessed: false,
    };

    const { error: insertError } = await supabase
        .from('orders')
        .insert(orderRecordForDb);

    if (insertError) {
        console.error('Failed to create order record:', insertError);
        // Clean up the uploaded file if the database insert fails
        await supabase.storage.from(BUCKET_NAME).remove([screenshotPath]);
        throw new Error(`Failed to save order details: ${insertError.message}`);
    }

    return orderId;
}

/**
 * Adds a payment proof to an existing order.
 * @param orderId - The ID of the order to update.
 * @param proofFile - The payment proof image file.
 */
export async function addPaymentProof(orderId: string, proofFile: File): Promise<void> {
    const proofExtension = proofFile.name.split('.').pop() || 'png';
    const proofPath = `${FOLDER_PREFIX}/${orderId}-proof.${proofExtension}`;
    
    // Allow re-uploading the proof if needed.
    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(proofPath, proofFile, { upsert: true }); 

    if (uploadError) {
        console.error('Payment proof upload failed:', uploadError);
        throw new Error(`Failed to upload payment proof: ${uploadError.message}`);
    }

    const { data: { publicUrl: proofUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(proofPath);
        
    if (!proofUrl) {
        throw new Error("Could not retrieve public URL for payment proof.");
    }

    const { error: updateError } = await supabase
        .from('orders')
        .update({ paymentProof: proofUrl })
        .eq('orderId', orderId);

    if (updateError) {
        console.error('Failed to update order with payment proof:', updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
    }
}

/**
 * Marks an order as processed.
 * @param orderId - The ID of the order to mark as processed.
 */
export async function markOrderAsProcessed(orderId: string): Promise<void> {
    const { error } = await supabase
        .from('orders')
        .update({ isProcessed: true })
        .eq('orderId', orderId);

    if (error) {
        console.error(`Failed to mark order ${orderId} as processed:`, error);
        throw new Error(`Failed to process order: ${error.message}`);
    }
}

/**
 * Retrieves all orders from the database.
 * @returns An array of all orders.
 */
export async function getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*');

    if (error) {
        console.error('Failed to fetch all orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    if (!data) return [];
    
    // Convert ISO string `createdAt` to a number (timestamp) to match the `Order` type.
    const orders: Order[] = data.map(order => ({
        ...order,
        createdAt: new Date(order.createdAt).getTime(),
    }));

    return orders;
}

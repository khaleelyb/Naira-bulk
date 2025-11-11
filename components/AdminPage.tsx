
import React, { useEffect, useState } from 'react';
import { FullOrderData } from '../types';

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface OrderCardProps {
    order: FullOrderData;
    onMarkAsProcessed: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkAsProcessed }) => {
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [proofUrl, setProofUrl] = useState<string | null>(null);

    useEffect(() => {
        const ssUrl = URL.createObjectURL(order.screenshot);
        setScreenshotUrl(ssUrl);

        let pUrl: string | null = null;
        if (order.paymentProof) {
            pUrl = URL.createObjectURL(order.paymentProof);
            setProofUrl(pUrl);
        } else {
            setProofUrl(null); // Ensure proofUrl is cleared if paymentProof is removed/not present
        }

        return () => {
            URL.revokeObjectURL(ssUrl);
            if (pUrl) {
                URL.revokeObjectURL(pUrl);
            }
        };
    }, [order.screenshot, order.paymentProof]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Order ID</h3>
                    <p className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">{order.orderId}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    order.paymentProof ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {order.paymentProof ? 'Payment Submitted' : 'Awaiting Payment'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t pt-4">
                <div>
                    <h4 className="font-semibold text-gray-600 mb-1">Customer Details</h4>
                    <dl className="text-sm">
                        <dt className="float-left font-medium text-gray-500 w-20">Name</dt>
                        <dd className="overflow-hidden">{order.fullName}</dd>
                        <dt className="float-left font-medium text-gray-500 w-20">Phone</dt>
                        <dd className="overflow-hidden">{order.phone}</dd>
                        <dt className="float-left font-medium text-gray-500 w-20">Email</dt>
                        <dd className="overflow-hidden">{order.email}</dd>
                        <dt className="float-left font-medium text-gray-500 w-20">Address</dt>
                        <dd className="overflow-hidden">{order.address}</dd>
                    </dl>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 mb-1">Order Info</h4>
                    <dl className="text-sm">
                        <dt className="float-left font-medium text-gray-500 w-20">Store</dt>
                        <dd className="overflow-hidden">{order.store}</dd>
                        {order.notes && <>
                        <dt className="float-left font-medium text-gray-500 w-20">Notes</dt>
                        <dd className="overflow-hidden">{order.notes}</dd>
                        </>}
                    </dl>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Cart Screenshot</h4>
                    {screenshotUrl && (
                        <a href={screenshotUrl} target="_blank" rel="noopener noreferrer" title="View full image">
                            <img src={screenshotUrl} alt="Cart screenshot" className="w-full h-auto max-h-80 object-contain rounded-md border p-1 hover:opacity-80 transition-opacity bg-gray-50" />
                        </a>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Payment Proof</h4>
                    {proofUrl ? (
                         <a href={proofUrl} target="_blank" rel="noopener noreferrer" title="View full image">
                            <img src={proofUrl} alt="Payment proof" className="w-full h-auto max-h-80 object-contain rounded-md border p-1 hover:opacity-80 transition-opacity bg-gray-50" />
                        </a>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded-md border-2 border-dashed p-4">
                            <p className="text-gray-500 text-center">Not provided</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t mt-4 pt-4 flex justify-end items-center">
                {order.isProcessed ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-100 font-semibold px-4 py-2 rounded-lg">
                        <CheckCircleIcon className="h-6 w-6" />
                        <span>Processed</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => onMarkAsProcessed(order.orderId)}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!order.paymentProof}
                        title={!order.paymentProof ? "Cannot process until payment proof is submitted" : "Mark as processed"}
                    >
                        Mark as Processed
                    </button>
                )}
            </div>
        </div>
    );
};


interface AdminPageProps {
  orders: FullOrderData[];
  onMarkAsProcessed: (orderId: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ orders, onMarkAsProcessed }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Admin Panel
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800">No Orders Yet</h3>
          <p className="mt-2 text-gray-500">When users submit orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-gray-600 px-2">Displaying {orders.length} order(s), newest first.</p>
          {orders.slice().reverse().map((order) => (
            <OrderCard key={order.orderId} order={order} onMarkAsProcessed={onMarkAsProcessed} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;

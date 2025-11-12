import React, { useEffect, useState, useCallback } from 'react';
import { Order } from '../types';
import { getAllOrders, markOrderAsProcessed } from '../services/blobService';
import { SpinnerIcon } from './icons/SpinnerIcon';

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
    order: Order;
    onMarkAsProcessed: (orderId: string) => Promise<void>;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkAsProcessed }) => {
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
                    {order.screenshot && (
                        <a href={order.screenshot} target="_blank" rel="noopener noreferrer" title="View full image">
                            <img src={order.screenshot} alt="Cart screenshot" className="w-full h-auto max-h-80 object-contain rounded-md border p-1 hover:opacity-80 transition-opacity bg-gray-50" />
                        </a>
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 mb-2">Payment Proof</h4>
                    {order.paymentProof ? (
                         <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" title="View full image">
                            <img src={order.paymentProof} alt="Payment proof" className="w-full h-auto max-h-80 object-contain rounded-md border p-1 hover:opacity-80 transition-opacity bg-gray-50" />
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
  isServiceOpen: boolean;
  onToggleServiceStatus: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ isServiceOpen, onToggleServiceStatus }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getAllOrders();
      // Sort by newest first
      fetchedOrders.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleMarkAsProcessed = async (orderId: string) => {
    try {
      await markOrderAsProcessed(orderId);
      // Refetch to get the latest status
      await fetchOrders();
    } catch (err) {
      console.error(`Failed to mark order ${orderId} as processed:`, err);
      alert(`Error: ${err instanceof Error ? err.message : "Could not process order."}`);
    }
  };


  const openOrders = orders.filter(order => !order.isProcessed);
  const closedOrders = orders.filter(order => order.isProcessed);

  const ordersToShow = activeTab === 'open' ? openOrders : closedOrders;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-lg">
          <SpinnerIcon className="h-8 w-8 text-green-600 animate-spin mr-4" />
          <p className="text-lg text-gray-600">Loading Orders...</p>
        </div>
      );
    }
    if (error) {
       return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 mb-6 rounded-xl shadow-lg" role="alert">
            <p className="font-bold">Error Fetching Orders</p>
            <p>{error}</p>
        </div>
      );
    }
    if (orders.length === 0) {
      return (
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800">No Orders Yet</h3>
          <p className="mt-2 text-gray-500">When users submit orders, they will appear here.</p>
        </div>
      );
    }
    return (
        <div>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('open')}
                className={`${
                  activeTab === 'open'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                Open
                <span className={`${
                    activeTab === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                } ml-1 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                    {openOrders.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`${
                  activeTab === 'closed'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                Closed
                <span className={`${
                    activeTab === 'closed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                } ml-1 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                    {closedOrders.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Orders List */}
          {ordersToShow.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800">No {activeTab} orders.</h3>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-gray-600 px-2">Displaying {ordersToShow.length} {activeTab} order(s).</p>
              {ordersToShow.map((order) => (
                <OrderCard key={order.orderId} order={order} onMarkAsProcessed={handleMarkAsProcessed} />
              ))}
            </div>
          )}
        </div>
    );
  };


  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Admin Panel
        </h2>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Service Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">
              {isServiceOpen
                ? <span className="text-green-700">Open for New Orders</span>
                : <span className="text-red-700">Closed for New Orders</span>
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              When closed, users will not be able to start a new order.
            </p>
          </div>
          <button
            onClick={onToggleServiceStatus}
            type="button"
            role="switch"
            aria-checked={isServiceOpen}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isServiceOpen ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                isServiceOpen ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {renderContent()}

    </div>
  );
};

export default AdminPage;

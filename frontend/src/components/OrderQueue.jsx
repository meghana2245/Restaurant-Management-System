import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders();
      if (response.success) {
        
        const activeOrders = response.data.filter(o => o.status !== 'Completed');
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch order queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(fetchOrders, 10000);
    
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleServe = async (orderId) => {
    try {
      const response = await api.serveOrder(orderId);
      if (response.success) {
        showToast('Order marked as served', 'success');
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to update order status', 'error');
    }
  };

  const handleComplete = async (orderId, tableNumber) => {
    try {
      const response = await api.completeOrder(orderId);
      if (response.success) {
        showToast(`Order for Table ${tableNumber} completed. Table is now Available.`, 'success');
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to complete order', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Loading Live Order Queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans text-platea-text">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="flex items-center justify-center bg-purple-50 text-platea-primary p-2.5 rounded-xl border border-purple-100 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <span>Live Order Queue</span>
            <span className="relative flex h-3 w-3 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor and manage active customer orders. Click to mark as served or complete checkout.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16" />
          </svg>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 text-sm font-semibold">
          No active orders in the queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isPending = order.status === 'Pending';
            
            return (
              <div key={order._id} className="bg-platea-surface border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-extrabold bg-slate-800 text-white px-2 py-0.5 rounded-lg">
                        T{order.tableId?.tableNumber || '?'}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isPending 
                          ? 'bg-purple-50 text-platea-primary border border-purple-100' 
                          : 'bg-orange-50 text-platea-accent border border-orange-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{orderTime}</span>
                  </div>

                  
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Items</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{item.menuItemId?.name || 'Dish'}</span>
                          <span className="text-slate-400">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                
                <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-500 mb-2">
                    <span>Total Bill</span>
                    <span className="text-slate-800 text-sm font-black">₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                  
                  {isPending && (
                    <button
                      onClick={() => handleServe(order._id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center"
                    >
                      Mark as Served
                    </button>
                  )}

                  <button
                    onClick={() => handleComplete(order._id, order.tableId?.tableNumber)}
                    className="w-full bg-platea-primary hover:bg-opacity-90 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center"
                  >
                    Checkout & Clear Table
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderQueue;

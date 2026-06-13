import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';


const renderChairsForCircle = (capacity, status) => {
  let chairColor = 'bg-platea-primary/20 border-platea-primary/40';
  if (status === 'Occupied') chairColor = 'bg-slate-300 border-slate-400';
  else if (status === 'Reserved') chairColor = 'bg-platea-accent/20 border-platea-accent/40';

  return Array.from({ length: capacity }).map((_, idx) => {
    const angle = (idx * 360) / capacity;
    const radius = 48; 
    const style = {
      transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
    };
    return (
      <div
        key={idx}
        style={style}
        className={`absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-sm border ${chairColor} transition-colors duration-200 z-0`}
      />
    );
  });
};


const renderChairsForRectangle = (capacity, status) => {
  let chairColor = 'bg-platea-primary/20 border-platea-primary/40';
  if (status === 'Occupied') chairColor = 'bg-slate-300 border-slate-400';
  else if (status === 'Reserved') chairColor = 'bg-platea-accent/20 border-platea-accent/40';

  return Array.from({ length: capacity }).map((_, idx) => {
    const angle = (idx * 360) / capacity;
    const radiusX = 58; 
    const radiusY = 42; 
    const style = {
      transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radiusX}px, ${Math.sin((angle * Math.PI) / 180) * radiusY}px)`,
    };
    return (
      <div
        key={idx}
        style={style}
        className={`absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-sm border ${chairColor} transition-colors duration-200 z-0`}
      />
    );
  });
};

export const FloorPlan = ({ currentUser, onSelectTable, setCurrentView }) => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [selectedOccupiedTable, setSelectedOccupiedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedReservedTable, setSelectedReservedTable] = useState(null);
  const [activeReservation, setActiveReservation] = useState(null);

  
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submittingTable, setSubmittingTable] = useState(false);

  const { showToast } = useToast();
  const isAdmin = currentUser?.role === 'admin';
  const isStaffOrAdmin = currentUser?.role === 'staff' || currentUser?.role === 'admin';

  const fetchData = async () => {
    try {
      const [tablesRes, resRes, ordersRes] = await Promise.all([
        api.getTables(),
        api.getReservations(),
        api.getOrders(),
      ]);

      if (tablesRes.success) {
        setTables(tablesRes.data);
      }
      if (resRes.success) {
        setReservations(resRes.data);
      }
      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Error retrieving floor plan data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableClick = (table) => {
    if (!isStaffOrAdmin) {
      showToast('Only staff and administrators can manage tables.', 'warning');
      return;
    }

    if (table.status === 'Available') {
      if (isAdmin) {
        
        onSelectTable(table);
        setCurrentView('pos');
      } else {
        
        showToast('Waiting for customer to seat and order', 'info');
      }
    } else if (table.status === 'Occupied') {
      
      const order = orders.find(
        (o) => o.tableId?._id === table._id && o.status !== 'Completed'
      );
      setSelectedOccupiedTable(table);
      setActiveOrder(order || null);
    } else if (table.status === 'Reserved') {
      
      const res = reservations.find(
        (r) => r.tableId?._id === table._id
      );
      setSelectedReservedTable(table);
      setActiveReservation(res || null);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tableNumber || !capacity) {
      showToast('Please specify table number and seating capacity', 'error');
      return;
    }

    setSubmittingTable(true);
    try {
      const response = await api.createTable(Number(tableNumber), Number(capacity));
      if (response.success) {
        showToast(`Table ${response.data.tableNumber} added to the floor plan`, 'success');
        setTableNumber('');
        setCapacity('');
        setShowAddForm(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error creating table';
      showToast(errMsg, 'error');
    } finally {
      setSubmittingTable(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeOrder) return;
    try {
      const response = await api.completeOrder(activeOrder._id);
      if (response.success) {
        showToast(`Checkout complete for Table ${selectedOccupiedTable.tableNumber}. Total: ₹${activeOrder.totalAmount}`, 'success');
        setSelectedOccupiedTable(null);
        setActiveOrder(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showToast('Checkout failed', 'error');
    }
  };

  const handleServeOrder = async () => {
    if (!activeOrder) return;
    try {
      const response = await api.serveOrder(activeOrder._id);
      if (response.success) {
        showToast(`Order for Table ${selectedOccupiedTable.tableNumber} marked as served.`, 'success');
        setSelectedOccupiedTable(null);
        setActiveOrder(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to mark order as served', 'error');
    }
  };

  const handleSeatCustomer = async () => {
    if (!selectedReservedTable) return;
    try {
      
      if (activeReservation) {
        await api.cancelReservation(activeReservation._id);
      }
      
      const response = await api.updateTable(selectedReservedTable._id, { status: 'Occupied' });
      if (response.success) {
        showToast(`Customer seated at Table ${selectedReservedTable.tableNumber}. Status: Occupied`, 'success');
        setSelectedReservedTable(null);
        setActiveReservation(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showToast('Seating operation failed', 'error');
    }
  };

  const handleCancelReservation = async () => {
    if (!activeReservation) return;
    try {
      const response = await api.cancelReservation(activeReservation._id);
      if (response.success) {
        showToast(`Reservation for Table ${selectedReservedTable.tableNumber} cancelled successfully`, 'success');
        setSelectedReservedTable(null);
        setActiveReservation(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showToast('Cancellation failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Mapping layout...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="flex items-center justify-center bg-purple-50 text-platea-primary p-2.5 rounded-xl border border-purple-100 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 3v7a6 6 0 006 6h1v5h2v-5h1a6 6 0 006-6V3M8 3v4M12 3v4M16 3v4" />
              </svg>
            </span>
            <span>Restaurant Floor Plan</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 text-xl select-none opacity-85">
              🍽️ <span className="text-sm opacity-40">•</span> 🍷 <span className="text-sm opacity-40">•</span> 👨‍🍳
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visual status grid of dining tables. Click a table to execute order billing, reservations, or point of sale.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="sm:self-center bg-platea-primary text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-opacity-90 transition-all text-xs flex items-center justify-center font-sans"
          >
            {showAddForm ? 'Close Setup' : '+ Add New Table'}
          </button>
        )}
      </div>

      
      {showAddForm && isAdmin && (
        <form onSubmit={handleAddTable} className="bg-platea-surface p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg animate-fade-in flex flex-wrap gap-4 items-end font-sans">
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <label htmlFor="table-num" className="block text-xs font-bold text-slate-500">
              Table Number
            </label>
            <input
              id="table-num"
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 text-sm font-medium text-platea-text"
              required
            />
          </div>
          <div className="flex-1 min-w-[140px] space-y-1.5">
            <label htmlFor="table-capacity" className="block text-xs font-bold text-slate-500">
              Seating Capacity
            </label>
            <input
              id="table-capacity"
              type="number"
              min="1"
              placeholder="e.g. 4"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 text-sm font-medium text-platea-text"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submittingTable}
            className="bg-platea-primary hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow h-10 flex items-center justify-center disabled:opacity-50"
          >
            {submittingTable ? 'Adding...' : 'Save Table'}
          </button>
        </form>
      )}

      
      {tables.length === 0 ? (
        <div className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 text-sm font-sans">
          No dining tables configured. {isAdmin ? 'Add tables using the control above.' : 'Contact Admin to add tables.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 font-sans">
          {tables.map((table) => {
            let cardBg = 'bg-platea-surface border-2';
            let borderStyle = 'border-platea-primary/20 hover:border-platea-primary/40'; 
            let badgeColor = 'bg-purple-50 text-platea-primary border border-purple-100'; 
            
            if (table.status === 'Occupied') {
              cardBg = 'bg-slate-50 border-2 border-slate-200/60';
              borderStyle = 'border-slate-200';
              badgeColor = 'bg-slate-200 text-slate-600 border border-slate-300';
            } else if (table.status === 'Reserved') {
              cardBg = 'bg-platea-surface border-2';
              borderStyle = 'border-platea-accent/30'; 
              badgeColor = 'bg-orange-50 text-platea-accent border border-orange-100'; 
            }

            const isEven = table.tableNumber % 2 === 0;
            const isOccupied = table.status === 'Occupied';

            return (
              <div
                key={table._id}
                onClick={() => handleTableClick(table)}
                className={`${cardBg} ${borderStyle} rounded-2xl p-5 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-md h-56 select-none relative`}
              >
                
                <div className="z-20">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                    {table.status === 'Reserved' ? 'Reserved 🛎️' : table.status}
                  </span>
                </div>

                
                <div className="relative w-32 h-24 flex items-center justify-center">
                  {isEven ? (
                    
                    <div className="w-24 h-16 rounded-xl bg-white border border-slate-200 shadow-sm relative flex flex-col items-center justify-center transition-all duration-200 z-10">
                      
                      <span className="absolute -top-2 -left-2 bg-slate-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                        T{table.tableNumber}
                      </span>
                      
                      <div className="flex items-center justify-center text-slate-800 font-extrabold select-none z-10">
                        {isOccupied && <span className="text-emerald-600 mr-1 text-xs font-black">✅</span>}
                        <span className="text-sm">{table.capacity}</span>
                        <svg className="w-3.5 h-3.5 ml-1 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 18V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
                          <path d="M5 13h14" />
                          <path d="M5 21h14" />
                          <path d="M7 13v8" />
                          <path d="M17 13v8" />
                        </svg>
                      </div>
                      
                      {renderChairsForRectangle(table.capacity, table.status)}
                    </div>
                  ) : (
                    
                    <div className="w-20 h-20 rounded-full bg-white border border-slate-200 shadow-sm relative flex flex-col items-center justify-center transition-all duration-200 z-10">
                      
                      <span className="absolute -top-1 -left-1 bg-slate-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                        T{table.tableNumber}
                      </span>
                      
                      <div className="flex items-center justify-center text-slate-800 font-extrabold select-none z-10">
                        {isOccupied && <span className="text-emerald-600 mr-1 text-xs font-black">✅</span>}
                        <span className="text-sm">{table.capacity}</span>
                        <svg className="w-3.5 h-3.5 ml-1 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 18V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13" />
                          <path d="M5 13h14" />
                          <path d="M5 21h14" />
                          <path d="M7 13v8" />
                          <path d="M17 13v8" />
                        </svg>
                      </div>
                      
                      {renderChairsForCircle(table.capacity, table.status)}
                    </div>
                  )}
                </div>

                
                <div className="h-2"></div>
              </div>
            );
          })}
        </div>
      )}

      
      {selectedOccupiedTable && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-40 animate-fade-in select-none">
          <div className="bg-platea-surface w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in-right font-sans">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-heading font-bold text-slate-800">Table {selectedOccupiedTable.tableNumber} Order Details</h2>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mt-1">Active Billing</span>
                </div>
                <button
                  onClick={() => { setSelectedOccupiedTable(null); setActiveOrder(null); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeOrder ? (
                <div className="py-6 space-y-6">
                  
                  <div className="space-y-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ordered Items</span>
                    <div className="divide-y divide-slate-50">
                      {activeOrder.items?.map((item, idx) => (
                        <div key={idx} className="py-3 flex justify-between items-center text-sm font-semibold">
                          <div>
                            <span className="text-slate-800 font-bold">{item.menuItemId?.name || 'Dish'}</span>
                            <span className="text-slate-400 text-xs ml-2">x{item.quantity}</span>
                          </div>
                          <span className="text-slate-800">
                            ₹{(item.menuItemId?.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{activeOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Tax (GST 5%)</span>
                      <span>₹{(activeOrder.totalAmount * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-slate-800 pt-2 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span>₹{(activeOrder.totalAmount * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm italic">
                  Active order document could not be matched. Status discrepancy.
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              {activeOrder && activeOrder.status === 'Pending' && (
                <button
                  onClick={handleServeOrder}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center"
                >
                  Mark as Served
                </button>
              )}
              <button
                onClick={handleCheckout}
                disabled={!activeOrder}
                className="w-full bg-platea-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all text-xs disabled:opacity-50"
              >
                Checkout & Clear Table
              </button>
              <button
                onClick={() => { setSelectedOccupiedTable(null); setActiveOrder(null); }}
                className="w-full bg-slate-100 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      
      {selectedReservedTable && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-40 animate-fade-in select-none p-4 font-sans">
          <div className="bg-platea-surface rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-6 animate-scale-up border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-800">Table {selectedReservedTable.tableNumber} Booking</h2>
                <span className="text-[10px] text-platea-accent font-bold uppercase tracking-wider block mt-0.5">Reserved Table</span>
              </div>
              <button
                onClick={() => { setSelectedReservedTable(null); setActiveReservation(null); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeReservation ? (
              <div className="space-y-4">
                <div className="bg-orange-50/20 border border-orange-100 rounded-xl p-4 text-sm font-semibold space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Customer:</span>
                    <span className="text-slate-800 font-bold">{activeReservation.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Reserved Time:</span>
                    <span className="text-slate-800 font-bold">
                      {new Date(activeReservation.reservationTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-sm">
                No active booking document found.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleSeatCustomer}
                className="bg-platea-primary text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow hover:bg-opacity-90 transition-all"
              >
                Seat Customer
              </button>
              <button
                onClick={handleCancelReservation}
                className="bg-platea-accent text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow hover:bg-opacity-90 transition-all"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FloorPlan;

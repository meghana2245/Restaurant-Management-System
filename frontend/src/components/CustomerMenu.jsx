import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const CustomerMenu = ({ currentUser, onLogout }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [cart, setCart] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [menuRes, tablesRes] = await Promise.all([
        api.getMenuItems(),
        api.getTables(),
      ]);

      if (menuRes.success) {
        setMenuItems(menuRes.data);
      }
      
      if (tablesRes.success) {
        
        const availableTables = tablesRes.data.filter((t) => t.status === 'Available');
        setTables(availableTables);
        if (availableTables.length > 0) {
          setSelectedTableId(availableTables[0]._id);
        } else {
          setSelectedTableId('');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Error loading digital menu details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const response = await api.getUserReservations(currentUser.name);
      if (response.success) {
        setMyReservations(response.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserReservations();
  }, []);

  const addToCart = (menuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem._id === menuItem._id);
      if (existing) {
        return prev.map((item) =>
          item.menuItem._id === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
    showToast(`Added '${menuItem.name}' to order`, 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItem._id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const handleOrderNow = async () => {
    if (!selectedTableId) {
      showToast('Please select a table from the available tables list.', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Your order cart is empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const itemsPayload = cart.map((item) => ({
        menuItemId: item.menuItem._id,
        quantity: item.quantity,
      }));

      const response = await api.placeOrder(selectedTableId, itemsPayload);
      if (response.success) {
        showToast('Order placed successfully! Your food will arrive shortly.', 'success');
        setCart([]);
        fetchData(); 
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error processing order';
      const detailErrors = error.response?.data?.errors;
      if (detailErrors && detailErrors.length > 0) {
        showToast(`${errMsg}: ${detailErrors.join(', ')}`, 'error');
      } else {
        showToast(errMsg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookTable = async () => {
    if (!selectedTableId) {
      showToast('Please select a table to book.', 'error');
      return;
    }
    if (!reservationTime) {
      showToast('Please specify a date and time for your booking.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createReservation(
        currentUser.name,
        selectedTableId,
        new Date(reservationTime)
      );

      if (response.success) {
        showToast(`Table booked successfully for ${new Date(reservationTime).toLocaleString()}!`, 'success');
        setReservationTime('');
        fetchData(); 
        fetchUserReservations(); 
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error placing reservation';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id, tableNumber) => {
    try {
      const response = await api.cancelReservation(id);
      if (response.success) {
        showToast(`Reservation for Table ${tableNumber} cancelled successfully.`, 'success');
        setMyReservations((prev) => prev.filter((res) => res._id !== id));
        fetchData(); 
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to cancel booking', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-platea-bg">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Opening digital menu...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-platea-bg flex flex-col font-sans select-none text-platea-text">
      
      <header className="bg-platea-surface shadow-sm fixed top-0 left-0 right-0 z-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-9 h-9 text-platea-primary flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 30 24 Q 27 18 30 13 Q 33 8 30 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <path d="M 35 26 Q 32 20 35 15 Q 38 10 35 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <path d="M 44 26 L 44 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 44 14 C 41.5 14 41 18 44 26 C 47 18 46.5 14 44 14 Z" fill="currentColor" />
              <path d="M 52 26 L 52 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 52 14 C 52 14 54 14 54 21 L 52 26 Z" fill="currentColor" />
              <path d="M 60 21 L 60 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 58 14 V 21 H 62 V 14 M 60 14 V 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 22 62 A 28 28 0 0 1 78 62 Z" fill="currentColor" />
              <circle cx="50" cy="31.5" r="3.5" fill="currentColor" />
              <text x="50" y="55" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Poppins, sans-serif">P</text>
              <rect x="15" y="64" width="70" height="4" rx="2" fill="currentColor" />
              <path d="M 36 70 Q 46 74 53 80 Q 59 72 55 68 L 57 67 Q 63 74 59 86 L 55 88 Q 43 78 33 73 Z" fill="currentColor" />
            </svg>
            <span className="text-lg font-heading font-black text-slate-800 tracking-tight">
              Platea 🍽️
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block font-bold">Logged in as</span>
              <span className="text-sm font-bold text-slate-700">{currentUser?.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 border border-slate-200 hover:border-platea-accent text-slate-500 hover:text-white hover:bg-platea-accent rounded-xl text-xs font-bold transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        
        
        <div className="flex-1 space-y-6">
          
          <div className="bg-platea-surface rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              Dining Setup & Booking
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label htmlFor="customer-table" className="block text-xs font-bold text-slate-500">
                  Select Dining Table
                </label>
                {tables.length === 0 ? (
                  <div className="text-xs text-platea-accent bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl font-semibold">
                    No tables available! Contact Admin to add tables.
                  </div>
                ) : (
                  <select
                    id="customer-table"
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 text-sm font-bold bg-white text-platea-text"
                  >
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        Table {t.tableNumber} (Capacity: {t.capacity} pax)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              
              <div className="space-y-1.5">
                <label htmlFor="customer-booking-time" className="block text-xs font-bold text-slate-500">
                  Reservation Time (To Book Table)
                </label>
                <input
                  id="customer-booking-time"
                  type="datetime-local"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 text-sm font-medium text-platea-text"
                />
              </div>
            </div>

            
            <div className="flex gap-3 pt-2 font-sans">
              <button
                type="button"
                onClick={handleOrderNow}
                disabled={submitting || tables.length === 0 || cart.length === 0}
                className="flex-1 bg-platea-primary hover:bg-opacity-95 text-white font-semibold py-2.5 px-4 rounded-xl shadow text-xs flex items-center justify-center disabled:opacity-50"
              >
                Order Now (Eat Instantly)
              </button>
              <button
                type="button"
                onClick={handleBookTable}
                disabled={submitting || tables.length === 0 || !reservationTime}
                className="flex-1 bg-white border border-platea-accent text-platea-accent hover:bg-orange-50/20 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center disabled:opacity-50"
              >
                Book a Table (Schedule)
              </button>
            </div>
          </div>

          
          {myReservations.length > 0 && (
            <div className="bg-platea-surface rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fade-in font-sans">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                My Active Bookings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReservations.map((res) => {
                  const formattedTime = new Date(res.reservationTime).toLocaleString();
                  return (
                    <div key={res._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex justify-between items-center transition-all duration-200 hover:shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-extrabold bg-slate-800 text-white px-2 py-0.5 rounded-lg">
                            Table {res.tableId?.tableNumber || '?'}
                          </span>
                          <span className="text-[10px] text-platea-accent font-bold uppercase tracking-wider bg-orange-50/50 border border-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            Reserved 🛎️
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold pt-1">
                          {formattedTime}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(res._id, res.tableId?.tableNumber)}
                        className="text-xs font-bold text-platea-accent hover:text-opacity-80 transition-colors underline"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center font-heading">
              <svg className="w-5 h-5 text-platea-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Explore Digital Menu
            </h2>

            {menuItems.length === 0 ? (
              <div className="bg-platea-surface rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-sans">
                No items available on the digital menu currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 font-sans">
                {menuItems.map((item) => (
                  <div key={item._id} className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow h-60">
                    
                    <div className="h-24 bg-gradient-to-br from-purple-50 to-orange-50/20 flex items-center justify-center relative select-none">
                      <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center shadow-sm">
                        <span className="text-xl">🍽️</span>
                      </div>
                      <span className="absolute top-2 right-2 bg-platea-accent text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                        {item.category || 'Dishes'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Fresh kitchen preparations</p>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-extrabold text-slate-800">
                          ₹{item.price}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-platea-primary/10 text-platea-primary hover:bg-platea-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        <div className="w-full lg:w-80 bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-4 h-fit flex-shrink-0 flex flex-col font-sans">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3 border-b border-slate-100 pb-2">
            Your Cart
          </span>
          {cart.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              Your cart is empty. <br />Choose dishes to order.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-slate-50 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((cartItem) => (
                  <div key={cartItem.menuItem._id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{cartItem.menuItem.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold block">₹{cartItem.menuItem.price} each</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(cartItem.menuItem._id, -1)}
                        className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-slate-800 w-4 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.menuItem._id, 1)}
                        className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">Cart Total</span>
                <span className="text-sm font-extrabold text-slate-800">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default CustomerMenu;

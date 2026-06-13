import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const POSView = ({ selectedTable, setCurrentView }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  
  const { showToast } = useToast();

  useEffect(() => {
    if (!selectedTable) {
      setCurrentView('floorplan');
      return;
    }

    const fetchMenu = async () => {
      try {
        const response = await api.getMenuItems();
        if (response.success) {
          setMenuItems(response.data);
          
          
          const cats = ['All', ...new Set(response.data.map((item) => item.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch (error) {
        console.error(error);
        showToast('Error loading POS menu items', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedTable]);

  const addToCart = (menuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.menuItem._id === menuItem._id);
      if (existing) {
        return prevCart.map((item) =>
          item.menuItem._id === menuItem._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { menuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuItem._id !== menuItemId));
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.menuItem._id === menuItemId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Please add items to place an order.', 'error');
      return;
    }

    setSubmittingOrder(true);
    try {
      
      const itemsPayload = cart.map((item) => ({
        menuItemId: item.menuItem._id,
        quantity: item.quantity,
      }));

      const response = await api.placeOrder(selectedTable._id, itemsPayload);
      
      if (response.success) {
        showToast(`Order placed successfully for Table ${selectedTable.tableNumber}!`, 'success');
        setCart([]);
        setCurrentView('floorplan');
      }
    } catch (error) {
      console.error(error);
      
      const errMsg = error.response?.data?.message || 'Failed to place order';
      const detailErrors = error.response?.data?.errors;
      
      if (detailErrors && detailErrors.length > 0) {
        showToast(`${errMsg}: ${detailErrors.join(', ')}`, 'error');
      } else {
        showToast(errMsg, 'error');
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Loading POS system...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden space-y-6 animate-fade-in select-none font-sans text-platea-text">
      
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('floorplan')}
              className="text-slate-400 hover:text-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-heading font-extrabold text-slate-800 tracking-tight">
              Table {selectedTable?.tableNumber} Ordering
            </h1>
          </div>
          <span className="text-slate-400 text-xs font-semibold ml-8">
            Seating Capacity: {selectedTable?.capacity} guests
          </span>
        </div>

        
        <div className="relative w-full sm:w-72 font-sans">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 text-platea-text"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-w-0">
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-platea-primary text-white border-platea-primary shadow-sm'
                    : 'bg-platea-surface text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredMenuItems.length === 0 ? (
              <div className="bg-platea-surface rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
                No items match your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className="bg-platea-surface rounded-2xl border border-slate-200 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between h-36"
                  >
                    <div>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider">
                        {item.category || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-800 mt-1 text-sm line-clamp-2">{item.name}</h3>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-extrabold text-slate-800">
                        ₹{item.price}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-platea-primary/10 text-platea-primary flex items-center justify-center hover:bg-platea-primary hover:text-white transition-colors duration-200">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        <div className="w-80 bg-platea-surface rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden flex-shrink-0">
          
          
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Order Summary</span>
            <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
            </span>
          </div>

          
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center text-xs">
                <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Select dishes on the left <br />to compose order
              </div>
            ) : (
              cart.map((cartItem) => (
                <div key={cartItem.menuItem._id} className="py-3.5 space-y-1.5">
                  <div className="flex justify-between items-start text-sm">
                    <span className="font-bold text-slate-800 line-clamp-1 flex-1 pr-2">{cartItem.menuItem.name}</span>
                    <span className="text-slate-800 font-bold">₹{cartItem.menuItem.price * cartItem.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => removeFromCart(cartItem.menuItem._id)}
                      className="text-[10px] font-semibold text-platea-accent hover:underline"
                    >
                      Remove
                    </button>
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => updateQuantity(cartItem.menuItem._id, -1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-4 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.menuItem._id, 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          
          <div className="p-4 border-t border-slate-100 space-y-4 bg-slate-50/50">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Subtotal Amount</span>
              <span className="text-lg font-extrabold text-slate-800">
                ₹{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || submittingOrder}
              className="w-full bg-platea-primary hover:bg-opacity-90 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              {submittingOrder ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Order...
                </span>
              ) : (
                'Place Order (Send to Kitchen)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default POSView;

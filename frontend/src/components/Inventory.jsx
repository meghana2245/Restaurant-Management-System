import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  
  const [itemName, setItemName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  const fetchInventory = async () => {
    try {
      const response = await api.getInventory();
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to fetch inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !stockQuantity || !lowStockThreshold) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createInventoryItem({
        itemName: itemName.trim(),
        stockQuantity: Number(stockQuantity),
        unit,
        lowStockThreshold: Number(lowStockThreshold),
      });

      if (response.success) {
        showToast(`Ingredient '${response.data.itemName}' added successfully`, 'success');
        setItemName('');
        setStockQuantity('');
        setLowStockThreshold('');
        fetchInventory();
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error creating inventory item';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedItem || !restockAmount || Number(restockAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      const updatedQuantity = selectedItem.stockQuantity + Number(restockAmount);
      const response = await api.updateInventoryItem(selectedItem._id, {
        stockQuantity: updatedQuantity,
      });

      if (response.success) {
        showToast(`Restocked ${restockAmount} ${selectedItem.unit} to '${selectedItem.itemName}'`, 'success');
        setSelectedItem(null);
        setRestockAmount('');
        fetchInventory();
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error restocking item';
      showToast(errMsg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Loading stock records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans text-platea-text">
      
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">Inventory & Ingredient Stock</h1>
        <p className="text-slate-500 text-sm mt-1">Manage kitchen supplies, monitor thresholds, and trigger restock operations.</p>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-slate-800 tracking-tight mb-4 flex items-center">
            <svg className="w-5 h-5 text-platea-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            Current Ingredients
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Category (Unit)</th>
                  <th className="pb-3 text-right">In Stock</th>
                  <th className="pb-3 text-right">Threshold</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-platea-text">
                {items.map((item) => {
                  const isLow = item.stockQuantity <= item.lowStockThreshold;
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isLow ? 'bg-orange-50/10' : ''
                      }`}
                    >
                      <td className={`py-3.5 font-bold ${isLow ? 'text-platea-accent' : 'text-slate-800'}`}>
                        {item.itemName}
                      </td>
                      <td className="py-3.5 text-xs text-slate-400 uppercase font-bold tracking-wider">
                        {item.unit}
                      </td>
                      <td className={`py-3.5 text-right font-extrabold ${isLow ? 'text-platea-accent' : 'text-slate-700'}`}>
                        {item.stockQuantity} {item.unit}
                      </td>
                      <td className="py-3.5 text-right text-slate-500 font-semibold">
                        {item.lowStockThreshold} {item.unit}
                      </td>
                      <td className="py-3.5 text-center">
                        {isLow ? (
                          <span className="bg-platea-accent/15 text-platea-accent text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-purple-50 text-platea-primary text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Sufficient
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="bg-slate-100 hover:bg-platea-primary hover:text-white text-slate-600 text-xs font-bold py-1.5 px-3 rounded-lg transition-all duration-200"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        
        <div className="space-y-6">
          
          {selectedItem && (
            <div className="bg-platea-surface rounded-2xl border border-platea-accent/30 shadow-md p-6 animate-fade-in relative overflow-hidden">
              <div className="absolute left-0 top-0 right-0 h-1.5 bg-platea-accent" />
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Restock Ingredient
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Adding stock for <span className="font-bold text-slate-700">'{selectedItem.itemName}'</span>
              </p>

              <form onSubmit={handleRestock} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="restock-amount" className="block text-xs font-bold text-slate-500">
                    Quantity to Add ({selectedItem.unit})
                  </label>
                  <input
                    id="restock-amount"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 15"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-platea-primary text-white font-semibold py-2.5 px-4 rounded-xl shadow hover:opacity-90 transition-all text-xs"
                >
                  Confirm Restock
                </button>
              </form>
            </div>
          )}

          
          <div className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-md font-heading font-bold text-slate-800 tracking-tight mb-4 flex items-center">
              <svg className="w-5 h-5 text-platea-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add New Ingredient
            </h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="ingredient-name" className="block text-xs font-bold text-slate-500">
                  Ingredient Name
                </label>
                <input
                  id="ingredient-name"
                  type="text"
                  placeholder="e.g. Tomatoes"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="ingredient-qty" className="block text-xs font-bold text-slate-500">
                    Initial Stock
                  </label>
                  <input
                    id="ingredient-qty"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 50"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ingredient-unit" className="block text-xs font-bold text-slate-500">
                    Unit
                  </label>
                  <select
                    id="ingredient-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-bold bg-white text-platea-text transition-all"
                  >
                    <option value="kg">kg</option>
                    <option value="grams">grams</option>
                    <option value="liters">liters</option>
                    <option value="ml">ml</option>
                    <option value="units">units</option>
                    <option value="pieces">pieces</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ingredient-threshold" className="block text-xs font-bold text-slate-500">
                  Low Stock Threshold
                </label>
                <input
                  id="ingredient-threshold"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 5"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-platea-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow transition-all duration-200 text-xs flex items-center justify-center disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Create Ingredient'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Inventory;

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  
  
  const [recipe, setRecipe] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [menuRes, invRes] = await Promise.all([
        api.getMenuItems(),
        api.getInventory(),
      ]);

      if (menuRes.success) {
        setMenuItems(menuRes.data);
      }
      if (invRes.success) {
        setInventory(invRes.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Error loading menu and inventory records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addIngredientToRecipe = () => {
    if (inventory.length === 0) {
      showToast('No inventory ingredients available. Create them in Inventory first.', 'error');
      return;
    }
    
    const defaultId = inventory[0]._id;
    setRecipe((prev) => [...prev, { inventoryItem: defaultId, quantityRequired: 1 }]);
  };

  const removeRecipeIngredient = (index) => {
    setRecipe((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRecipeIngredient = (index, field, value) => {
    setRecipe((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price) {
      showToast('Name and price are required', 'error');
      return;
    }

    
    const ingredientsPayload = recipe.map((item) => ({
      inventoryItem: item.inventoryItem,
      quantityRequired: Number(item.quantityRequired),
    }));

    setSubmitting(true);
    try {
      const response = await api.createMenuItem({
        name: name.trim(),
        category: category.trim(),
        price: Number(price),
        ingredients: ingredientsPayload,
      });

      if (response.success) {
        showToast(`Dishes: '${response.data.name}' added to active menu`, 'success');
        setName('');
        setCategory('General');
        setPrice('');
        setRecipe([]);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Error creating menu item';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await api.deleteMenuItem(id);
      if (response.success) {
        showToast('Menu item removed', 'success');
        fetchData();
      }
    } catch (error) {
      console.error(error);
      showToast('Error deleting menu item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Loading menu configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans text-platea-text">
      
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">Menu Manager</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your menu card offerings, set prices, and map recipes to auto-deduct kitchen stocks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-heading font-bold text-slate-800 tracking-tight mb-4 flex items-center">
              <svg className="w-5 h-5 text-platea-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Menu Offerings
            </h2>

            {menuItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No items in the menu. Configure your first dish using the form on the right!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item._id} className="border border-slate-200 bg-platea-surface rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {item.category || 'General'}
                          </span>
                          <h3 className="font-bold text-slate-800 mt-1">{item.name}</h3>
                        </div>
                        <span className="text-sm font-extrabold text-platea-primary">
                          ₹{item.price}
                        </span>
                      </div>
                      
                      
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                          Recipe / Deductions
                        </span>
                        {item.ingredients?.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No inventory linked</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {item.ingredients.map((ing, idx) => (
                              <span key={idx} className="bg-purple-50 text-platea-primary text-[10px] px-2 py-0.5 rounded font-semibold border border-purple-100">
                                {ing.inventoryItem?.itemName || 'Ingredient'}: {ing.quantityRequired} {ing.inventoryItem?.unit || ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="text-[10px] font-bold text-platea-accent hover:underline flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Dish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
        <div className="bg-platea-surface rounded-2xl border border-slate-200 shadow-sm p-6 h-fit font-sans">
          <h2 className="text-md font-heading font-bold text-slate-800 tracking-tight mb-4 flex items-center">
            <svg className="w-5 h-5 text-platea-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Menu Dish
          </h2>

          <form onSubmit={handleCreateMenuItem} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="dish-name" className="block text-xs font-bold text-slate-500">
                Dish Name
              </label>
              <input
                id="dish-name"
                type="text"
                placeholder="e.g. Pepperoni Pizza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dish-category" className="block text-xs font-bold text-slate-500">
                  Category
                </label>
                <input
                  id="dish-category"
                  type="text"
                  placeholder="e.g. Pizza"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="dish-price" className="block text-xs font-bold text-slate-500">
                  Price (₹)
                </label>
                <input
                  id="dish-price"
                  type="number"
                  min="0"
                  placeholder="e.g. 349"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-platea-primary/50 focus:border-platea-primary text-sm font-medium text-platea-text transition-all"
                  required
                />
              </div>
            </div>

            
            <div className="space-y-3 pt-4 border-t border-slate-100 font-sans">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Required Ingredients
                </span>
                <button
                  type="button"
                  onClick={addIngredientToRecipe}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded transition-colors"
                >
                  + Add Ingredient
                </button>
              </div>

              {recipe.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No stock ingredients mapped for this recipe yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {recipe.map((recipeItem, index) => {
                    const selectedInvItem = inventory.find((i) => i._id === recipeItem.inventoryItem);
                    const unitLabel = selectedInvItem ? selectedInvItem.unit : 'qty';

                    return (
                      <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <select
                          value={recipeItem.inventoryItem}
                          onChange={(e) => updateRecipeIngredient(index, 'inventoryItem', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none font-bold text-platea-text"
                        >
                          {inventory.map((inv) => (
                            <option key={inv._id} value={inv._id}>
                              {inv.itemName}
                            </option>
                          ))}
                        </select>
                        <div className="w-24 flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={recipeItem.quantityRequired}
                            onChange={(e) => updateRecipeIngredient(index, 'quantityRequired', e.target.value)}
                            className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none text-right font-medium text-platea-text"
                            required
                          />
                          <span className="text-[10px] text-slate-400 font-bold uppercase select-none">
                            {unitLabel}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRecipeIngredient(index)}
                          className="text-slate-400 hover:text-platea-accent transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-platea-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow transition-all duration-200 text-xs flex items-center justify-center disabled:opacity-50"
            >
              {submitting ? 'Creating offering...' : 'Publish MenuItem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default MenuManager;

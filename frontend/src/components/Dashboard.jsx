import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './Toast';

export const Dashboard = () => {
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [lowStock, setLowStock] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, lowStockRes, topRes] = await Promise.all([
        api.getDailySales(),
        api.getLowStock(),
        api.getTopSelling(),
      ]);

      if (salesRes.success) {
        setSalesData(salesRes.data);
      }
      if (lowStockRes.success) {
        setLowStock(lowStockRes.data);
      }
      if (topRes.success) {
        setTopItems(topRes.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Error fetching dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-platea-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold">Generating Reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time analytical overview of restaurant performance and supply chain health.</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-platea-primary/10 text-platea-primary">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today's Revenue</span>
            <span className="text-2xl font-extrabold text-slate-800 font-sans mt-1 block">
              ₹{salesData.totalRevenue?.toLocaleString('en-IN') || '0.00'}
            </span>
          </div>
        </div>

        {/* Order Count Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Orders</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {salesData.totalOrders || 0}
            </span>
          </div>
        </div>

        {/* Average Order Value Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center space-x-5">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              ₹{salesData.averageOrderValue?.toLocaleString('en-IN') || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Top Dishes and Supply Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top-Selling Dishes Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4 flex items-center">
            <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Top-Selling Dishes
          </h2>
          {topItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No sales data recorded for today yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Dish Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Qty Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {topItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-800">{item.name}</td>
                      <td className="py-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-slate-700">{item.totalQuantitySold}</td>
                      <td className="py-3.5 text-right text-slate-800">₹{item.totalRevenue?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Alerts (Low Stock Panel) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4 flex items-center">
            <svg className="w-5 h-5 text-platea-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Supply Chain Alerts
          </h2>
          {lowStock.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-sm">All Stock Sufficient</p>
              <p className="text-xs text-slate-400 mt-1">No items are below their thresholds.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[320px] pr-1">
              <p className="text-xs text-platea-accent font-bold uppercase tracking-wider">
                {lowStock.length} ITEM(S) NEED ATTENTION
              </p>
              <div className="space-y-3">
                {lowStock.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl border border-rose-50 bg-rose-50/20">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.itemName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Current: {item.stockQuantity} {item.unit} | Min: {item.lowStockThreshold} {item.unit}
                      </p>
                    </div>
                    <span className="bg-platea-accent/15 text-platea-accent text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      -{item.deficit} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

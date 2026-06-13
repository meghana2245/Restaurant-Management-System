import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  
  loginUser: async (name, password) => {
    const response = await apiClient.post('/users/login', { name, password });
    return response.data;
  },
  registerUser: async (name, password, role) => {
    const response = await apiClient.post('/users/signup', { name, password, role });
    return response.data;
  },

  
  getTables: async () => {
    const response = await apiClient.get('/tables');
    return response.data;
  },
  createTable: async (tableNumber, capacity) => {
    const response = await apiClient.post('/tables', { tableNumber, capacity });
    return response.data;
  },
  updateTable: async (id, data) => {
    const response = await apiClient.put(`/tables/${id}`, data);
    return response.data;
  },
  reserveTableDirectly: async (id) => {
    const response = await apiClient.put(`/tables/${id}/reserve`);
    return response.data;
  },
  deleteTable: async (id) => {
    const response = await apiClient.delete(`/tables/${id}`);
    return response.data;
  },

  
  getReservations: async () => {
    const response = await apiClient.get('/reservations');
    return response.data;
  },
  createReservation: async (customerName, tableId, reservationTime) => {
    const response = await apiClient.post('/reservations', { customerName, tableId, reservationTime });
    return response.data;
  },
  cancelReservation: async (id) => {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  },
  getUserReservations: async (customerName) => {
    const response = await apiClient.get(`/reservations/user/${encodeURIComponent(customerName)}`);
    return response.data;
  },

  
  getMenuItems: async () => {
    const response = await apiClient.get('/menu');
    return response.data;
  },
  createMenuItem: async (menuItemData) => {
    const response = await apiClient.post('/menu', menuItemData);
    return response.data;
  },
  deleteMenuItem: async (id) => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  
  getInventory: async () => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },
  createInventoryItem: async (inventoryItemData) => {
    const response = await apiClient.post('/inventory', inventoryItemData);
    return response.data;
  },
  updateInventoryItem: async (id, updateData) => {
    const response = await apiClient.put(`/inventory/${id}`, updateData);
    return response.data;
  },
  deleteInventoryItem: async (id) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    return response.data;
  },

  
  getOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  placeOrder: async (tableId, items) => {
    const response = await apiClient.post('/orders', { tableId, items });
    return response.data;
  },
  completeOrder: async (id) => {
    const response = await apiClient.put(`/orders/${id}/complete`);
    return response.data;
  },
  serveOrder: async (id) => {
    const response = await apiClient.put(`/orders/${id}/serve`);
    return response.data;
  },

  
  getDailySales: async () => {
    const response = await apiClient.get('/reports/daily-sales');
    return response.data;
  },
  getLowStock: async () => {
    const response = await apiClient.get('/reports/low-stock');
    return response.data;
  },
  getTopSelling: async () => {
    const response = await apiClient.get('/reports/top-selling');
    return response.data;
  },
};

export default api;

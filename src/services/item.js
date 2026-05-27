
import { api } from './api';

export const itemService = {
  async getItems() {
    const response = await api.get('/items');
    return response.data;
  },

  async getItemById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  async createItem(itemData) {
    const response = await api.post('/items', itemData);
    return response.data;
  },

  async updateItem(id, itemData) {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  async deleteItem(id) {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  async searchItems(query) {
    const response = await api.get(`/items/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

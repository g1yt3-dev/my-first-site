
import { api } from './api';

export const floorPlanService = {
  async getFloorPlan() {
    const response = await api.get('/floor-plan');
    return response.data;
  },

  async updateFloorPlan(floorPlanData) {
    const response = await api.put('/floor-plan', floorPlanData);
    return response.data;
  },

  async updateItemPosition(itemId, position) {
    const response = await api.put(`/floor-plan/items/${itemId}`, position);
    return response.data;
  },

  async removeItemPosition(itemId) {
    const response = await api.delete(`/floor-plan/items/${itemId}`);
    return response.data;
  },
};

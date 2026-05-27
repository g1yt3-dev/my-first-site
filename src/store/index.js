import { create } from 'zustand';

const ROOMS_STORAGE_KEY = 'home-inventory-rooms';

const cabinetColors = [
  '#f6e6d3', '#ffffff', '#3a3a3a', '#d4c4b0', '#e8e8e8', '#e0f0ff', '#e8f5e9', '#ffe8cc'
];

const cabinetSizes = [
  { w: 1, h: 1 },
  { w: 2, h: 1 },
  { w: 3, h: 1 },
  { w: 1, h: 2 },
  { w: 2, h: 2 },
  { w: 3, h: 2 },
  { w: 4, h: 2 },
  { w: 5, h: 2 }
];

const saveRooms = (rooms) => {
  localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
};

const DEFAULT_DATA = [
  {
    id: '1',
    name: '示例房间',
    icon: '🎁',
    cabinets: [
      { 
        id: '1', 
        name: '电视柜', 
        type: 'tv', 
        x: 2, 
        y: 0, 
        width: 3, 
        height: 1, 
        layers: 3, 
        color: cabinetColors[0],
        items: [
          [{ id: 'item1', name: '电视遥控器' }, { id: 'item2', name: '机顶盒遥控器' }],
          [{ id: 'item3', name: 'DVD播放器' }],
          [{ id: 'item4', name: '游戏机手柄' }]
        ] 
      },
      { 
        id: '2', 
        name: '餐边柜1', 
        type: 'side', 
        x: 0, 
        y: 1, 
        width: 2, 
        height: 2, 
        layers: 3, 
        color: cabinetColors[0],
        items: [
          [{ id: 'item5', name: '红酒杯' }, { id: 'item6', name: '醒酒器' }],
          [{ id: 'item7', name: '茶叶罐' }, { id: 'item8', name: '咖啡杯' }],
          [{ id: 'item9', name: '零食盒' }]
        ] 
      },
      { 
        id: '3', 
        name: '展示柜', 
        type: 'display', 
        x: 5, 
        y: 1, 
        width: 2, 
        height: 1, 
        layers: 2, 
        color: cabinetColors[1],
        items: [
          [{ id: 'item10', name: '装饰品' }, { id: 'item11', name: '香薰' }],
          [{ id: 'item12', name: '相框' }]
        ] 
      },
    ],
  },
  {
    id: '2',
    name: '卧室',
    icon: '🛏️',
    cabinets: [],
  }
];

const loadRooms = () => {
  const stored = localStorage.getItem(ROOMS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed;
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }
  saveRooms(DEFAULT_DATA);
  return DEFAULT_DATA;
};

export const useItemStore = create((set, get) => ({
  rooms: loadRooms(),
  cabinetColors,
  cabinetSizes,
  
  addRoom: (room) => {
    set((state) => {
      const newRooms = [...state.rooms, { ...room, id: Date.now().toString(), cabinets: room.cabinets || [] }];
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },
  
  updateRoom: (id, updates) => {
    set((state) => {
      const newRooms = state.rooms.map(r => r.id === id ? { ...r, ...updates } : r);
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },
  
  deleteRoom: (id) => {
    set((state) => {
      const newRooms = state.rooms.filter(r => r.id !== id);
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },
  
  addCabinet: (roomId, cabinet) => {
    set((state) => {
      const newCabinet = { 
        ...cabinet, 
        id: Date.now().toString(), 
        layers: 3, 
        color: cabinetColors[0],
        items: Array(3).fill(null).map(() => []) 
      };
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { ...r, cabinets: [...r.cabinets, newCabinet] }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },
  
  updateCabinet: (roomId, cabinetId, updates) => {
    set((state) => {
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              cabinets: r.cabinets.map(c => {
                if (c.id === cabinetId) {
                  const updated = { ...c, ...updates };
                  if (updates.layers && updates.layers !== c.layers) {
                    const newItems = Array(updates.layers).fill(null).map((_, i) => 
                      c.items[i] || []
                    );
                    updated.items = newItems;
                  }
                  return updated;
                }
                return c;
              }) 
            }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },
  
  deleteCabinet: (roomId, cabinetId) => {
    set((state) => {
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { ...r, cabinets: r.cabinets.filter(c => c.id !== cabinetId) }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },

  moveCabinet: (fromRoomId, toRoomId, cabinetId) => {
    set((state) => {
      const fromRoom = state.rooms.find(r => r.id === fromRoomId);
      const cabinet = fromRoom?.cabinets.find(c => c.id === cabinetId);
      if (!cabinet) return state;

      const newRooms = state.rooms.map(r => {
        if (r.id === fromRoomId) {
          return { ...r, cabinets: r.cabinets.filter(c => c.id !== cabinetId) };
        }
        if (r.id === toRoomId) {
          return { ...r, cabinets: [...r.cabinets, cabinet] };
        }
        return r;
      });
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },

  addItemToCabinet: (roomId, cabinetId, layerIndex, itemData) => {
    set((state) => {
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              cabinets: r.cabinets.map(c => {
                if (c.id === cabinetId) {
                  const newItems = [...c.items];
                  newItems[layerIndex] = [...(newItems[layerIndex] || []), {
                    id: Date.now().toString(),
                    createdAt: Date.now(),
                    ...itemData
                  }];
                  return { ...c, items: newItems };
                }
                return c;
              }) 
            }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },

  updateItemInCabinet: (roomId, cabinetId, layerIndex, itemId, updates) => {
    set((state) => {
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              cabinets: r.cabinets.map(c => {
                if (c.id === cabinetId) {
                  const newItems = [...c.items];
                  newItems[layerIndex] = newItems[layerIndex].map(item => 
                    item.id === itemId ? { ...item, ...updates } : item
                  );
                  return { ...c, items: newItems };
                }
                return c;
              }) 
            }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  },

  removeItemFromCabinet: (roomId, cabinetId, layerIndex, itemId) => {
    set((state) => {
      const newRooms = state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              cabinets: r.cabinets.map(c => {
                if (c.id === cabinetId) {
                  const newItems = [...c.items];
                  newItems[layerIndex] = newItems[layerIndex].filter(i => i.id !== itemId);
                  return { ...c, items: newItems };
                }
                return c;
              }) 
            }
          : r
      );
      saveRooms(newRooms);
      return { rooms: newRooms };
    });
  }
}));

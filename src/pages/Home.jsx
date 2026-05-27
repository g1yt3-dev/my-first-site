import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, X, Edit, Trash2, Home as HomeIcon } from 'lucide-react';
import { useItemStore } from '../store/index';

const quickAddRooms = [
  { name: '客厅', icon: '🛋️' },
  { name: '卧室', icon: '🛏️' },
  { name: '厨房', icon: '🍳' },
  { name: '书房', icon: '📚' },
  { name: '阳台', icon: '🌿' },
  { name: '卫生间', icon: '🚿' },
];

export default function Home() {
  const navigate = useNavigate();
  const { rooms, addRoom, updateRoom, deleteRoom } = useItemStore();
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 计算所有物品
  const allItems = [];
  rooms.forEach(room => {
    room.cabinets.forEach(cabinet => {
      cabinet.items.forEach((layer, layerIndex) => {
        layer.forEach(item => {
          allItems.push(item);
        });
      });
    });
  });

  // 最近添加的物品（取前3个）
  const recentItems = [...allItems]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3);

  const handleAddRoom = (roomName, icon) => {
    addRoom({
      name: roomName,
      icon: icon || '🏠',
    });
    setShowRoomModal(false);
  };

  return (
    <div className="min-h-screen bg-[#e8eef5] pb-24">
      <div className="px-5 pt-6 pb-4">
        {/* 顶部标题区 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 neu-flat rounded-2xl flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#2d3748]">收纳君</h1>
            <p className="text-[#718096] mt-1">妈妈再也不用担心我找不到东西了</p>
          </div>
        </div>

        {/* 当前房间选择 + 查看清单 */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowRoomModal(true)}
            className="flex items-center gap-2 text-[#2d3748] font-medium"
          >
            <span className="text-xl">🏠</span>
            <span className="text-lg">我的家</span>
            <span className="text-[#a0aec0]">▼</span>
          </button>
          <Link to="/items" className="text-[#5a8f6c] font-medium flex items-center gap-1">
            <span>📋</span> 查看物件清单
          </Link>
        </div>

        {/* 搜索框 */}
        <div className="neu-pressed flex items-center px-5 py-3 mb-6">
          <Search className="w-5 h-5 text-[#718096] mr-3" />
          <input
            type="text"
            placeholder="搜索物品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#2d3748] placeholder-[#a0aec0]"
          />
        </div>

        {/* 最近添加物品 */}
        {recentItems.length > 0 && (
          <div className="mb-6">
            <div className="text-[#718096] text-sm mb-2">最近添加物件：</div>
            <div className="flex flex-wrap gap-2">
              {recentItems.map((item, index) => (
                <span 
                  key={item.id || index}
                  className="text-[#5a8f6c] underline cursor-pointer"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 房间标题 + 智能录入 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[#2d3748] font-medium">房间 {rooms.length}个</div>
          <button className="text-[#718096]">智能录入</button>
        </div>

        {/* 房间卡片网格 */}
        {rooms.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="neu-btn p-6 flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-[#a0aec0]">
              <div className="text-4xl mb-2">➕</div>
              <div className="text-[#718096]">新建房间</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {rooms.map((room) => {
              // 计算柜子数量和物品数量
              const cabinetCount = room.cabinets.length;
              let itemCount = 0;
              room.cabinets.forEach(cabinet => {
                cabinet.items.forEach(layer => {
                  itemCount += layer.length;
                });
              });

              return (
                <Link
                  key={room.id}
                  to={`/room/${room.id}`}
                  className="neu-btn p-4 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newName = prompt('输入新的房间名称:', room.name);
                        if (newName?.trim()) {
                          updateRoom(room.id, { name: newName.trim() });
                        }
                      }}
                      className="text-[#5a8f6c] text-sm px-2 py-1"
                    >
                      编辑
                    </button>
                  </div>
                  
                  {/* 示例图片占位 */}
                  <div className="w-full h-20 bg-[#f6e6d3] rounded-xl mb-3 flex items-center justify-center">
                    <span className="text-4xl">{room.icon}</span>
                  </div>
                  <div className="text-[#2d3748] font-medium">{room.name}</div>
                  <div className="text-[#718096] text-sm mt-1">
                    {cabinetCount}柜子 · {itemCount}物
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 快速添加 */}
        <div className="mb-4">
          <div className="text-[#718096] text-sm mb-3">快速添加</div>
          <div className="grid grid-cols-4 gap-3">
            {quickAddRooms.map((room, index) => (
              <button
                key={index}
                onClick={() => handleAddRoom(room.name, room.icon)}
                className="neu-btn p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">{room.icon}</span>
                <span className="text-[#2d3748] text-xs">{room.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#e8eef5] px-5 py-4">
        <div className="flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-[#5a8f6c] to-[#4a7f5c]">
              <span className="text-xl font-bold text-white">H</span>
            </div>
            <span className="text-xs text-[#5a8f6c] font-medium">首页</span>
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl font-bold text-[#718096]">A</span>
            </div>
            <span className="text-xs text-[#718096]">物件分析</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl font-bold text-[#718096]">S</span>
            </div>
            <span className="text-xs text-[#718096]">设置</span>
          </div>
        </div>
      </div>

      {/* 选择房子模态框 */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-[#e8eef5] w-full rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2d3748]">选择房子</h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-[#718096] text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="neu-flat p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{room.icon}</span>
                    <span className="text-[#2d3748] font-medium">{room.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('输入新的房间名称:', room.name);
                        if (newName?.trim()) {
                          updateRoom(room.id, { name: newName.trim() });
                        }
                      }}
                      className="text-[#5a8f6c] px-3 py-1"
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定删除这个房间吗？')) {
                          deleteRoom(room.id);
                        }
                      }}
                      className="text-red-500 px-3 py-1"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const roomName = prompt('输入房间名称:');
                if (roomName?.trim()) {
                  handleAddRoom(roomName, '🏠');
                }
              }}
              className="w-full neu-btn py-4 text-[#5a8f6c] font-medium flex items-center justify-center gap-2 border-2 border-dashed border-[#a0aec0]"
            >
              <Plus className="w-5 h-5" />
              添加新房子
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

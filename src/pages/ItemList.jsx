import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Filter } from 'lucide-react';
import { useItemStore } from '../store/index';
import ImagePreview from '../components/ImagePreview';

export default function ItemList() {
  const navigate = useNavigate();
  const { rooms } = useItemStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  // 收集所有物品
  const allItems = [];
  rooms.forEach(room => {
    room.cabinets.forEach(cabinet => {
      cabinet.items.forEach((layer, layerIndex) => {
        layer.forEach(item => {
          allItems.push({
            ...item,
            cabinetName: cabinet.name,
            roomName: room.name,
            roomIcon: room.icon,
            layer: layerIndex + 1,
            cabinetColor: cabinet.color
          });
        });
      });
    });
  });

  // 过滤物品
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.roomName === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // 获取房间名称用于筛选
  const roomNames = [...new Set(allItems.map(item => item.roomName))];

  return (
    <div className="min-h-screen bg-[#e8eef5] pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 neu-btn flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#2d3748]" />
          </button>
          <h1 className="text-xl font-bold text-[#2d3748]">物件清单</h1>
          <div className="w-11" />
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <div className="neu-pressed flex items-center px-5 py-3">
            <Search className="w-5 h-5 text-[#718096] mr-3" />
            <input
              type="text"
              placeholder="搜索物品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#2d3748] placeholder-[#718096]"
            />
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'neu-tab-active text-[#2d3748]'
                : 'neu-btn text-[#718096]'
            }`}
          >
            全部
          </button>
          {roomNames.map(roomName => (
            <button
              key={roomName}
              onClick={() => setActiveFilter(roomName)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === roomName
                  ? 'neu-tab-active text-[#2d3748]'
                  : 'neu-btn text-[#718096]'
              }`}
            >
              {roomName}
            </button>
          ))}
        </div>

        {/* 物品统计 */}
        <div className="neu-flat p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-[#2d3748]">{filteredItems.length}</div>
              <div className="text-sm text-[#718096]">件物品</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#5a8f6c]">{rooms.reduce((sum, room) => sum + room.cabinets.length, 0)}</div>
              <div className="text-sm text-[#718096]">个柜子</div>
            </div>
          </div>
        </div>

        {/* 物品列表 */}
        {filteredItems.length === 0 ? (
          <div className="neu-flat p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-[#718096] text-lg">
              {searchQuery ? '没有找到相关物品' : '还没有添加任何物品'}
            </div>
            <div className="text-[#718096] text-sm mt-2">
              去房间的柜子里添加一些物品吧！
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <div key={item.id} className="neu-flat p-5">
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ boxShadow: '2px 2px 4px #c5cdd5, -2px -2px 4px #ffffff' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(item.image);
                      }}
                    />
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: item.cabinetColor || '#f6e6d3',
                        boxShadow: '2px 2px 4px #c5cdd5, -2px -2px 4px #ffffff'
                      }}
                    >
                      {item.roomIcon}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-[#2d3748] text-lg">{item.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-[#718096]">{item.roomName}</span>
                      <span className="text-[#a0aec0]">·</span>
                      <span className="text-sm text-[#718096]">{item.cabinetName}</span>
                      <span className="text-[#a0aec0]">·</span>
                      <span className="text-sm text-[#5a8f6c]">第{item.layer}层</span>
                    </div>
                    {item.quantity > 1 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#5a8f6c] text-white text-xs font-medium">
                          数量: {item.quantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#e8eef5] px-5 py-4">
        <div className="flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center">
            <div className="w-12 h-12 neu-circle flex items-center justify-center mb-1">
              <span className="text-xl font-bold text-[#5a8f6c]">H</span>
            </div>
            <span className="text-xs text-[#5a8f6c] font-medium">首页</span>
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-[#5a8f6c] to-[#4a7f5c]">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <span className="text-xs text-[#5a8f6c] font-medium">物件分析</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl font-bold text-[#718096]">S</span>
            </div>
            <span className="text-xs text-[#718096]">设置</span>
          </div>
        </div>
      </div>
      
      {/* 图片预览模态框 */}
      <ImagePreview 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />
    </div>
  );
}

import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Lightbulb } from 'lucide-react';
import { useItemStore } from '../store/index';

const gridCols = 7;
const gridRows = 7;
const cellSize = 50;

const cabinetTypes = {
  tv: { name: '电视柜', color: '#f6e6d3' },
  side: { name: '餐边柜', color: '#f6e6d3' },
  display: { name: '展示柜', color: '#ffffff' },
  storage: { name: '储物柜', color: '#f0e8d6' },
  wine: { name: '酒柜', color: '#d8d8d8' },
  book: { name: '书架', color: '#f6e6d3' },
  shoe: { name: '鞋柜', color: '#ffffff' },
  other: { name: '杂物柜', color: '#f0e8d6' },
};

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, addCabinet, updateCabinet, deleteCabinet, moveCabinet } = useItemStore();
  const room = rooms.find(r => r.id === roomId);
  
  const [mode, setMode] = useState('list'); // 'layout', 'list'
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddCabinet, setShowAddCabinet] = useState(false);
  const [showMoveCabinet, setShowMoveCabinet] = useState(null);
  const containerRef = useRef(null);

  if (!room) {
    return <div>房间不存在</div>;
  }

  const otherRooms = rooms.filter(r => r.id !== roomId);

  const handleMouseDown = (e, cabinet) => {
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    setDragging(cabinet);
    setDragOffset({
      x: e.clientX - rect.left - cabinet.x * cellSize,
      y: e.clientY - rect.top - cabinet.y * cellSize
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newX = Math.max(0, Math.min(Math.round((x - dragOffset.x) / cellSize), gridCols - dragging.width));
    const newY = Math.max(0, Math.min(Math.round((y - dragOffset.y) / cellSize), gridRows - dragging.height));
    
    if (newX !== dragging.x || newY !== dragging.y) {
      updateCabinet(roomId, dragging.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleAddCabinet = (type) => {
    addCabinet(roomId, {
      name: cabinetTypes[type].name,
      type: type,
      x: 2,
      y: 2,
      width: 2,
      height: 1
    });
    setShowAddCabinet(false);
  };

  const handleMoveCabinet = (toRoomId, cabinetId) => {
    moveCabinet(roomId, toRoomId, cabinetId);
    setShowMoveCabinet(null);
  };

  return (
    <div className="min-h-screen bg-[#e8eef5] pb-24">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 neu-btn flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-[#2d3748]" />
          </button>
          <h1 className="text-xl font-bold text-[#2d3748]">房间</h1>
          <div className="w-11" />
        </div>

        <div className="neu-flat p-4 mb-6 flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="text-[#2d3748] text-sm">
            点击右下角 + 添加柜子
          </span>
        </div>

        {/* 模式切换按钮 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode('layout')}
            className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
              mode === 'layout' 
                ? 'neu-tab-active text-[#2d3748]' 
                : 'neu-btn text-[#718096]'
            }`}
          >模拟布局模式</button>
          <button
            onClick={() => setMode('list')}
            className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
              mode === 'list' 
                ? 'neu-tab-active text-[#2d3748]' 
                : 'neu-btn text-[#718096]'
            }`}
          >清单模式</button>
        </div>

        {/* 布局模式 */}
        {mode === 'layout' && (
          <div 
            ref={containerRef}
            className="neu-flat p-6 relative"
            style={{ touchAction: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="relative" style={{ width: gridCols * cellSize, height: gridRows * cellSize, margin: '0 auto' }}>
              {Array.from({ length: gridRows }).map((_, row) =>
                Array.from({ length: gridCols }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="absolute rounded-lg"
                    style={{
                      left: col * cellSize + 4,
                      top: row * cellSize + 4,
                      width: cellSize - 8,
                      height: cellSize - 8,
                      background: '#f0f5fa',
                      boxShadow: 'inset 2px 2px 4px #c5cdd5, inset -2px -2px 4px #ffffff'
                    }}
                  />
                ))
              )}

              {room.cabinets.map((cabinet) => (
                <Link
                  key={cabinet.id}
                  to={`/room/${roomId}/cabinet/${cabinet.id}`}
                  className="absolute cursor-move flex items-center justify-center text-sm font-medium text-[#2d3748] rounded-2xl"
                  style={{
                    left: (cabinet.x || 0) * cellSize + 2,
                    top: (cabinet.y || 0) * cellSize + 2,
                    width: (cabinet.width || 2) * cellSize - 4,
                    height: (cabinet.height || 1) * cellSize - 4,
                    backgroundColor: cabinet.color || cabinetTypes[cabinet.type]?.color || '#f6e6d3',
                    boxShadow: '4px 4px 8px #c5cdd5, -4px -4px 8px #ffffff',
                    zIndex: dragging?.id === cabinet.id ? 10 : 1
                  }}
                  onMouseDown={(e) => handleMouseDown(e, cabinet)}
                >
                  {cabinet.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 清单模式 */}
        {mode === 'list' && (
          <div className="space-y-4">
            {room.cabinets.length === 0 ? (
              <div className="neu-flat p-8 text-center text-[#718096]">
                暂无柜子，点击右下角 + 添加
              </div>
            ) : (
              room.cabinets.map((cabinet) => (
                <div key={cabinet.id} className="neu-flat p-4">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/room/${roomId}/cabinet/${cabinet.id}`}
                      className="flex-1 flex items-center gap-4"
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-medium text-[#2d3748]"
                        style={{ 
                          backgroundColor: cabinet.color || cabinetTypes[cabinet.type]?.color || '#f6e6d3',
                          boxShadow: '2px 2px 4px #c5cdd5, -2px -2px 4px #ffffff'
                        }}
                      >
                        📦
                      </div>
                      <div>
                        <div className="font-bold text-[#2d3748]">{cabinet.name}</div>
                        <div className="text-sm text-[#718096]">{cabinet.layers} 层</div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {otherRooms.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMoveCabinet(cabinet.id);
                          }}
                          className="px-3 py-1 text-sm text-[#5a8f6c]"
                        >
                          移动至其他房间
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm('确定删除这个柜子吗？')) {
                            deleteCabinet(roomId, cabinet.id);
                          }
                        }}
                        className="px-3 py-1 text-sm text-red-500"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6">
        <button
          onClick={() => setShowAddCabinet(true)}
          className="w-16 h-16 neu-circle flex items-center justify-center"
        >
          <Plus className="w-8 h-8 text-[#2d3748]" />
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#e8eef5] px-5 py-4">
        <div className="flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center">
            <div className="w-12 h-12 neu-circle flex items-center justify-center mb-1">
              <span className="text-xl font-bold text-[#5a8f6c]">H</span>
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

      {showAddCabinet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="neu-flat w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2d3748]">添加柜子</h2>
              <button
                onClick={() => setShowAddCabinet(false)}
                className="text-[#718096]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(cabinetTypes).map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => handleAddCabinet(type)}
                  className="neu-btn p-4 flex flex-col items-center"
                >
                  <div 
                    className="w-10 h-10 rounded-xl mb-2"
                    style={{ backgroundColor: info.color }}
                  />
                  <span className="text-[#2d3748] text-sm">{info.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddCabinet(false)}
              className="w-full neu-btn py-3 text-[#718096] font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showMoveCabinet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="neu-flat w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2d3748]">选择目标房间</h2>
              <button
                onClick={() => setShowMoveCabinet(null)}
                className="text-[#718096]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {otherRooms.map((targetRoom) => (
                <button
                  key={targetRoom.id}
                  onClick={() => handleMoveCabinet(targetRoom.id, showMoveCabinet)}
                  className="w-full neu-btn p-4 flex items-center gap-4"
                >
                  <span className="text-2xl">{targetRoom.icon}</span>
                  <span className="text-[#2d3748] font-medium">{targetRoom.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMoveCabinet(null)}
              className="w-full neu-btn py-3 text-[#718096] font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

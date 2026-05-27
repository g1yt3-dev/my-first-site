import { useState, useRef, useEffect } from 'react';
import { Upload, X, MapPin, Plus, Trash2, Layout, GripVertical, Settings } from 'lucide-react';
import { useItemStore } from '../store';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 预设区域类型
const ZONE_TYPES = [
  { id: 'wardrobe', name: '衣柜', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'bookshelf', name: '书架', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'cabinet', name: '储物柜', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'tvstand', name: '电视柜', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'shoerack', name: '鞋柜', color: 'bg-rose-100 border-rose-300 text-rose-800' },
  { id: 'counter', name: '餐边柜', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  { id: 'other', name: '其他', color: 'bg-stone-100 border-stone-300 text-stone-800' },
];

export default function FloorPlanEditor({ itemId, readOnly = false }) {
  const { 
    floorPlan, 
    updateFloorPlan, 
    updateItemPosition, 
    removeItemPosition, 
    items,
    addFloorPlanElement,
    updateFloorPlanElement,
    deleteFloorPlanElement
  } = useItemStore();
  
  const [isDragging, setIsDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null);
  const [mode, setMode] = useState('view'); // 'view', 'add_zone', 'add_item'
  const [editingElementId, setEditingElementId] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempRows, setTempRows] = useState(floorPlan.gridRows);
  const [tempCols, setTempCols] = useState(floorPlan.gridCols);
  const containerRef = useRef(null);

  const { gridRows, gridCols, cellSize } = floorPlan;

  // 计算画布尺寸
  const canvasWidth = gridCols * cellSize;
  const canvasHeight = gridRows * cellSize;

  // 鼠标按下 - 开始拖拽
  const handleMouseDown = (e, id, type) => {
    if (readOnly) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    if (type === 'element') {
      setIsDragging({ id, type });
      const element = floorPlan.elements.find(el => el.id === id);
      setDragOffset({
        x: e.clientX - rect.left - element.gridX * cellSize,
        y: e.clientY - rect.top - element.gridY * cellSize
      });
      setSelectedElement(id);
    } else if (type === 'item') {
      setIsDragging({ id, type });
      setDragOffset({
        x: e.clientX - rect.left - floorPlan.items[id].x,
        y: e.clientY - rect.top - floorPlan.items[id].y
      });
      setSelectedElement(null);
    }
  };

  // 鼠标移动 - 处理拖拽
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging.type === 'element') {
      // 吸附到网格
      const newGridX = Math.max(0, Math.min(Math.round((x - dragOffset.x) / cellSize), gridCols - 1));
      const newGridY = Math.max(0, Math.min(Math.round((y - dragOffset.y) / cellSize), gridRows - 1));
      updateFloorPlanElement(isDragging.id, { gridX: newGridX, gridY: newGridY });
    } else if (isDragging.type === 'item') {
      const newX = Math.max(0, Math.min(x - dragOffset.x, canvasWidth - 40));
      const newY = Math.max(0, Math.min(y - dragOffset.y, canvasHeight - 40));
      updateItemPosition(isDragging.id, { x: newX, y: newY });
    }
  };

  // 鼠标松开 - 结束拖拽
  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // 点击画布
  const handleCanvasMouseDown = (e) => {
    if (readOnly) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'add_item' && itemId && !floorPlan.items[itemId]) {
      updateItemPosition(itemId, { 
        x: Math.max(0, Math.min(x - 20, canvasWidth - 40)), 
        y: Math.max(0, Math.min(y - 20, canvasHeight - 40)) 
      });
      setMode('view');
    } else if (mode === 'add_zone') {
      // 吸附到网格
      const gridX = Math.max(0, Math.min(Math.floor(x / cellSize), gridCols - 1));
      const gridY = Math.max(0, Math.min(Math.floor(y / cellSize), gridRows - 1));
      
      const newElement = {
        id: `element-${Date.now()}`,
        type: 'other',
        gridX: gridX,
        gridY: gridY,
        gridWidth: 2,
        gridHeight: 2,
        label: '新区域'
      };
      addFloorPlanElement(newElement);
      setSelectedElement(newElement.id);
      setMode('view');
    }
  };

  const removePosition = (id, e) => {
    e.stopPropagation();
    removeItemPosition(id);
  };

  const removeElement = (id, e) => {
    e.stopPropagation();
    if (confirm('确定要删除这个区域吗？')) {
      deleteFloorPlanElement(id);
      setSelectedElement(null);
    }
  };

  const startEditElement = (id, currentLabel, e) => {
    e.stopPropagation();
    if (readOnly) return;
    setEditingElementId(id);
    setEditingLabel(currentLabel);
  };

  const saveEditElement = () => {
    if (editingElementId && editingLabel.trim()) {
      updateFloorPlanElement(editingElementId, { label: editingLabel.trim() });
    }
    setEditingElementId(null);
    setEditingLabel('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditElement();
    } else if (e.key === 'Escape') {
      setEditingElementId(null);
      setEditingLabel('');
    }
  };

  const updateElementType = (elementId, typeId) => {
    updateFloorPlanElement(elementId, { type: typeId });
  };

  const updateElementSize = (elementId, width, height) => {
    const element = floorPlan.elements.find(el => el.id === elementId);
    if (!element) return;
    
    const newWidth = Math.max(1, Math.min(width, gridCols - element.gridX));
    const newHeight = Math.max(1, Math.min(height, gridRows - element.gridY));
    
    updateFloorPlanElement(elementId, { gridWidth: newWidth, gridHeight: newHeight });
  };

  const saveGridSettings = () => {
    updateFloorPlan({ 
      gridRows: Math.max(4, Math.min(tempRows, 20)), 
      gridCols: Math.max(4, Math.min(tempCols, 20)) 
    });
    setShowSettings(false);
  };

  const getElementColor = (typeId) => {
    const type = ZONE_TYPES.find(t => t.id === typeId);
    return type?.color || 'bg-stone-100 border-stone-300 text-stone-800';
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-3">
          {/* 模式切换 */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setMode('view')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                mode === 'view'
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              查看模式
            </button>
            <button
              onClick={() => setMode('add_zone')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                mode === 'add_zone'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              添加区域
            </button>
            {itemId && (
              <button
                onClick={() => setMode('add_item')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  mode === 'add_item'
                    ? 'bg-[#FF8C42] text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <MapPin className="w-4 h-4" />
                添加物品
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-4 py-2 rounded-lg transition-all ${
                showSettings 
                  ? 'bg-[#2D6A4F] text-white' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* 网格设置 */}
          {showSettings && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-stone-700 mb-1 block">行数</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={tempRows}
                    onChange={(e) => setTempRows(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#2D6A4F]/50 focus:border-[#2D6A4F] outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-stone-700 mb-1 block">列数</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={tempCols}
                    onChange={(e) => setTempCols(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#2D6A4F]/50 focus:border-[#2D6A4F] outline-none"
                  />
                </div>
                <button
                  onClick={saveGridSettings}
                  className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] transition-colors self-end"
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* 操作提示 */}
          {mode === 'add_zone' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
              <Plus className="w-4 h-4" />
              <span>点击画布添加新区域</span>
            </div>
          )}
          {mode === 'add_item' && itemId && !floorPlan.items[itemId] && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              <MapPin className="w-4 h-4" />
              <span>点击画布添加物品位置</span>
            </div>
          )}
        </div>
      )}

      {/* 网格信息 */}
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>网格：{gridRows} × {gridCols}</span>
        <span>格子大小：{cellSize}px</span>
      </div>

      {/* 画布 */}
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-br from-stone-100 to-stone-200 border-2 border-stone-300 rounded-2xl overflow-hidden shadow-inner"
        style={{ width: canvasWidth, height: canvasHeight, maxWidth: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* 网格背景 */}
        <svg className="absolute inset-0 w-full h-full" width={canvasWidth} height={canvasHeight}>
          {/* 网格线 */}
          <defs>
            <pattern id="gridPattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <rect width={cellSize} height={cellSize} fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
          
          {/* 格子内部装饰 */}
          {Array.from({ length: gridRows }).map((_, row) =>
            Array.from({ length: gridCols }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={col * cellSize + 4}
                y={row * cellSize + 4}
                width={cellSize - 8}
                height={cellSize - 8}
                rx="8"
                fill="#f5f5f4"
                stroke="#e7e5e4"
                strokeWidth="1"
              />
            ))
          )}
        </svg>

        {/* 区域元素 */}
        {floorPlan.elements.map((element) => {
          const isSelected = selectedElement === element.id;
          const colorClasses = getElementColor(element.type);
          
          return (
            <div
              key={element.id}
              className={cn(
                'absolute cursor-move transition-all duration-150',
                isSelected && 'z-30'
              )}
              style={{
                left: element.gridX * cellSize + 2,
                top: element.gridY * cellSize + 2,
                width: element.gridWidth * cellSize - 4,
                height: element.gridHeight * cellSize - 4
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'element')}
            >
              <div className={cn(
                'w-full h-full rounded-xl border-2 flex flex-col items-center justify-center group relative',
                colorClasses,
                isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : 'hover:shadow-lg'
              )}>
                {/* 拖拽手柄 */}
                {!readOnly && (
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 opacity-50" />
                  </div>
                )}

                {editingElementId === element.id ? (
                  <input
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={saveEditElement}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full text-center bg-transparent border-none outline-none font-bold px-1"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="font-bold text-sm text-center px-2 cursor-pointer"
                    onDoubleClick={(e) => startEditElement(element.id, element.label, e)}
                  >
                    {element.label}
                  </span>
                )}

                {/* 尺寸显示 */}
                <span className="text-xs opacity-60 mt-1">
                  {element.gridWidth}×{element.gridHeight}
                </span>

                {/* 操作按钮 - 仅在选中且非只读时显示 */}
                {isSelected && !readOnly && (
                  <div className="absolute -top-10 left-0 right-0 flex items-center justify-center gap-1">
                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                      {/* 调整大小 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElementSize(element.id, element.gridWidth - 1, element.gridHeight);
                        }}
                        disabled={element.gridWidth <= 1}
                        className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"
                      >
                        <span className="text-xs">−W</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElementSize(element.id, element.gridWidth + 1, element.gridHeight);
                        }}
                        disabled={element.gridX + element.gridWidth >= gridCols}
                        className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"
                      >
                        <span className="text-xs">+W</span>
                      </button>
                      <div className="w-px h-4 bg-stone-200" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElementSize(element.id, element.gridWidth, element.gridHeight - 1);
                        }}
                        disabled={element.gridHeight <= 1}
                        className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"
                      >
                        <span className="text-xs">−H</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElementSize(element.id, element.gridWidth, element.gridHeight + 1);
                        }}
                        disabled={element.gridY + element.gridHeight >= gridRows}
                        className="p-1 hover:bg-stone-100 rounded disabled:opacity-30"
                      >
                        <span className="text-xs">+H</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 类型选择器 */}
                {isSelected && !readOnly && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-40">
                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-stone-200 p-1">
                      {ZONE_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElementType(element.id, type.id);
                          }}
                          className={cn(
                            'px-2 py-1 text-xs rounded transition-colors',
                            element.type === type.id 
                              ? 'bg-stone-800 text-white' 
                              : 'hover:bg-stone-100'
                          )}
                        >
                          {type.name}
                        </button>
                      ))}
                      <div className="w-px h-6 bg-stone-200" />
                      <button
                        onClick={(e) => removeElement(element.id, e)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 物品标记 */}
        {Object.entries(floorPlan.items).map(([id, position]) => {
          const item = items.find(i => i.id === id);
          if (!item) return null;
          const isCurrentItem = itemId === id;
          return (
            <div
              key={id}
              className={cn(
                'absolute cursor-move select-none',
                isCurrentItem ? 'z-20' : 'z-10'
              )}
              style={{
                left: position.x,
                top: position.y
              }}
              onMouseDown={(e) => handleMouseDown(e, id, 'item')}
            >
              <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full shadow-lg',
                isCurrentItem ? 'bg-[#FF8C42] text-white' : 'bg-white text-stone-700 border border-stone-200'
              )}>
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap max-w-[120px] truncate">
                  {item.name}
                </span>
                {!readOnly && (
                  <button
                    onClick={(e) => removePosition(id, e)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* 添加物品提示 */}
        {mode === 'add_item' && itemId && !floorPlan.items[itemId] && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-stone-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-sm text-stone-600">点击画布添加物品</span>
            </div>
          </div>
        )}

        {/* 添加区域提示 */}
        {mode === 'add_zone' && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-stone-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-stone-600">点击画布添加区域</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

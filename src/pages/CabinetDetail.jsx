import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Plus, Minus, Calendar, Tag, FileText, DollarSign, Clock, Upload, Image as ImageIcon } from 'lucide-react';
import { useItemStore } from '../store/index';
import ImagePreview from '../components/ImagePreview';

const categories = [
  '食品', '日用品', '电器', '衣物', '书籍', '工具', '装饰品', '其他'
];

const cabinetSizeOptions = [
  '1x1', '1x2', '1x3', '1x4',
  '2x1', '2x2', '2x3', '2x4',
  '3x1', '3x2', '3x3', '3x4',
  '4x1', '4x2', '4x3', '4x4',
  '自定义'
];

export default function CabinetDetail() {
  const { roomId, cabinetId } = useParams();
  const navigate = useNavigate();
  const { 
    rooms, 
    cabinetColors, 
    cabinetSizes, 
    updateCabinet, 
    addItemToCabinet, 
    updateItemInCabinet, 
    removeItemFromCabinet 
  } = useItemStore();
  
  const room = rooms.find(r => r.id === roomId);
  const cabinet = room?.cabinets.find(c => c.id === cabinetId);
  const fileInputRef = useRef(null);
  
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(cabinet?.name || '');
  const [showAddItem, setShowAddItem] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    notes: '',
    category: '',
    purchaseDate: '',
    price: '',
    warrantyDate: '',
    expiryDate: '',
    image: ''
  });

  if (!room || !cabinet) {
    return <div>柜子不存在</div>;
  }

  const currentSize = `${cabinet.width || 2}x${cabinet.height || 1}`;
  const currentColor = cabinet.color || cabinetColors[0];

  const handleSaveName = () => {
    if (newName.trim()) {
      updateCabinet(roomId, cabinetId, { name: newName.trim() });
    }
    setEditingName(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewItem({ ...newItem, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (layerIndex) => {
    if (!newItem.name.trim()) {
      alert('请输入物品名称');
      return;
    }

    addItemToCabinet(roomId, cabinetId, layerIndex, newItem);
    setShowAddItem(null);
    setNewItem({
      name: '',
      quantity: 1,
      notes: '',
      category: '',
      purchaseDate: '',
      price: '',
      warrantyDate: '',
      expiryDate: '',
      image: ''
    });
  };

  const updateLayers = (delta) => {
    const newLayers = Math.max(1, Math.min(20, cabinet.layers + delta));
    updateCabinet(roomId, cabinetId, { layers: newLayers });
  };

  const handleSizeChange = (size) => {
    if (size === '自定义') {
      return;
    }
    const [width, height] = size.split('x').map(Number);
    updateCabinet(roomId, cabinetId, { width, height });
  };

  const handleColorChange = (color) => {
    updateCabinet(roomId, cabinetId, { color });
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
          <h1 className="text-xl font-bold text-[#2d3748]">柜子详情</h1>
          <div className="w-11" />
        </div>

        <div className="neu-flat p-4 mb-6 flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="text-[#2d3748] text-sm">
            点击柜子名称可修改，点击物品可快速编辑
          </span>
        </div>

        {/* 柜子名称 */}
        <div className="neu-pressed p-4 mb-6">
          <div className="text-[#718096] text-sm mb-2">名称</div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="flex-1 bg-transparent border-none outline-none text-[#2d3748] text-lg"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setNewName(cabinet.name);
                setEditingName(true);
              }}
              className="text-[#2d3748] text-lg text-left w-full"
            >
              {cabinet.name}
            </button>
          )}
        </div>

        {/* 大小选择 */}
        <div className="neu-pressed p-4 mb-6">
          <div className="text-[#718096] text-sm mb-3">大小</div>
          <div className="grid grid-cols-4 gap-2">
            {cabinetSizeOptions.map((size) => {
              const isSelected = size === currentSize;
              return (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#2d3748] text-white'
                      : 'neu-btn text-[#2d3748]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* 层数调节 */}
        <div className="neu-pressed p-4 mb-6">
          <div className="text-[#718096] text-sm mb-3">层数</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateLayers(-1)}
              className="w-10 h-10 neu-btn flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-[#2d3748] text-xl font-bold">{cabinet.layers}</span>
            <button
              onClick={() => updateLayers(1)}
              className="w-10 h-10 neu-btn flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 颜色选择 */}
        <div className="neu-pressed p-4 mb-6">
          <div className="text-[#718096] text-sm mb-3">颜色</div>
          <div className="flex gap-3">
            {cabinetColors.map((color, index) => {
              const isSelected = color === currentColor;
              return (
                <button
                  key={index}
                  onClick={() => handleColorChange(color)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 批量操作 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[#718096] text-sm">批量操作</div>
          <button className="text-[#5a8f6c] font-medium">批量调整物件</button>
        </div>

        {/* 层列表 */}
        <div className="space-y-4">
          {Array.from({ length: cabinet.layers }).map((_, index) => {
            const layerNumber = cabinet.layers - index;
            const layerItems = cabinet.items?.[index] || [];

            return (
              <div key={index} className="neu-flat p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#2d3748]">第{layerNumber}层</h3>
                  <button
                    onClick={() => setShowAddItem(index)}
                    className="flex items-center gap-1 text-[#5a8f6c] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    添加物品
                  </button>
                </div>

                {layerItems.length === 0 ? (
                  <div className="text-center py-6 text-[#718096]">
                    暂无物品，点击 + 添加
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {layerItems.map((item) => (
                      <div
                        key={item.id}
                        className="neu-btn overflow-hidden"
                      >
                        <div className="flex flex-col">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(item.image)}
                            />
                          )}
                          <div className="p-2 flex items-center gap-2">
                            <span className="text-sm text-[#2d3748]">{item.name}</span>
                            {item.quantity > 1 && (
                              <span className="bg-[#5a8f6c] text-white text-xs px-2 py-0.5 rounded-full">
                                ×{item.quantity}
                              </span>
                            )}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('确定删除这个物品吗？')) {
                                  removeItemFromCabinet(roomId, cabinetId, index, item.id);
                                }
                              }}
                              className="ml-1 text-red-500 hover:text-red-600 text-xs cursor-pointer select-none"
                            >
                              ✕
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

      {/* 添加物品模态框 */}
      {showAddItem !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-[#e8eef5] w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2d3748]">添加物品</h2>
              <button
                onClick={() => setShowAddItem(null)}
                className="text-[#718096] text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 物品名称 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">名称 *</label>
                <div className="neu-pressed p-4">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="输入物品名称"
                    className="w-full bg-transparent border-none outline-none text-[#2d3748]"
                  />
                </div>
              </div>

              {/* 数量 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">数量</label>
                <div className="neu-pressed p-4 flex items-center gap-4">
                  <button
                    onClick={() => setNewItem({ ...newItem, quantity: Math.max(1, newItem.quantity - 1) })}
                    className="w-8 h-8 neu-btn flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[#2d3748] font-medium">{newItem.quantity}</span>
                  <button
                    onClick={() => setNewItem({ ...newItem, quantity: newItem.quantity + 1 })}
                    className="w-8 h-8 neu-btn flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 图片上传 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">图片</label>
                {newItem.image ? (
                  <div className="relative">
                    <img
                      src={newItem.image}
                      alt="预览"
                      className="w-full h-40 object-cover rounded-lg"
                      onClick={() => setPreviewImage(newItem.image)}
                    />
                    <button
                      onClick={() => setNewItem({ ...newItem, image: '' })}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full neu-btn py-8 flex flex-col items-center gap-2 border-2 border-dashed border-[#a0aec0]"
                  >
                    <Upload className="w-8 h-8 text-[#718096]" />
                    <span className="text-[#718096]">点击上传图片</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="neu-flat p-3 mb-4">
                <span className="bg-[#e8eef5] px-4 text-[#718096] text-sm">以下信息非必填，可用于物件分析</span>
              </div>

              {/* 分类 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">分类</label>
                <div className="neu-btn p-4 flex items-center justify-between relative">
                  <span className={newItem.category ? 'text-[#2d3748]' : 'text-[#a0aec0]'}>
                    {newItem.category || '选择类别（可选）'}
                  </span>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    <option value="">选择类别</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 购买日期 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">购买日期</label>
                <div className="neu-pressed p-4 flex items-center justify-between">
                  <input
                    type="date"
                    value={newItem.purchaseDate}
                    onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-[#2d3748]"
                  />
                  <Calendar className="w-5 h-5 text-[#718096]" />
                </div>
              </div>

              {/* 价格 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">价格</label>
                <div className="neu-pressed p-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#718096]" />
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="金额（可选）"
                    className="flex-1 bg-transparent border-none outline-none text-[#2d3748] placeholder-[#a0aec0]"
                    step="0.01"
                  />
                </div>
              </div>

              {/* 质保期 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">质保期</label>
                <div className="neu-pressed p-4 flex items-center justify-between">
                  <input
                    type="date"
                    value={newItem.warrantyDate}
                    onChange={(e) => setNewItem({ ...newItem, warrantyDate: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-[#2d3748]"
                  />
                  <Clock className="w-5 h-5 text-[#718096]" />
                </div>
              </div>

              {/* 保质期 */}
              <div className="mb-4">
                <label className="block text-[#2d3748] font-medium mb-2">保质期</label>
                <div className="neu-pressed p-4 flex items-center justify-between">
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-[#2d3748]"
                    placeholder="选择日期（可选）"
                  />
                  <Calendar className="w-5 h-5 text-[#718096]" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddItem(null)}
                  className="flex-1 neu-btn py-3 text-[#718096] font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAddItem(showAddItem)}
                  className="flex-1 neu-btn-primary py-3 text-white font-medium"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      <ImagePreview
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}

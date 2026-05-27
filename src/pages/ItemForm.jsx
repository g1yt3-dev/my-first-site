import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { useItemStore } from '../store/index';
import FloorPlanEditor from '../components/FloorPlanEditor';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, updateItem, getItemById } = useItemStore();
  
  const isEdit = !!id;
  const existingItem = id ? getItemById(id) : undefined;
  const [tempItemId, setTempItemId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    category: '',
    expiryDate: '',
    purchaseDate: '',
    notes: '',
  });

  useEffect(() => {
    if (existingItem) {
      setFormData({
        name: existingItem.name,
        location: existingItem.location,
        category: existingItem.category || '',
        expiryDate: existingItem.expiryDate || '',
        purchaseDate: existingItem.purchaseDate || '',
        notes: existingItem.notes || '',
      });
    }
  }, [existingItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      alert('请填写物品名称和位置');
      return;
    }

    const itemData = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      category: formData.category.trim() || undefined,
      expiryDate: formData.expiryDate || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (isEdit && id) {
      updateItem(id, itemData);
    } else {
      addItem(itemData, tempItemId);
    }

    navigate('/');
  };

  const handleFormDataChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (!isEdit && !tempItemId && formData.name.trim()) {
      const tempId = 'temp-' + Date.now();
      setTempItemId(tempId);
    }
  };

  const effectiveItemId = id || tempItemId;

  return (
    <div className="min-h-screen bg-[#F4F1DE]">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-stone-600 hover:text-stone-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900">
            {isEdit ? '编辑物品' : '添加新物品'}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">
                  物品名称 *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormDataChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all"
                  placeholder="例如：牛奶、洗衣液"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-stone-700 mb-2">
                  存放位置 *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFormDataChange('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all"
                  placeholder="例如：冰箱上层、厨房储物柜"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-2">
                  分类
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleFormDataChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all"
                  placeholder="例如：食品、日用品"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-stone-700 mb-2">
                    保质期至
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => handleFormDataChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-stone-700 mb-2">
                    购买日期
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={(e) => handleFormDataChange('purchaseDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-2">
                  备注
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleFormDataChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-[#FF8C42]/50 focus:border-[#FF8C42] outline-none transition-all resize-none"
                  placeholder="添加一些备注信息..."
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-white border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-5 h-5 mr-2" />
                {isEdit ? '保存修改' : '保存物品'}
              </button>
            </div>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="text-lg font-bold text-stone-800">摆放位置</h2>
            </div>
            <FloorPlanEditor itemId={effectiveItemId} />
          </div>
        </div>
      </div>
    </div>
  );
}

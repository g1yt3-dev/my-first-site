import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Tag, FileText, Clock } from 'lucide-react';
import { useItemStore } from '../store/index';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import FloorPlanEditor from '../components/FloorPlanEditor';
import ImagePreview from '../components/ImagePreview';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StatusBadge = ({ status, days }) => {
  const badgeStyles = {
    'expired': 'bg-red-100 text-red-800 border-red-200',
    'expiring-soon': 'bg-amber-100 text-amber-800 border-amber-200',
    'normal': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const statusText = {
    'expired': '已过期',
    'expiring-soon': days ? `还剩 ${days} 天` : '即将过期',
    'normal': '正常',
  };

  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-sm font-medium border',
      badgeStyles[status]
    )}>
      {statusText[status]}
    </span>
  );
};

const calculateItemStatus = (item) => {
  if (!item.expiryDate) {
    return { status: 'normal' };
  }

  const expiryDate = new Date(item.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'normal';
  if (diffDays < 0) {
    status = 'expired';
  } else if (diffDays <= 7) {
    status = 'expiring-soon';
  }

  return { status, daysUntilExpiry: diffDays };
};

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="text-sm text-stone-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, deleteItem, floorPlan } = useItemStore();
  const item = id ? getItemById(id) : undefined;
  const [previewImage, setPreviewImage] = useState(null);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F4F1DE] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❓</div>
          <h2 className="text-lg font-bold text-stone-800 mb-2">物品不存在</h2>
          <Link to="/" className="text-[#2D6A4F] hover:underline text-sm">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const { status, daysUntilExpiry } = calculateItemStatus(item);
  const hasPosition = floorPlan.items[id];

  const handleDelete = () => {
    if (confirm('确定要删除这个物品吗？')) {
      deleteItem(item.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1DE] pb-6">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-[#F4F1DE]/95 backdrop-blur-sm border-b border-stone-200">
        <div className="px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="text-sm">返回</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* 标题区 */}
        <div className="mb-4">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <h1 className="text-xl font-bold text-stone-900 flex-1 min-w-[60%]">{item.name}</h1>
            <StatusBadge status={status} days={daysUntilExpiry} />
          </div>
          <p className="text-xs text-stone-500">
            创建于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
          </p>
        </div>

        {/* 状态提示 */}
        <div className={cn(
          'rounded-xl p-4 mb-4',
          status === 'expired' ? 'bg-red-50 border border-red-100' : 
          status === 'expiring-soon' ? 'bg-amber-50 border border-amber-100' : 
          item.expiryDate ? 'bg-emerald-50 border border-emerald-100' : 'bg-stone-50 border border-stone-100'
        )}>
          {status === 'expired' && (
            <div className="flex items-center gap-3 text-red-700">
              <div className="text-xl">⚠️</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">此物品已过期</p>
                <p className="text-xs text-red-600 mt-0.5">过期了 {Math.abs(daysUntilExpiry)} 天</p>
              </div>
            </div>
          )}
          {status === 'expiring-soon' && (
            <div className="flex items-center gap-3 text-amber-700">
              <div className="text-xl">⏰</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">即将过期</p>
                <p className="text-xs text-amber-600 mt-0.5">请尽快使用</p>
              </div>
            </div>
          )}
          {status === 'normal' && item.expiryDate && (
            <div className="flex items-center gap-3 text-emerald-700">
              <div className="text-xl">✅</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">状态良好</p>
                <p className="text-xs text-emerald-600 mt-0.5">还有 {daysUntilExpiry} 天过期</p>
              </div>
            </div>
          )}
        </div>

        {/* 物品图片 */}
        {item.image && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-4">
            <div className="p-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-full max-h-80 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setPreviewImage(item.image)}
              />
            </div>
          </div>
        )}

        {/* 物品详情卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-4">
          <div className="p-4">
            <DetailRow 
              icon={MapPin} 
              label="存放位置" 
              value={item.location} 
            />
            <DetailRow 
              icon={Tag} 
              label="分类" 
              value={item.category} 
            />
            <DetailRow 
              icon={Calendar} 
              label="保质期至" 
              value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('zh-CN') : undefined} 
            />
            <DetailRow 
              icon={Clock} 
              label="购买日期" 
              value={item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('zh-CN') : undefined} 
            />
            <DetailRow 
              icon={FileText} 
              label="备注" 
              value={item.notes} 
            />
          </div>
        </div>

        {/* 平面图位置 */}
        {(floorPlan.image || Object.keys(floorPlan.items).length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#2D6A4F]" />
              <h2 className="text-sm font-bold text-stone-800">摆放位置</h2>
            </div>
            <FloorPlanEditor itemId={id} readOnly={true} />
          </div>
        )}

        {/* 底部操作按钮 */}
        <div className="flex gap-3">
          <Link
            to={`/edit/${item.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-white border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-all shadow-sm text-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-100 transition-all shadow-sm text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </button>
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

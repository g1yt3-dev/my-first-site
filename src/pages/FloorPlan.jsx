import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import FloorPlanEditor from '../components/FloorPlanEditor';

export default function FloorPlanPage() {
  return (
    <div className="min-h-screen bg-[#F4F1DE]">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-stone-600 hover:text-stone-90 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Link>
          <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
            <Home className="w-8 h-8 text-[#2D6A4F]" />
            户型图管理
          </h1>
          <p className="text-stone-500 mt-2">
            上传户型图并标记房间位置，管理物品的摆放
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <FloorPlanEditor />
        </div>
      </div>
    </div>
  );
}

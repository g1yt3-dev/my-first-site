
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (err) {
      console.error('注册失败:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F4F1DE] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2D6A4F] mb-2">注册</h1>
          <p className="text-stone-500">创建您的账户，开始管理物品</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent outline-none transition-all"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent outline-none transition-all"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              密码
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent outline-none transition-all"
              placeholder="请输入密码"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              确认密码
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent outline-none transition-all"
              placeholder="请再次输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D6A4F] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#1B4332] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-stone-500">
            已有账户？{' '}
            <Link
              to="/login"
              className="text-[#2D6A4F] font-medium hover:underline"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

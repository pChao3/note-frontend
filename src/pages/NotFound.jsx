// src/pages/[[...all]].tsx   ← 推荐用这个文件名
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">哎呀，页面走丢了</p>
        <p className="text-lg text-gray-500 mb-10">你访问的地址不存在，要不回去看看？</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-xl transition transform hover:-translate-y-1"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

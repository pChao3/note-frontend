import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 sm:mb-8">
          404
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-3 sm:mb-4">
          哎呀，页面走丢了
        </p>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8 sm:mb-10">
          你访问的地址不存在，要不回去看看？
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
          <Link
            to="/"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm sm:text-base font-medium hover:shadow-xl transition transform hover:-translate-y-1"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

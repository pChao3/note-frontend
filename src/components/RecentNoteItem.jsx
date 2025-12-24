// 最近日记列表项 (使用 MOOD_MAP)
import dayjs from 'dayjs';
import { MOOD_MAP } from './config';

const RecentNoteItem = ({ createTime, title, content, mood }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150 border-l-4 border-indigo-400">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
        {dayjs(createTime).fromNow()}
      </p>
      <span className="text-xl">
        {MOOD_MAP[mood] || '❓'} {/* 安全地获取表情 */}
      </span>
    </div>
    <h4 className="text-xl font-bold text-gray-800 dark:text-white truncate">{title}</h4>
    <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">{content}</p>
  </div>
);

export default RecentNoteItem;

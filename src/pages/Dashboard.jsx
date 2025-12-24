import React, { useEffect, useState } from 'react';
import { CalendarDays, Smile, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotes, getStatistic } from '../api/note';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'; // 确保在 App.jsx 或 main.jsx 中全局配置

import RecentNoteItem from '../components/RecentNoteItem';
import { MOOD_MAP } from '../components/config';

dayjs.extend(relativeTime);
// 假设 dayjs.locale('zh-cn'); 已经在应用入口设置

// 默认情绪映射，以防后端返回非 happy 或 calm

// 概览卡片组件 (保持不变)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border-t-4 ${color}`}>
    <div className="flex items-center justify-between">
      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {/* 动态设置 Icon 颜色 */}
      <Icon className={`w-7 h-7 text-${color.split('-')[1]}-500`} />
    </div>
    <p className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">{value}</p>
  </div>
);

// 移除 mapMood 函数，改用 MOOD_MAP
/*
const mapMood = info => {
  if (info === 'happy') {
    return '😄';
  } else {
    return '😔';
  }
};
*/

// 默认统计数据结构，确保 keys 和初始值是正确的
const INITIAL_STATS = [
  {
    title: '已记录天数',
    value: 0,
    key: 'actNum',
    icon: CalendarDays,
    color: 'border-blue-500',
  },
  {
    title: '主要心情概况',
    value: MOOD_MAP.unknown, // 使用默认值
    icon: Smile,
    key: 'mood',
    color: 'border-yellow-500',
  },
  {
    title: '最近写作时间',
    value: '暂无记录', // 使用字符串默认值
    icon: Clock,
    key: 'lastTime',
    color: 'border-green-500',
  },
];

export default function Dashboard() {
  const [totalData, setTotalData] = useState(INITIAL_STATS);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    getData();
    getTotal();
  }, []);

  // 获取最近日记列表
  const getData = async () => {
    try {
      const res = await getNotes();
      // 安全检查：确保 res.data 是数组
      if (Array.isArray(res.data)) {
        setNotes(res.data.slice(0, 3));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('获取日记失败:', error);
      setNotes([]);
    }
  };

  // 获取统计数据
  const getTotal = async () => {
    try {
      const res = await getStatistic();
      const statsData = res.data || {}; // 使用空对象作为回退，防止 res.data 为 null/undefined

      const updatedStats = INITIAL_STATS.map(stat => {
        let value = statsData[stat.key];

        if (stat.key === 'mood') {
          // 安全映射心情：如果 statsData[stat.key] 为空，则显示默认值
          stat.value = MOOD_MAP[value] || MOOD_MAP.unknown;
        } else if (stat.key === 'lastTime' && value) {
          // 只有当 lastTime 存在时才格式化
          stat.value = dayjs(value).fromNow();
        } else if (stat.key === 'actNum') {
          // 确保 actNum 是数字，如果不存在则为 0
          stat.value = value || 0;
        } else {
          // 如果 statsData 中没有这个键或值为空，则保留 INITIAL_STATS 中的默认值
          stat.value = stat.value;
        }
        return stat;
      });
      setTotalData(updatedStats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 如果获取失败，保留 INITIAL_STATS
      setTotalData(INITIAL_STATS);
    }
  };

  return (
    <div className="space-y-10">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 使用 totalData，现在它有了更可靠的默认值 */}
        {totalData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* 最近日记列表 */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3">
          最近日记
        </h3>
        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map(note => (
              // 确保 notes 数组中的对象有唯一的 id
              <RecentNoteItem key={note._id || note.id || Math.random()} {...note} />
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              暂无日记记录。
              <Link
                to="/editor"
                className="block mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                现在就去写一篇 →
              </Link>
            </div>
          )}
        </div>
        {notes.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              to="/timeline"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              查看所有日记 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

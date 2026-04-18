import React, { useEffect, useState } from 'react';
import { CalendarDays, Smile, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotes, getStatistic } from '../api/note';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import RecentNoteItem from '../components/RecentNoteItem';
import { MOOD_MAP } from '../components/config';
import { Spin } from 'antd';

dayjs.extend(relativeTime);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-4 sm:p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border-t-4 ${color}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <Icon className={`w-5 h-5 sm:w-7 sm:h-7 text-${color.split('-')[1]}-500`} />
    </div>
    <p className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{value}</p>
  </div>
);

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
    value: MOOD_MAP.unknown,
    icon: Smile,
    key: 'mood',
    color: 'border-yellow-500',
  },
  {
    title: '最近写作时间',
    value: '暂无记录',
    icon: Clock,
    key: 'lastTime',
    color: 'border-green-500',
  },
];

export default function Dashboard() {
  const [totalData, setTotalData] = useState(INITIAL_STATS);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
    getTotal();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await getNotes();
      if (Array.isArray(res.data)) {
        setNotes(res.data.slice(0, 3));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('获取日记失败:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = async () => {
    try {
      const res = await getStatistic();
      const statsData = res.data || {};

      const updatedStats = INITIAL_STATS.map(stat => {
        let value = statsData[stat.key];

        if (stat.key === 'mood') {
          stat.value = MOOD_MAP[value] || MOOD_MAP.unknown;
        } else if (stat.key === 'lastTime' && value) {
          stat.value = dayjs(value).fromNow();
        } else if (stat.key === 'actNum') {
          stat.value = value || 0;
        } else {
          stat.value = stat.value;
        }
        return stat;
      });
      setTotalData(updatedStats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setTotalData(INITIAL_STATS);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <Spin spinning={loading}>
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {totalData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent notes */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl mt-6 sm:mt-10">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 border-b pb-3">
            最近日记
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {notes.length > 0 ? (
              notes.map(note => (
                <RecentNoteItem key={note._id || note.id || Math.random()} {...note} />
              ))
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-500 dark:text-gray-400">
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
            <div className="mt-4 sm:mt-6 text-center">
              <Link
                to="/timeline"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                查看所有日记 →
              </Link>
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
}

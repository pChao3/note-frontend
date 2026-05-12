import React, { useEffect, useState } from 'react';
import { CalendarDays, Smile, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import { getNotes, getStatistic } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem';
import { MOOD_MAP } from '../components/config';

dayjs.extend(relativeTime);

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-4 sm:p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border-t-4 ${color}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm sm:text-lg font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-500" />
    </div>
    <p className="mt-2 text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white break-words">
      {value}
    </p>
  </div>
);

const STAT_DEFS = [
  { key: 'actNum', title: '已记录天数', icon: CalendarDays, color: 'border-blue-500' },
  { key: 'mood', title: '主要心情概况', icon: Smile, color: 'border-yellow-500' },
  { key: 'lastTime', title: '最近写作时间', icon: Clock, color: 'border-green-500' },
];

const defaultValues = {
  actNum: 0,
  mood: MOOD_MAP.unknown,
  lastTime: '暂无记录',
};

function resolveValue(key, raw) {
  if (raw === undefined || raw === null) return defaultValues[key];
  if (key === 'mood') return MOOD_MAP[raw] || MOOD_MAP.unknown;
  if (key === 'lastTime') return dayjs(raw).fromNow();
  if (key === 'actNum') return raw || 0;
  return raw;
}

export default function Dashboard() {
  const [stats, setStats] = useState(() =>
    STAT_DEFS.map(s => ({ ...s, value: defaultValues[s.key] }))
  );
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
      setNotes(Array.isArray(res.data) ? res.data.slice(0, 3) : []);
    } catch (err) {
      console.error('获取日记失败', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = async () => {
    try {
      const res = await getStatistic();
      const statsData = res.data || {};
      setStats(
        STAT_DEFS.map(s => ({
          ...s,
          value: resolveValue(s.key, statsData[s.key]),
        }))
      );
    } catch (err) {
      console.error('获取统计数据失败', err);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map(stat => (
            <StatCard key={stat.key} {...stat} />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl mt-6 sm:mt-10">
          <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
            最近日记
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {notes.length > 0 ? (
              notes.map(note => (
                <RecentNoteItem key={note._id || note.id || Math.random()} {...note} />
              ))
            ) : (
              <div className="text-center py-8 sm:py-10 text-gray-500 dark:text-gray-400">
                暂无日记记录
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

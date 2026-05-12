import React, { useEffect, useState } from 'react';
import { CalendarDays, Smile, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import dayjs from 'dayjs';

import { getNotes, getStatistic } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem';
import { MOOD_MAP } from '../components/config';

// dayjs plugins are already registered globally in main.jsx

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <div className={`relative p-5 sm:p-6 rounded-2xl shadow-lg overflow-hidden text-white ${gradient}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold break-words leading-tight">{value}</p>
    </div>
  </div>
);

const STAT_DEFS = [
  { key: 'actNum', title: '已记录天数', icon: CalendarDays, gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { key: 'mood', title: '主要心情概况', icon: Smile, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { key: 'lastTime', title: '最近写作时间', icon: Clock, gradient: 'bg-gradient-to-br from-emerald-400 to-teal-600' },
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

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl mt-6 sm:mt-10 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
              最近日记
            </h3>
            {notes.length > 0 && (
              <Link
                to="/timeline"
                className="text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium transition-colors"
              >
                查看全部 →
              </Link>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            {notes.length > 0 ? (
              notes.map((note, idx) => (
                <RecentNoteItem key={note._id || note.id || idx} {...note} />
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

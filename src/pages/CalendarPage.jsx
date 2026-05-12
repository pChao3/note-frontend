import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Spin } from 'antd';
import dayjs from 'dayjs';

import { getNotesByDate, getNotesNumber } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem';

/** Reactive media-query hook (matches Tailwind's lg breakpoint = 1024px). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = e => setIsDesktop(e.matches);
    mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
    return () =>
      mql.removeEventListener
        ? mql.removeEventListener('change', handler)
        : mql.removeListener(handler);
  }, []);
  return isDesktop;
}

export default function CalendarView() {
  const isDesktop = useIsDesktop();
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [markedDates, setMarkedDates] = useState({});
  const [dayNotes, setDayNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('YYYY-MM-DD');

  useEffect(() => {
    onPanelChange(selectedDate);
    onSelect(selectedDate, { source: 'date' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateCellRender = (value, type) => {
    const dates = Object.entries(markedDates);
    const formType = value.format(type === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD');
    const num = dates.find(i => i[0] === formType);
    if (num) {
      return (
        <div className="bg-pink-100 dark:bg-pink-900/30 rounded-lg sm:rounded-3xl font-bold text-[10px] sm:text-base px-1 py-0.5 sm:p-0 text-center">
          <Badge status="success" text={num[1] > 99 ? '99+' : `${num[1]}条`} />
        </div>
      );
    }
    return null;
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return dateCellRender(current, 'month');
    return info.originNode;
  };

  const onSelect = async (date, { source }) => {
    setSelectedDate(date);
    if (source === 'year') return;
    try {
      setLoading(true);
      const res = await getNotesByDate({
        type: source,
        time: dayjs(date).format(source === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM'),
      });
      setDayNotes(res.data || []);
      setFormat(source === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onPanelChange = async (date, mode = 'month') => {
    setLoading(true);
    try {
      const res = await getNotesNumber({
        type: mode,
        time: dayjs(date).format(mode === 'month' ? 'YYYY-MM' : 'YYYY'),
      });
      setMarkedDates(res.data || {});
      setDayNotes([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <Spin spinning={loading}>
        <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
            className="w-full border-none font-sans text-sm sm:text-base"
            fullscreen={isDesktop}
          />
        </div>

        {dayNotes.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">📅</span>
              {dayjs(selectedDate).format(format)} 的记录
            </h3>
            {dayNotes.map(note => (
              <RecentNoteItem key={note._id || note.id} {...note} />
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
}

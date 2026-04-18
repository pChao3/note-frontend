import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { getNotesByDate, getNotesNumber } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem';

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [markedDates, setMarkedDates] = useState([]);
  const [dayNotes, setDayNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('YYYY-MM-DD');

  useEffect(() => {
    onPanelChange(selectedDate);
    onSelect(selectedDate, { source: 'date' });
  }, []);

  const dateCellRender = (value, type) => {
    const dates = Object.entries(markedDates);
    const formType = value.format(type === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD');
    const num = dates.find(i => {
      return i[0] == formType;
    });
    if (num) {
      return (
        <div className="bg-pink-200 rounded-xl sm:rounded-3xl font-bold text-xs sm:text-base p-1 sm:p-0">
          <Badge status="success" text={num[1] > 99 ? '99+' : `${num[1]}条`} />
        </div>
      );
    }
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    if (info.type === 'month') {
      return dateCellRender(current, 'month');
    }
    return info.originNode;
  };

  const onSelect = async (date, { source }) => {
    setSelectedDate(date);
    if (source === 'year') {
      return;
    }
    try {
      setLoading(true);
      const params = {
        type: source,
        time: dayjs(date).format(source === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM'),
      };
      const res = await getNotesByDate(params);
      setDayNotes(res.data);
      setFormat(source === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onPanelChange = async (date, mode = 'month') => {
    setLoading(true);
    try {
      const params = {
        type: mode,
        time: dayjs(date).format(mode === 'month' ? 'YYYY-MM' : 'YYYY'),
      };
      const res = await getNotesNumber(params);
      setMarkedDates(res.data);
      setDayNotes([]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <Spin spinning={loading}>
        {/* Calendar card */}
        <div className="bg-white dark:bg-gray-800 p-2 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
            className="w-full border-none font-sans text-sm sm:text-base"
            fullscreen={true}
          />
        </div>

        {/* Selected date notes */}
        <div className="space-y-3 sm:space-y-4">
          {dayNotes.length > 0 && (
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">📅</span>
              {dayjs(selectedDate).format(format)} 的记录
            </h3>
          )}
          {dayNotes.length > 0 && dayNotes.map(note => <RecentNoteItem key={note._id} {...note} />)}
        </div>
      </Spin>
    </div>
  );
}

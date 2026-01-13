import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { getNotesByDate, getNotesNumber } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem'; // 复用之前的组件

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
  const [markedDates, setMarkedDates] = useState([]); // 存储本月有日记的日期列表
  const [dayNotes, setDayNotes] = useState([]); // 当前选中日期的日记列表
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('YYYY-MM-DD');

  // 1. 初始化或切换月份时，获取有记录的日期（用于画小圆点）
  useEffect(() => {
    onPanelChange(selectedDate);
    onSelect(selectedDate, { source: 'date' });
  }, []);

  const dateCellRender = (value, type) => {
    const dates = Object.entries(markedDates);
    const monthform =
      value.month() + 1 >= 10 ? (value.month() + 1).toString() : '0' + (value.month() + 1);
    const formType = type === 'month' ? monthform : value.date().toString();
    const num = dates.find(i => {
      return i[0].slice(-2) == formType;
    });
    if (num) {
      return (
        <div className="bg-pink-200 rounded-3xl font-bold ">
          <Badge status="success" text={`共${num[1]}条日记！`} />
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
    console.log('source', source);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Spin spinning={loading}>
        {/* 日历卡片 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
          <Calendar
            value={selectedDate}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRender}
            className="w-full border-none font-sans"
          />
        </div>

        {/* 选中日期的详情列表 */}
        <div className="space-y-4">
          {dayNotes.length > 0 && (
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
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

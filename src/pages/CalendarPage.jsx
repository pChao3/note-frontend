import React, { useState, useEffect } from 'react';
import { Calendar, Badge } from 'antd';
import dayjs from 'dayjs';
import { getNotesByMonth, getNotesByDate } from '../api/note';
import RecentNoteItem from '../components/RecentNoteItem'; // 复用之前的组件

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState([]); // 存储本月有日记的日期列表
  const [dayNotes, setDayNotes] = useState([]); // 当前选中日期的日记列表

  // 1. 初始化或切换月份时，获取有记录的日期（用于画小圆点）
  useEffect(() => {
    fetchMonthData(selectedDate);
  }, [selectedDate]);

  const fetchMonthData = async date => {
    const month = dayjs(date).format('YYYY-MM');
    const res = await getNotesByMonth(month);
    // 假设返回：{ status: 'ok', data: ['2023-12-01', '2023-12-05'] }
    setMarkedDates(res.data);
  };

  // 2. 点击某个日期，获取该日的日记详情
  const handleDateClick = async date => {
    console.log('data', date);
    setSelectedDate(date);
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const res = await getNotesByDate(dateStr);
    setDayNotes(res.data);
  };

  const getMonthData = value => {
    // const monthArr = markedDates.map(i => i.slice(5, 7));
    // console.log(monthArr);
    // if (monthArr.includes(value.month().toString())) {
    //   return 333;
    // }
    // if (value.month() === 8) {
    //   return 1394;
    // }
  };
  const monthCellRender = value => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const dateCellRender = value => {
    console.log('hhh', markedDates);
    const dates = Object.entries(markedDates);
    const num = dates.find(i => {
      return i[0].slice(-2) == value.date().toString();
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
      return monthCellRender(current);
    }
    return info.originNode;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 日历卡片 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
        <Calendar
          onChange={handleDateClick}
          cellRender={cellRender}
          className="w-full border-none font-sans"
        />
      </div>

      {/* 选中日期的详情列表 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <span className="mr-2">📅</span>
          {dayjs(selectedDate).format('YYYY年MM月DD日')} 的记录
        </h3>

        {dayNotes.length > 0 ? (
          dayNotes.map(note => <RecentNoteItem key={note._id} {...note} />)
        ) : (
          <div className="p-10 text-center bg-gray-50 dark:bg-gray-700 rounded-2xl text-gray-400">
            这一天没有写日记哦 ~
          </div>
        )}
      </div>
    </div>
  );
}

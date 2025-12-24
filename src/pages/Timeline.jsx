// src/pages/Timeline.jsx

import React, { useState, useEffect } from 'react';
import { Filter, Calendar, Tag, Smile } from 'lucide-react';
import { Select, Input, Button } from 'antd';
import {
  getNotes,
  getAllMonthes,
  getAllMoods,
  queryNote,
  deleteNote,
  makePoint,
} from '../api/note';

import dayjs from 'dayjs';
const { Option } = Select;

// 日记时间轴卡片
// 注意：这里我们将 createTime 字段格式化为相对时间
const TimelineCard = ({ createTime, title, content, mood, tag }) => {
  // 使用 dayjs 格式化时间，例如 '3 小时前'
  const formattedTime = dayjs(createTime).fromNow();

  return (
    <div className="relative mb-8 pl-10">
      {/* ... 时间轴节点和线保持不变 ... */}
      <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-indigo-500 border-4 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-400"></div>
      <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-700"></div>

      {/* 日期和心情：使用格式化后的时间 */}
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {formattedTime} <span className="ml-2 text-xl">{mood}</span>
      </p>

      {/* ... 日记内容卡片保持不变 ... */}
      <div className="mt-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-indigo-500">
        <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h4>
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{content}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tag.split(',').map((i, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium text-white bg-gray-500 rounded-full dark:bg-gray-600"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Timeline() {
  const [filter, setFilter] = useState('all');
  const [notes, setNotes] = useState([]);
  const [monthes, setMonthesArr] = useState([]);
  const [moodOption, setMoodOption] = useState([]);

  const [monthValue, setMonthValue] = useState('');
  const [moodValue, setMoodValue] = useState('');
  const [tagsValue, setTagsValue] = useState('');

  // 模拟加载状态
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getData();
    getMonthes();
    getMoods();
  }, []);

  const getData = async () => {
    setIsLoading(true);
    // 假设 getNotes 返回 { data: Array<Note> }
    const res = await getNotes();
    setNotes(res.data);
    setIsLoading(false);
  };

  const getMonthes = async () => {
    const res = await getAllMonthes();
    setMonthesArr(res.data);
    console.log(res.data);
  };

  const getMoods = async () => {
    const res = await getAllMoods();
    setMoodOption(res.moods);
  };

  const monthChange = e => {
    setMonthValue(e);
  };
  const moodChange = e => {
    setMoodValue(e);
  };
  const tagsChange = e => {
    setTagsValue(e.target.value);
  };

  const searchNotes = async () => {
    setIsLoading(true);

    const params = {
      month: monthValue,
      mood: moodValue,
      tag: tagsValue,
    };
    const res = await queryNote(params);
    setIsLoading(false);

    setNotes(res.data);
  };
  const onChange = (e, key) => {
    [key](e);
    console.log(e);
  };

  const search = () => {
    console.log(moodValue, monthValue, tagsValue);
  };

  // ... (筛选器逻辑和数据保持不变)

  return (
    <div className="space-y-8 ">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">日记列表与归档</h2>

      {/* 筛选器区域 (保持不变) */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">筛选:</span>

        <Select defaultValue="" style={{ width: 120 }} onChange={monthChange} size="large">
          <Option value="">所有月份</Option>
          {monthes.map(i => (
            <Option value={i}>{i}</Option>
          ))}
        </Select>

        <Select
          defaultValue=""
          style={{ width: 120 }}
          size="large"
          onChange={moodChange}
          placeholder="心情筛选"
        >
          <Option value="">所有心情</Option>
          {moodOption.map(i => (
            <Option value={i}>{i}</Option>
          ))}
        </Select>

        <Input
          value={tagsValue}
          onChange={tagsChange}
          placeholder="标签筛选"
          prefix={<Tag className="w-4 h-4 text-gray-400" />}
          className="!w-48 !h-10"
        />

        <Button type="primary" onClick={searchNotes}>
          search
        </Button>
      </div>

      {/* 核心修改区域：时间轴内容 */}
      {/* 1. max-h-[60vh]：设置最大高度为视口高度的 60%
        2. overflow-y-auto：超出最大高度时显示垂直滚动条
        3. pt-4：保持顶部的间距
      */}
      <div className="max-w-3xl mx-auto pt-4 max-h-[75vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-10">加载中...</div> // 简单加载提示
        ) : notes.length > 0 ? (
          notes.map((note, index) => <TimelineCard key={index} {...note} />)
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">暂无日记记录。</p>
        )}
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">--- 已加载全部 ---</p>
      </div>
    </div>
  );
}

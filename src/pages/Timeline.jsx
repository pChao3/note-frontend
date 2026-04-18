import { useState, useEffect } from 'react';
import { Filter, Tag, Trash2, PenLine } from 'lucide-react';
import { Select, Input, Button, Spin, message } from 'antd';
import { getNotes, getAllMonthes, getAllMoods, queryNote, deleteNote } from '../api/note';
import { Link } from 'react-router-dom';
import { MOOD_MAP } from '../components/config';

import dayjs from 'dayjs';
const { Option } = Select;

const TimelineCard = ({ createTime, title, content, mood, tag, id, deleteNoteById }) => {
  const formattedTime = dayjs(createTime).fromNow();

  return (
    <div className="relative mb-6 sm:mb-8 pl-8 sm:pl-10">
      <div className="absolute left-0 top-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-500 border-4 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-400"></div>
      <div className="absolute left-1 sm:left-1.5 top-4 sm:top-5 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-700"></div>

      <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {formattedTime} <span className="ml-2 text-base sm:text-xl">mood:{MOOD_MAP[mood]}</span>
      </p>

      <div className="mt-2 p-4 sm:p-6 group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-indigo-500 hover:cursor-pointer">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h4>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3">{content}</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 relative">
          {tag.split(',').map((i, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-white bg-gray-500 rounded-full dark:bg-gray-600"
            >
              {i}
            </span>
          ))}
          <Link to={`/editor?id=${id}`} className="ml-auto">
            <PenLine className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-indigo-500" />
          </Link>
          <Trash2
            onClick={() => deleteNoteById(id)}
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-red-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default function Timeline() {
  const [notes, setNotes] = useState([]);
  const [monthes, setMonthesArr] = useState([]);
  const [moodOption, setMoodOption] = useState([]);

  const [monthValue, setMonthValue] = useState('');
  const [moodValue, setMoodValue] = useState('');
  const [tagsValue, setTagsValue] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getData();
    getMonthes();
    getMoods();
  }, []);

  const getData = async () => {
    setIsLoading(true);
    const res = await getNotes();
    setNotes(res.data);
    setIsLoading(false);
  };

  const getMonthes = async () => {
    const res = await getAllMonthes();
    setMonthesArr(res.data);
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

  const deleteNoteById = async id => {
    try {
      setIsLoading(true);
      await deleteNote(id);
      message.success('日记删除成功');
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
    searchNotes();
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">日记列表与归档</h2>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">筛选:</span>

        <Select
          defaultValue=""
          style={{ width: 100 }}
          onChange={monthChange}
          size="middle"
          className="sm:w-32"
        >
          <Option value="">所有月份</Option>
          {monthes.map(i => (
            <Option key={i} value={i}>
              {i}
            </Option>
          ))}
        </Select>

        <Select
          defaultValue=""
          style={{ width: 100 }}
          size="middle"
          onChange={moodChange}
          placeholder="心情筛选"
          className="sm:w-32"
        >
          <Option value="">所有心情</Option>
          {moodOption.map(i => (
            <Option key={i} value={i}>
              {i}
            </Option>
          ))}
        </Select>

        <Input
          value={tagsValue}
          onChange={tagsChange}
          placeholder="标签筛选"
          prefix={<Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />}
          className="!w-28 sm:!w-48"
        />

        <Button type="primary" size="small" onClick={searchNotes} className="sm:!h-10">
          搜索
        </Button>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto pt-2 sm:pt-4 max-h-[65vh] sm:max-h-[75vh] overflow-y-auto px-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : notes.length > 0 ? (
          notes.map((note, index) => (
            <TimelineCard key={index} {...note} deleteNoteById={deleteNoteById} />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">暂无日记记录。</p>
        )}
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-10 text-sm">--- 已加载全部 ---</p>
      </div>
    </div>
  );
}

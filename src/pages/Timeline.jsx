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
  const tags = (tag || '').split(',').filter(Boolean);

  return (
    <div className="relative mb-6 sm:mb-8 pl-6 sm:pl-10">
      <div className="absolute left-0 top-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-indigo-500 border-4 border-indigo-200 dark:border-indigo-700 dark:bg-indigo-400" />
      <div className="absolute left-1 sm:left-1.5 top-5 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-700" />

      <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {formattedTime}
        <span className="ml-2 text-base sm:text-xl">心情:{MOOD_MAP[mood] || '❓'}</span>
      </p>

      <div className="mt-2 p-4 sm:p-6 group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-indigo-500">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2 break-words">
          {title}
        </h4>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 line-clamp-3 break-words">
          {content}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 items-center">
          {tags.map((i, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-white bg-gray-500 rounded-full dark:bg-gray-600"
            >
              {i}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <Link to={`/editor?id=${id}`} aria-label="编辑" className="tap-feedback">
              <PenLine className="w-5 h-5 text-gray-400 hover:text-indigo-500" />
            </Link>
            <button
              type="button"
              onClick={() => deleteNoteById(id)}
              aria-label="删除"
              className="tap-feedback"
            >
              <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
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
    try {
      const res = await getNotes();
      setNotes(res.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthes = async () => {
    try {
      const res = await getAllMonthes();
      setMonthesArr(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getMoods = async () => {
    try {
      const res = await getAllMoods();
      setMoodOption(res.moods || []);
    } catch (err) {
      console.error(err);
    }
  };

  const searchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await queryNote({
        month: monthValue,
        mood: moodValue,
        tag: tagsValue,
      });
      setNotes(res.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNoteById = async id => {
    try {
      setIsLoading(true);
      await deleteNote(id);
      message.success('日记删除成功');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
    searchNotes();
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">
        日记列表与归档
      </h2>

      {/* Filter bar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span>筛选:</span>
        </div>

        <Select
          value={monthValue}
          onChange={setMonthValue}
          size="middle"
          className="w-full sm:!w-32"
          placeholder="月份"
        >
          <Option value="">所有月份</Option>
          {monthes.map(i => (
            <Option key={i} value={i}>
              {i}
            </Option>
          ))}
        </Select>

        <Select
          value={moodValue}
          onChange={setMoodValue}
          size="middle"
          className="w-full sm:!w-32"
          placeholder="心情"
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
          onChange={e => setTagsValue(e.target.value)}
          placeholder="标签"
          prefix={<Tag className="w-4 h-4 text-gray-400" />}
          className="w-full sm:!w-40"
          allowClear
        />

        <Button
          type="primary"
          size="middle"
          onClick={searchNotes}
          className="col-span-2 sm:col-span-1"
        >
          搜索
        </Button>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto pt-2 sm:pt-4 smooth-scroll">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : notes.length > 0 ? (
          notes.map((note, index) => (
            <TimelineCard key={note.id || index} {...note} deleteNoteById={deleteNoteById} />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">暂无日记记录</p>
        )}
        {notes.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-10 text-sm">
            --- 已加载全部 ---
          </p>
        )}
      </div>
    </div>
  );
}

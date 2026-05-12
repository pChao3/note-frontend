import { useState, useEffect } from 'react';
import { Tag, Trash2, PenLine, Search, RotateCcw } from 'lucide-react';
import { Select, Input, Button, Spin, message } from 'antd';
import { getNotes, getAllMonthes, queryNote, deleteNote } from '../api/note';
import { Link } from 'react-router-dom';
import { MOOD_MAP } from '../components/config';
import dayjs from 'dayjs';

const { Option } = Select;

// Mood display map with emoji — keys match what the backend returns

const TimelineCard = ({ createTime, title, content, mood, tag, id, deleteNoteById }) => {
  const formattedTime = dayjs(createTime).fromNow();
  const exactTime = dayjs(createTime).format('YYYY年MM月DD日');
  const tags = (tag || '').split(',').filter(Boolean);

  return (
    <div className="relative mb-6 sm:mb-8 pl-8 sm:pl-12">
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-md shadow-indigo-200 dark:shadow-indigo-900 border-2 border-white dark:border-gray-900 z-10" />
      {/* Timeline line */}
      <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-transparent dark:from-indigo-700" />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs sm:text-sm font-semibold text-indigo-500 dark:text-indigo-400">{formattedTime}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">· {exactTime}</span>
        <span className="text-sm ml-auto">{MOOD_MAP[mood] || '❓'}</span>
      </div>

      <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-5 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700">
        <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-1.5 break-words">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 break-words leading-relaxed">
          {content}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3 items-center">
          {tags.map((t, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs font-medium text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30 rounded-full border border-indigo-100 dark:border-indigo-800"
            >
              #{t}
            </span>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <Link
              to={`/editor?id=${id}`}
              aria-label="编辑"
              className="tap-feedback p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <PenLine className="w-4 h-4 text-gray-400 hover:text-indigo-500" />
            </Link>
            <button
              type="button"
              onClick={() => deleteNoteById(id)}
              aria-label="删除"
              className="tap-feedback p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
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

  const [monthValue, setMonthValue] = useState(undefined);
  const [moodValue, setMoodValue] = useState(undefined);
  const [tagsValue, setTagsValue] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getData();
    getMonthes();
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

  const searchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await queryNote({
        month: monthValue || '',
        mood: moodValue || '',
        tag: tagsValue,
      });
      setNotes(res.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilter = () => {
    setMonthValue(undefined);
    setMoodValue(undefined);
    setTagsValue('');
    getData();
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

  const hasFilter = monthValue || moodValue || tagsValue;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">日记列表</h2>
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">共 {notes.length} 篇</span>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={monthValue}
            onChange={setMonthValue}
            size="middle"
            className="w-full sm:!w-36"
            placeholder="📅 选择月份"
            allowClear
          >
            {monthes.map(m => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Select>

          <Select
            value={moodValue}
            onChange={setMoodValue}
            size="middle"
            className="w-full sm:!w-36"
            placeholder="🙂 选择心情"
            allowClear
          >
            {Object.entries(MOOD_MAP)
              .filter(([k]) => k !== 'unknown')
              .map(([k, label]) => (
                <Option key={k} value={k}>{label}</Option>
              ))}
          </Select>

          <Input
            value={tagsValue}
            onChange={e => setTagsValue(e.target.value)}
            onPressEnter={searchNotes}
            placeholder="标签关键词"
            prefix={<Tag className="w-3.5 h-3.5 text-gray-400" />}
            className="w-full sm:!w-40"
            allowClear
          />

          <div className="flex gap-2 ml-auto">
            {hasFilter && (
              <Button
                size="middle"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={resetFilter}
                className="text-gray-500"
              >
                重置
              </Button>
            )}
            <Button
              type="primary"
              size="middle"
              icon={<Search className="w-3.5 h-3.5" />}
              onClick={searchNotes}
              className="bg-indigo-600 hover:bg-indigo-700 !border-none"
            >
              搜索
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto pt-1 sm:pt-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : notes.length > 0 ? (
          <>
            {notes.map((note, index) => (
              <TimelineCard key={note.id || index} {...note} deleteNoteById={deleteNoteById} />
            ))}
            <p className="text-center text-gray-300 dark:text-gray-600 mt-6 text-xs">
              ∙ ∙ ∙ 已加载全部 {notes.length} 篇 ∙ ∙ ∙
            </p>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <span className="text-5xl">{hasFilter ? '🔍' : '📖'}</span>
            <p className="mt-4 text-base font-medium">
              {hasFilter ? '没有找到符合条件的日记' : '暂无日记记录'}
            </p>
            <p className="text-sm mt-1 text-gray-400">
              {hasFilter ? '试试调整筛选条件' : '快去写下你的第一篇日记吧~'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

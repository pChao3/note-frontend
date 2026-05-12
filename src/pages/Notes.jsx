import { useState, useEffect, useMemo } from 'react';
import { getNotes, addNote, deleteNote, makePoint } from '../api/index';
import { message, Input, Button, Spin } from 'antd';
import { Star, StarOff, Trash2, Filter, List } from 'lucide-react';

const MODE_ALL = 'all';
const MODE_IMPORTANT = 'important';

export default function Note() {
  const [list, setList] = useState([]);
  const [contentValue, setContentValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState(MODE_ALL);

  const getAllNotes = async () => {
    setLoading(true);
    try {
      const { data } = await getNotes();
      setList(data || []);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!contentValue.trim()) {
      message.warning('请输入内容');
      return;
    }
    try {
      const res = await addNote({ content: contentValue.trim() });
      if (res.isSaved) {
        message.success('添加成功');
        setContentValue('');
        getAllNotes();
      }
    } catch {
      message.error('保存失败');
    }
  };

  const toggleImportant = async id => {
    try {
      const res = await makePoint(id);
      if (res.status) {
        message.success(res.msg || '操作成功');
        getAllNotes();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async id => {
    try {
      const res = await deleteNote(id);
      if (res.isDeleted) {
        message.success('删除成功');
        getAllNotes();
      }
    } catch {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    getAllNotes();
  }, []);

  const filteredList = useMemo(
    () => (filterMode === MODE_IMPORTANT ? list.filter(item => item.important) : list),
    [list, filterMode]
  );

  const toggleFilterMode = () =>
    setFilterMode(prev => (prev === MODE_ALL ? MODE_IMPORTANT : MODE_ALL));

  const filterButtonProps =
    filterMode === MODE_ALL
      ? {
          text: '只看重要',
          Icon: Filter,
          className: 'hover:bg-yellow-100 border-yellow-400 text-yellow-600',
        }
      : {
          text: '显示全部',
          Icon: List,
          className: 'bg-yellow-400 text-white hover:bg-yellow-500 border-yellow-400',
        };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-6 sm:mb-10 tracking-tight">
          我的笔记小册
        </h1>

        {/* Add area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Input
              placeholder="今天想记点什么?"
              value={contentValue}
              onChange={e => setContentValue(e.target.value)}
              onPressEnter={saveNote}
              className="flex-1"
              size="large"
            />
            <Button
              type="primary"
              size="large"
              onClick={saveNote}
              className="px-6 sm:px-8 font-medium bg-gradient-to-r from-purple-600 to-pink-600 border-0"
            >
              保存
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
            {filterMode === MODE_ALL
              ? `全部笔记 (${list.length})`
              : `重要笔记 (${filteredList.length} / ${list.length})`}
          </p>
          <Button
            size="middle"
            onClick={toggleFilterMode}
            icon={<filterButtonProps.Icon className="w-4 h-4 mr-1" />}
            className={`flex items-center justify-center border ${filterButtonProps.className}`}
          >
            {filterButtonProps.text}
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-gray-300 dark:text-gray-600 mb-4">
              {filterMode === MODE_IMPORTANT ? (
                <Star className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" />
              ) : (
                <span className="text-5xl sm:text-6xl">📒</span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              {filterMode === MODE_IMPORTANT
                ? '没有标记为重要的笔记'
                : '还没有笔记,快来创建第一条吧~'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredList.map(item => (
              <div
                key={item.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 border-l-8 ${
                  item.important
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-base sm:text-lg text-gray-800 dark:text-gray-100 pr-2 sm:pr-24 break-words leading-relaxed">
                  {item.content}
                </p>

                {/* Actions: always visible on mobile, hover-reveal on desktop */}
                <div className="mt-3 sm:mt-0 flex gap-2 sm:absolute sm:top-4 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
                  <button
                    type="button"
                    onClick={() => toggleImportant(item.id)}
                    aria-label={item.important ? '取消重要' : '标记重要'}
                    className="tap-feedback p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {item.important ? (
                      <StarOff className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="删除"
                    className="tap-feedback p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                {item.important && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-white px-3 py-0.5 sm:px-4 sm:py-1 rounded-bl-2xl rounded-tr-2xl text-xs sm:text-sm font-bold shadow">
                    重要
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

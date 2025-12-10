import { useState, useEffect, useMemo } from 'react'; // 引入 useMemo
import { getNotes, addNote, deleteNote, makePoint } from '../api/index';
import { message, Input, Button, Spin } from 'antd';
import { Star, StarOff, Trash2, Filter, List } from 'lucide-react'; // 引入 List 和 Filter 图标

// 定义筛选模式常量
const MODE_ALL = 'all';
const MODE_IMPORTANT = 'important';

export default function Note() {
  const [list, setList] = useState([]);
  const [contentValue, setContentValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState(MODE_ALL); // 新增状态：筛选模式，默认为'all'

  // --- API/数据操作函数保持不变 ---

  const getAllNotes = async () => {
    setLoading(true);
    try {
      const { data } = await getNotes();
      setList(data || []);
    } catch (err) {
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
      if (res.data.isSaved) {
        message.success('添加成功');
        setContentValue('');
        getAllNotes();
      }
    } catch (err) {
      message.error('保存失败');
    }
  };

  const toggleImportant = async id => {
    try {
      const res = await makePoint(id);
      if (res.data.status) {
        message.success(res.data.msg || '操作成功');
        getAllNotes();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async id => {
    try {
      const res = await deleteNote(id);
      if (res.data.isDeleted) {
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

  // --- 新增：根据筛选模式过滤列表 ---
  const filteredList = useMemo(() => {
    if (filterMode === MODE_IMPORTANT) {
      return list.filter(item => item.important);
    }
    return list;
  }, [list, filterMode]);

  // --- 新增：切换筛选模式的函数 ---
  const toggleFilterMode = () => {
    setFilterMode(prevMode => (prevMode === MODE_ALL ? MODE_IMPORTANT : MODE_ALL));
  };

  // 确定筛选按钮的显示文本和图标
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10 tracking-tight">
          我的笔记小册
        </h1>

        {/* 添加区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex gap-3">
            <Input
              placeholder="今天想记点什么？"
              value={contentValue}
              onChange={e => setContentValue(e.target.value)}
              onPressEnter={saveNote}
              className="flex-1 text-lg"
              size="large"
            />
            <Button
              type="primary"
              size="large"
              onClick={saveNote}
              className="px-8 font-medium bg-gradient-to-r from-purple-600 to-pink-600 border-0"
            >
              保存
            </Button>
          </div>
        </div>

        {/* 列表工具栏：新增筛选按钮 */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-semibold text-gray-700">
            {filterMode === MODE_ALL
              ? `全部笔记 (${list.length})`
              : `重要笔记 (${filteredList.length} / ${list.length})`}
          </p>
          <Button
            size="large"
            onClick={toggleFilterMode}
            icon={<filterButtonProps.Icon className="w-5 h-5 mr-1" />}
            className={`flex items-center justify-center border ${filterButtonProps.className}`}
          >
            {filterButtonProps.text}
          </Button>
        </div>

        {/* 笔记列表 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredList.length === 0 ? ( // 列表为空时的提示需要根据筛选模式调整
          <div className="text-center py-20">
            <div className="text-6xl mb-4 text-gray-300">
              {filterMode === MODE_IMPORTANT ? (
                <Star className="w-16 h-16 mx-auto" />
              ) : (
                'Empty Notebook'
              )}
            </div>
            <p className="text-gray-500 text-lg">
              {filterMode === MODE_IMPORTANT
                ? '没有标记为重要的笔记。'
                : '还没有笔记，快来创建第一条吧～'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map(
              (
                item // **注意：使用 filteredList**
              ) => (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-8 ${
                    item.important ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-lg text-gray-800 pr-24 break-words">{item.content}</p>

                  {/* 操作按钮 */}
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleImportant(item.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={item.important ? '取消重要' : '标记重要'}
                    >
                      {item.important ? (
                        <StarOff className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  {/* 重要标记角标 */}
                  {item.important && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-white px-4 py-1 rounded-bl-2xl rounded-tr-2xl text-sm font-bold shadow">
                      重要
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

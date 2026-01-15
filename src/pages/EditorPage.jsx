import { useEffect, useState } from 'react';
import { Input, Button, DatePicker, Select, message, Spin } from 'antd';
import { Save, Calendar, Sun, Heart, Tag } from 'lucide-react';
import dayjs from 'dayjs';

import { addNote, searchNote } from '../api/note';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(dayjs());
  const [weather, setWeather] = useState('sunny');
  const [mood, setMood] = useState('happy');
  const [tag, setTag] = useState('');
  const [content, setContent] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      initData(id);
    }
  }, []);

  const initData = async id => {
    try {
      setLoading(true);
      const res = await searchNote(id);
      const data = res.data[0];
      setTitle(data.title);
      setTime(dayjs(data.createTime));
      setWeather(data.weather);
      setMood(data.mood);
      setTag(data.tag);
      setContent(data.content);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!title || !content) {
      message.error('标题和内容不能为空！');
      return;
    }

    setIsSaving(true);
    // 模拟后端保存 API 调用
    const params = {
      title,
      weather,
      mood,
      tag,
      content,
      createTime: time,
    };
    console.log(params);
    try {
      await addNote(params);
      navigator('/dashboard');
      message.success('日记已自动保存为草稿！');
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900  flex flex-col relative">
      <Spin spinning={loading}>
        {/* 顶部工具栏 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-wrap items-center gap-4 mb-6">
          {/* 日期选择器 */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <DatePicker
              defaultValue={dayjs()}
              size="large"
              value={time}
              onChange={e => setTime(e)}
            />
          </div>

          {/* 天气选择 */}
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <Select
              defaultValue="sunny"
              style={{ width: 120 }}
              size="large"
              placeholder="天气"
              value={weather}
              onChange={e => setWeather(e)}
            >
              <Option value="sunny">晴天</Option>
              <Option value="rainy">雨天</Option>
            </Select>
          </div>

          {/* 心情选择 */}
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <Select
              defaultValue="happy"
              style={{ width: 120 }}
              size="large"
              placeholder="心情"
              value={mood}
              onChange={e => setMood(e)}
            >
              <Option value="happy">开心 😄</Option>
              <Option value="calm">平静 😌</Option>
            </Select>
          </div>

          {/* 标签输入 */}
          <div className="flex items-center space-x-2 flex-1 min-w-[200px] justify-end">
            <Tag className="w-5 h-5 text-green-500" />
            <Input
              placeholder="输入标签 (逗号分隔)"
              size="large"
              className="w-full"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </div>
        </div>

        {/* 标题输入 */}
        <Input
          placeholder="输入标题"
          value={title}
          onChange={e => setTitle(e.target.value)}
          size="large"
          className="!text-3xl font-extrabold mb-4 p-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          bordered={false}
        />

        {/* 正文编辑器区域 (使用 AntD TextArea 模拟) */}
        <TextArea
          placeholder="记录你的每一个当下..."
          value={content}
          onChange={e => setContent(e.target.value)}
          autoSize={{ minRows: 15 }}
          className="flex-1 text-lg  leading-relaxed p-6 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          bordered={false}
        />

        {/* 底部保存按钮和状态 */}
        <div className=" ">
          <div className="mt-6  flex justify-between items-center ">
            <span
              className={`text-sm font-medium ${isSaving ? 'text-yellow-600' : 'text-green-600'}`}
            >
              {isSaving ? '正在自动保存...' : '草稿已保存'}
            </span>
            <Button
              type="primary"
              icon={<Save className="w-5 h-5 mr-1" />}
              size="large"
              onClick={handleSave}
              loading={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 !border-none font-semibold"
            >
              {isSaving ? '保存中' : '完成并保存'}
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

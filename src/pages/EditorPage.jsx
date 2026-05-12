import { useEffect, useState } from 'react';
import { Input, Button, DatePicker, Select, message, Spin } from 'antd';
import { Save, Calendar, Sun, Heart, Tag } from 'lucide-react';
import dayjs from 'dayjs';

import { addNote, searchNote, changeNote } from '../api/note';
import { useNavigate, useSearchParams } from 'react-router-dom';

import VoiceInputButton from '../components/VoiceInput';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      message.error('标题和内容不能为空!');
      return;
    }

    setIsSaving(true);
    const params = { title, weather, mood, tag, content, createTime: time };
    try {
      const id = searchParams.get('id');
      if (id) {
        await changeNote(id, params);
      } else {
        await addNote(params);
      }
      navigator('/dashboard');
      message.success('日记已保存!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const onSend = data => {
    // Append to existing content instead of overwriting, so repeated voice
    // inputs accumulate. Fall back to direct overwrite if data is empty.
    if (data?.title) setTitle(prev => prev || data.title);
    if (data?.mood) setMood(data.mood);
    if (data?.tag) setTag(prev => (prev ? `${prev},${data.tag}` : data.tag));
    if (data?.content) setContent(prev => (prev ? `${prev}\n${data.content}` : data.content));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex flex-col relative min-h-[calc(100vh-8rem)]">
      <Spin spinning={loading}>
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            <DatePicker
              value={time}
              onChange={e => setTime(e)}
              size="middle"
              className="w-32 sm:w-auto"
            />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <Select
              value={weather}
              onChange={e => setWeather(e)}
              size="middle"
              style={{ width: 96 }}
              placeholder="天气"
            >
              <Option value="sunny">晴天</Option>
              <Option value="rainy">雨天</Option>
              <Option value="cloudy">多云</Option>
              <Option value="snowy">下雪</Option>
            </Select>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <Select
              value={mood}
              onChange={e => setMood(e)}
              size="middle"
              style={{ width: 108 }}
              placeholder="心情"
            >
              <Option value="happy">开心 😄</Option>
              <Option value="calm">平静 😌</Option>
              <Option value="sad">难过 😢</Option>
              <Option value="angry">生气 😠</Option>
            </Select>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-[140px]">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <Input
              placeholder="标签 (逗号分隔)"
              size="middle"
              className="flex-1"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </div>
        </div>

        {/* Title */}
        <Input
          placeholder="输入标题"
          value={title}
          onChange={e => setTitle(e.target.value)}
          size="large"
          className="!text-xl sm:!text-3xl font-extrabold mb-3 sm:mb-4 p-2 sm:p-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          variant="borderless"
        />

        {/* Content */}
        <TextArea
          placeholder="记录你的每一个当下..."
          value={content}
          onChange={e => setContent(e.target.value)}
          autoSize={{ minRows: 10 }}
          className="flex-1 text-base sm:text-lg leading-relaxed p-4 sm:p-6 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          variant="borderless"
        />

        {/* Bottom actions */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span
            className={`text-xs sm:text-sm font-medium ${
              isSaving ? 'text-yellow-600' : 'text-green-600'
            }`}
          >
            {isSaving ? '正在保存...' : '草稿已保存'}
          </span>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <VoiceInputButton onSend={onSend} setPageStatus={e => setLoading(e)} />
            <Button
              type="primary"
              icon={<Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />}
              size="middle"
              onClick={handleSave}
              loading={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 !border-none font-semibold"
            >
              {isSaving ? '保存中' : '保存'}
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

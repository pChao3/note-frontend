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

  const onClear = () => {
    setTitle('');
    setMood('happy');
    setTag('');
    setContent('');
  };

  const onSend = data => {
    if (data?.title) setTitle(data.title);
    if (data?.mood) setMood(data.mood);
    if (data?.tag) setTag(data.tag);
    if (data?.content) setContent(data.content);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex flex-col relative min-h-[calc(100vh-8rem)]">
      <Spin spinning={loading}>
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <DatePicker
              value={time}
              onChange={e => setTime(e)}
              size="small"
              variant="borderless"
              className="w-28 sm:w-auto !bg-transparent"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl px-2.5 py-1.5">
            <Sun className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <Select
              value={weather}
              onChange={e => setWeather(e)}
              size="small"
              variant="borderless"
              style={{ width: 80 }}
              placeholder="天气"
            >
              <Option value="sunny">晴天</Option>
              <Option value="rainy">雨天</Option>
              <Option value="cloudy">多云</Option>
              <Option value="snowy">下雪</Option>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl px-2.5 py-1.5">
            <Heart className="w-4 h-4 text-red-400 flex-shrink-0" />
            <Select
              value={mood}
              onChange={e => setMood(e)}
              size="small"
              variant="borderless"
              style={{ width: 100 }}
              placeholder="心情"
            >
              <Option value="happy">开心 😄</Option>
              <Option value="calm">平静 😌</Option>
              <Option value="sad">难过 😢</Option>
              <Option value="angry">生气 😠</Option>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl px-2.5 py-1.5 flex-1 min-w-[130px]">
            <Tag className="w-4 h-4 text-green-500 flex-shrink-0" />
            <Input
              placeholder="标签 (逗号分隔)"
              size="small"
              variant="borderless"
              className="flex-1 !bg-transparent"
              value={tag}
              onChange={e => setTag(e.target.value)}
            />
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-4 sm:mb-5">
          {/* Title */}
          <div className="border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 pt-4 pb-2">
            <Input
              placeholder="输入标题..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              size="large"
              className="!text-xl sm:!text-2xl font-extrabold !bg-transparent dark:!text-white dark:!placeholder-gray-500"
              variant="borderless"
            />
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-3">
            <TextArea
              placeholder="记录你的每一个当下..."
              value={content}
              onChange={e => setContent(e.target.value)}
              autoSize={{ minRows: 12 }}
              className="flex-1 text-base sm:text-lg leading-relaxed !bg-transparent dark:!text-gray-100 dark:!placeholder-gray-500"
              variant="borderless"
            />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span
            className={`text-xs sm:text-sm font-medium flex items-center gap-1.5 ${
              isSaving ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            {isSaving ? '正在保存...' : '草稿已保存'}
          </span>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <VoiceInputButton onSend={onSend} onClear={onClear} setPageStatus={e => setLoading(e)} />
            <Button
              type="primary"
              icon={<Save className="w-4 h-4 mr-1" />}
              size="middle"
              onClick={handleSave}
              loading={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 !border-none font-semibold shadow-md shadow-indigo-200 dark:shadow-none"
            >
              {isSaving ? '保存中' : '保存'}
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Moon,
  Sun,
  Download,
  ShieldCheck,
  Camera,
  ChevronRight,
  LogOut,
  Loader2,
} from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import { useAuthStore } from '../store/authStore';
import { setUserInfo, uploadAvatar, getNotes, getUserInfo } from '../api/note'; // 假设你补充了 uploadAvatar API
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [nickName, setNickname] = useState('user');
  const [avatar, setAvatar] = useState('');

  const logout = useAuthStore(state => state.logout);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  useEffect(() => {
    getUser();
  }, []);
  const getUser = async () => {
    const res = await getUserInfo();
    const { nickName, profile } = res.userInfo;
    setAvatar(profile);
    setNickname(nickName);
  };

  // 处理头像上传
  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    // 限制大小 2MB
    if (file.size > 2 * 1024 * 1024) {
      return message.error('图片不能超过 2MB');
    }
    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploading(true);
    try {
      const res = await uploadAvatar(formData);
      if (res.status === 'ok') {
        setAvatar(res.url);
        message.success('头像上传成功');
      }
    } catch (error) {
      console.log(error);
      message.error('头像上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 保存个人资料（昵称）
  const saveUserInfo = async () => {
    if (!nickName) return message.warning('昵称不能为空');
    setIsSaving(true);
    try {
      const res = await setUserInfo({ nickName: nickName });
      if (res.status === 'ok') {
        message.success('资料更新成功！');
      }
    } catch (error) {
      message.error('更新失败');
    } finally {
      setIsSaving(false);
    }
  };

  const goLogout = () => {
    logout();
    message.success('已安全退出');
    navigate('/login');
  };

  // 模拟数据导出
  const handleExportData = async () => {
    try {
      const res = await getNotes();
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `diary-backup-${new Date().toLocaleDateString()}.json`;
      link.click();
    } catch (error) {
      message.error('导出失败');
    }
  };

  const nameChange = e => {
    // e => setNickname(e.target.value)
    console.log('e', e);
    setNickname(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">设置</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">管理你的个人偏好与数据安全</p>
      </header>

      {/* 个人资料部分 */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-indigo-500" /> 个人资料
        </h3>

        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
          {/* 头像上传区 */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-indigo-50 flex items-center justify-center">
              {avatar ? (
                <img
                  src={`http://localhost:3000${avatar}`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-indigo-200" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* 昵称修改区 */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                显示昵称
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nickName}
                  onChange={nameChange}
                  placeholder="输入你的昵称..."
                  className="flex-1 bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={saveUserInfo}
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 偏好设置部分 */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2 text-green-500" /> 应用偏好
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? (
              <Moon className="text-yellow-400" />
            ) : (
              <Sun className="text-orange-500" />
            )}
            <div>
              <p className="font-medium text-gray-800 dark:text-white">外观模式</p>
              <p className="text-xs text-gray-500">
                {theme === 'dark' ? '已开启深色模式' : '已开启亮色模式'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* 数据安全与退出 */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleExportData}
          className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
              <Download className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800 dark:text-white">备份数据</p>
              <p className="text-sm text-gray-500">将所有日记下载为 JSON 文件</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={goLogout}
          className="flex items-center justify-center space-x-2 p-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-3xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>退出当前账号</span>
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 py-4 italic">
        MyDiary Version 1.0.0 • 记录生活中的点滴
      </div>
    </div>
  );
}

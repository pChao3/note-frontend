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
import { url } from '../api/index';
import { setUserInfo, uploadAvatar, getNotes, getUserInfo } from '../api/note';
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
    try {
      const res = await getUserInfo();
      const { nickName, profile } = res.userInfo;
      setAvatar(profile);
      setNickname(nickName);
    } catch {
      message.error('获取用户信息失败');
    }
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
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
    } catch {
      console.error('头像上传失败');
      message.error('头像上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const saveUserInfo = async () => {
    if (!nickName) return message.warning('昵称不能为空');
    setIsSaving(true);
    try {
      const res = await setUserInfo({ nickName: nickName });
      if (res.status === 'ok') {
        message.success('资料更新成功！');
      }
    } catch {
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

  const handleExportData = async () => {
    try {
      const res = await getNotes();
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `diary-backup-${new Date().toLocaleDateString()}.json`;
      link.click();
    } catch {
      message.error('导出失败');
    }
  };

  const nameChange = e => {
    setNickname(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 sm:pb-20 space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">设置</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          管理你的个人偏好与数据安全
        </p>
      </header>

      {/* Profile section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> 个人资料
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              {avatar ? (
                <img src={`${url}${avatar}`} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
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
              className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 rounded-xl text-white shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Nickname */}
          <div className="flex-1 w-full space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              显示昵称
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickName}
                onChange={nameChange}
                placeholder="输入你的昵称..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 sm:px-4 py-2.5 text-sm sm:text-base text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
              />
              <button
                onClick={saveUserInfo}
                disabled={isSaving}
                className="bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" /> 应用偏好
        </h3>

        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-orange-100'}`}>
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-500" />
              ) : (
                <Sun className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">外观模式</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {theme === 'dark' ? '深色模式已开启' : '亮色模式已开启'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* Data & Logout */}
      <div className="space-y-3">
        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-between p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">备份数据</p>
              <p className="text-xs text-gray-400 mt-0.5">将所有日记下载为 JSON 文件</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
        </button>

        <button
          onClick={goLogout}
          className="w-full flex items-center justify-center gap-2 p-4 sm:p-5 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 font-semibold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/30"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">退出当前账号</span>
        </button>
      </div>

      <div className="text-center text-xs text-gray-300 dark:text-gray-600 py-2 italic">
        MyDiary Version 1.0.0 · 记录生活中的点滴
      </div>
    </div>
  );
}

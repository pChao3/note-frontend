import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { LockOutlined, MailOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';

import Illustration from '../assets/login.svg';
import { goLogin, goRegistry } from '../api/login';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setLogin = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const onLoginFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await goLogin({ email, password });
      if (res.data) {
        message.success('登录成功!');
        setLogin(res.token);
        navigate('/dashboard');
      } else {
        message.info('请先注册账号再进行登录');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async ({ password, email }) => {
    setLoading(true);
    try {
      await goRegistry({ password, email });
      message.success('注册成功!请登录');
      setIsLogin(true);
    } catch (error) {
      message.error(error?.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const handleThirdPartyLogin = platform => {
    message.info(`即将跳转到 ${platform} 登录...`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 safe-pt safe-pb">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl flex overflow-hidden flex-col md:flex-row">
        {/* Left: illustration (desktop) */}
        <div className="hidden md:flex md:w-1/2 p-6 lg:p-8 flex-col justify-center items-center text-center bg-gradient-to-tl from-purple-500 to-indigo-500 text-white relative">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#FFFFFF"
                d="M49.2,-57.1C65,-39.8,78.2,-19.9,78.4,0.1C78.6,20,65.9,40,49.2,56.5C32.4,73.1,16.2,86.2,-2.1,88.4C-20.5,90.6,-41,81.9,-54.6,66.7C-68.2,51.5,-74.8,29.8,-74.6,7.8C-74.4,-14.3,-67.2,-36.7,-53.4,-54.2C-39.5,-71.7,-19.8,-84.3,2.4,-85.4C24.5,-86.5,49,-76.1,49.2,-57.1Z"
                transform="translate(100 100) scale(1.1)"
              />
            </svg>
          </div>
          <img
            src={Illustration}
            alt="Welcome"
            className="w-3/4 max-w-xs mb-4 lg:mb-6 relative z-10"
          />
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-3 lg:mb-4 leading-tight relative z-10">
            记录每一个当下
          </h2>
          <p className="text-base lg:text-xl font-light opacity-80 relative z-10">
            捕捉灵感,规划生活,让每一个瞬间都有迹可循
          </p>
        </div>

        {/* Right: form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
          <div className="md:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-3">
              <span className="text-white text-xl font-bold">N</span>
            </div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">Notes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">记录每一个当下</p>
          </div>

          <div className="mb-6 lg:mb-8 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
              {isLogin ? '欢迎回来 👋' : '创建账号 🎉'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? '登录以继续记录你的生活' : '加入我们，开始记录美好时光'}
            </p>
          </div>

          <Form
            name={isLogin ? 'login' : 'register'}
            initialValues={{ remember: true }}
            onFinish={isLogin ? onLoginFinish : onRegisterFinish}
            autoComplete="off"
            layout="vertical"
            className="w-full"
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '邮箱格式不正确!' },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="您的邮箱"
                inputMode="email"
                autoComplete="email"
              />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="您的密码"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </Form.Item>
            {!isLogin && (
              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: '请确认密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                />
              </Form.Item>
            )}
            {isLogin && (
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox className="text-gray-600 dark:text-gray-300">记住我</Checkbox>
              </Form.Item>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full !h-11 sm:!h-12 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 !border-none rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                {isLogin ? '登录' : '注册'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4 sm:mt-5 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {isLogin ? '还没有账号?' : '已有账号?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold ml-1.5 transition-colors underline-offset-2 hover:underline"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>

          <div className="flex items-center my-5 sm:my-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
            <span className="flex-shrink mx-3 sm:mx-4 text-gray-400 text-xs sm:text-sm font-medium">或使用第三方登录</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
          </div>

          <div className="flex justify-center gap-3 sm:gap-4">
            <Button
              icon={<GoogleOutlined />}
              onClick={() => handleThirdPartyLogin('Google')}
              className="flex items-center justify-center !w-14 sm:!w-16 !h-10 sm:!h-12 !rounded-xl text-base sm:text-lg hover:!border-red-400 hover:!text-red-500 transition-colors"
            />
            <Button
              icon={<GithubOutlined />}
              onClick={() => handleThirdPartyLogin('GitHub')}
              className="flex items-center justify-center !w-14 sm:!w-16 !h-10 sm:!h-12 !rounded-xl text-base sm:text-lg hover:!border-gray-600 hover:!text-gray-800 dark:hover:!text-white transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

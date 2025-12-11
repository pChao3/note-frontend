import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import Illustration from '../assets/login.svg'; // 假设你有一个SVG插画文件
// 你可以在UnDraw (https://undraw.co/illustrations) 找到很多免费的插画。

import { goLogin, goRegistry } from '../api/login';
import { useNavigate } from 'react-router-dom';
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // 登录表单提交处理
  const onLoginFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await goLogin({ email, password });
      console.log('res', res);
      if (res.data) {
        message.success('登录成功！');
        localStorage.setItem('token', res.token);
        navigate('/notes');
      } else {
        message.info('请先注册帐号再进行登录！');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // 注册表单提交处理
  const onRegisterFinish = async ({ password, email }) => {
    setLoading(true);
    try {
      await goRegistry({ password, email });
      message.success('注册成功！请登录。');
      setIsLogin(true); // 注册成功后自动切换到登录页面
    } catch (error) {
      message.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // 第三方登录处理
  const handleThirdPartyLogin = platform => {
    message.info(`即将跳转到 ${platform} 登录...`);
    // 实际项目中这里会进行OAuth跳转
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl flex overflow-hidden flex-col md:flex-row">
        {/* 左侧：插画和Slogan */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center items-center text-center bg-gradient-to-tl from-purple-500 to-indigo-500 text-white relative">
          {/* 背景装饰：柔和的圆形或抽象形状 */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#FFFFFF"
                d="M49.2,-57.1C65,-39.8,78.2,-19.9,78.4,0.1C78.6,20,65.9,40,49.2,56.5C32.4,73.1,16.2,86.2,-2.1,88.4C-20.5,90.6,-41,81.9,-54.6,66.7C-68.2,51.5,-74.8,29.8,-74.6,7.8C-74.4,-14.3,-67.2,-36.7,-53.4,-54.2C-39.5,-71.7,-19.8,-84.3,2.4,-85.4C24.5,-86.5,49,-76.1,49.2,-57.1Z"
                transform="translate(100 100) scale(1.1)"
              />
            </svg>
          </div>
          <img src={Illustration} alt="Welcome" className="w-3/4 max-w-xs mb-6 relative z-10" />
          <h2 className="text-5xl font-extrabold mb-4 leading-tight relative z-10">
            记录每一个当下
          </h2>
          <p className="text-xl font-light opacity-80 relative z-10">
            捕捉灵感，规划生活，让每一个瞬间都有迹可循。
          </p>
        </div>

        {/* 右侧：登录/注册表单 */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center relative">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? '欢迎回来' : '立即注册'}
          </h3>

          {/* 表单 */}
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
                prefix={<MailOutlined className="site-form-item-icon text-gray-400" />}
                placeholder="您的邮箱"
              />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
                placeholder="您的密码"
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
                  prefix={<LockOutlined className="site-form-item-icon text-gray-400" />}
                  placeholder="请再次输入密码"
                />
              </Form.Item>
            )}
            {isLogin && (
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox className="text-gray-600">记住我</Checkbox>
              </Form.Item>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full !h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 !border-none rounded-lg shadow-md"
              >
                {isLogin ? '登录' : '注册'}
              </Button>
            </Form.Item>
          </Form>

          {/* 切换登录/注册模式 */}
          <div className="text-center mt-6 text-gray-600">
            {isLogin ? '没有账号？' : '已有账号？'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 transition-colors"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>

          {/* 分割线 */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">或</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* 第三方登录 */}
          <div className="flex justify-center gap-4">
            <Button
              icon={<GoogleOutlined />}
              onClick={() => handleThirdPartyLogin('Google')}
              className="flex items-center justify-center !w-16 !h-12 !rounded-lg text-lg text-gray-700 hover:text-red-500 !border-gray-300 hover:!border-red-300 transition-all"
            />
            <Button
              icon={<GithubOutlined />}
              onClick={() => handleThirdPartyLogin('GitHub')}
              className="flex items-center justify-center !w-16 !h-12 !rounded-lg text-lg text-gray-700 hover:text-gray-800 !border-gray-300 hover:!border-gray-500 transition-all"
            />
            {/* 可以添加更多第三方登录，例如 Twitter, Facebook 等 */}
          </div>
        </div>
      </div>
    </div>
  );
}

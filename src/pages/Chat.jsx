import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User2, Square, MessageSquareText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 支持表格、任务列表等GitHub Flavored Markdown

import { getAnswer, fetchAnswer } from '../api/chat';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [curMessage, setCurMessage] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const controllerRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // console.log('message', messages);
  }, [messages, curMessage]);

  const stopStream = () => {
    console.log('hhh');
    controllerRef.current.abort();
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    controllerRef.current = new AbortController();

    const userMessage = { id: Date.now(), content: input, role: 'user' };

    const allMsgs = [...messages, userMessage];
    setMessages(allMsgs);
    setInput('');
    setIsLoading(true);

    let streamEnded = false;

    let assistantContent = '';

    try {
      const res = await fetchAnswer(
        {
          signal: controllerRef.current.signal,
        },
        allMsgs
      );
      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              streamEnded = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.content ?? '';
              assistantContent += content;
              // 更新用于实时渲染的 state
              setCurMessage(prev => prev + content);
            } catch (e) {
              console.error('解析错误', e);
            }
          }
        }

        if (streamEnded) break;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('用户中止');
      } else {
        console.error(error);
      }
    } finally {
      if (assistantContent) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), content: assistantContent, role: 'assistant' },
        ]);
      }
      // 清空临时展示内容并结束加载态
      setCurMessage('');
      setIsLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Shift+Enter 换行，Enter 发送
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* 顶部标题 */}
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <MessageSquareText className="w-6 h-6 mr-3 text-indigo-500" />
        <h2 className="text-xl font-semibold">聊天机器人</h2>
      </header>

      {/* 聊天记录区域 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 text-center px-4">
            <Bot className="w-16 h-16 text-indigo-400 mb-4" />
            <p className="text-lg font-medium">开始与 AI 聊天吧！</p>
            <p className="text-sm mt-1">输入你的问题，AI 会尽力回答。</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start max-w-[70%] p-3 rounded-xl shadow-md space-x-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600'
              }`}
            >
              {msg.role === 'assistant' && (
                <Bot className="w-6 h-6 flex-shrink-0 text-indigo-400 mt-0.5" />
              )}
              <div className="prose text-left dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:p-2 overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === 'user' && (
                <User2 className="w-6 h-6 flex-shrink-0 text-indigo-200 mt-0.5" />
              )}
            </div>
          </div>
        ))}

        {/* 实时流式渲染的助手内容，样式与历史消息保持一致 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[70%] p-3 rounded-xl shadow-md space-x-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600">
              {/* <Bot className="w-6 h-6 flex-shrink-0 text-indigo-400 mt-0.5 animate-pulse" /> */}
              <Loader2 className="w-6 h-6 flex-shrink-0 text-indigo-400 mt-0.5 animate-spin" />
              <div className="prose text-left dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:p-2 overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{curMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3 max-w-2xl mx-auto">
          <textarea
            className="flex-1  resize-none bg-gray-100 dark:bg-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isLoading ? 'AI 正在回复...' : '请输入你的消息...'}
            disabled={isLoading}
            style={{ maxHeight: '150px' }} // 限制最大高度，避免无限增长
          />
          <button
            onClick={isLoading ? stopStream : handleSend}
            className="p-3 !ml-8 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            {isLoading ? <Square className="w-5 h-5 " /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

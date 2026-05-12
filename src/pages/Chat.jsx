import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User2, Square, MessageSquareText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { fetchAnswer } from '../api/chat';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [curMessage, setCurMessage] = useState('');
  const [input, setInput] = useState('');
  const [ragmode, setMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, curMessage]);

  useEffect(() => {
    setCurMessage('');
    setMessages([]);
  }, [ragmode]);

  const stopStream = () => {
    controllerRef.current?.abort();
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
        { signal: controllerRef.current.signal },
        allMsgs,
        ragmode
      );
      if (!res.body) throw new Error('No response body');

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
              setCurMessage(prev => prev + content);
            } catch (err) {
              console.error('解析错误', err);
            }
          }
        }
        if (streamEnded) break;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('用户中止');
      } else {
        console.error(err);
      }
    } finally {
      if (assistantContent) {
        setMessages(prev => [
          ...prev,
          { id: Date.now(), content: assistantContent, role: 'assistant' },
        ]);
      }
      setCurMessage('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = e => {
    // Mobile soft keyboards should not send on Enter — only on desktop
    if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(min-width: 640px)').matches) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] lg:h-[calc(100dvh-4rem)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white -m-4 sm:-m-6 lg:-m-8">
      {/* Header */}
      <header className="flex items-center p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
        <MessageSquareText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-500" />
        <h2 className="text-base sm:text-xl font-semibold">聊天机器人</h2>
        <label className="ml-auto flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ragmode}
            onChange={e => setMode(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600 dark:text-gray-300">RAG</span>
        </label>
      </header>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 smooth-scroll"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 text-center px-4">
            <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 mb-4" />
            <p className="text-base sm:text-lg font-medium">开始与 AI 聊天吧!</p>
            <p className="text-xs sm:text-sm mt-1">输入你的问题,AI 会尽力回答</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-xl shadow-md space-x-2 sm:space-x-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600'
              }`}
            >
              {msg.role === 'assistant' && (
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-indigo-400 mt-0.5" />
              )}
              <div className="prose text-left dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:p-2 overflow-x-auto text-sm sm:text-base break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === 'user' && (
                <User2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-indigo-200 mt-0.5" />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[85%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-xl shadow-md space-x-2 sm:space-x-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-indigo-400 mt-0.5 animate-spin" />
              <div className="prose text-left dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:p-2 overflow-x-auto text-sm sm:text-base break-words min-h-[1.5em]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {curMessage || ' '}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 safe-pb">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            className="flex-1 resize-none bg-gray-100 dark:bg-gray-700 rounded-xl p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'AI 正在回复...' : '请输入你的消息...'}
            disabled={isLoading}
            style={{ maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={isLoading ? stopStream : handleSend}
            aria-label={isLoading ? '停止回复' : '发送'}
            className="tap-feedback p-2.5 sm:p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? (
              <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white leading-tight">聊天机器人</h2>
            <p className="text-[10px] sm:text-xs text-emerald-500 font-medium">● 在线</p>
          </div>
        </div>
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
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] sm:max-w-[68%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="prose dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-pre:rounded-xl prose-pre:p-3 overflow-x-auto text-sm sm:text-base break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 ml-2 mt-0.5">
                <User2 className="w-4 h-4 text-indigo-500" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-sm">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="max-w-[80%] sm:max-w-[68%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-bl-sm shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700">
              <div className="prose dark:prose-invert prose-p:my-1 prose-li:my-1 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-pre:rounded-xl prose-pre:p-3 overflow-x-auto text-sm sm:text-base break-words min-h-[1.5em]">
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
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {/* RAG toggle */}
          <button
            type="button"
            onClick={() => setMode(v => !v)}
            title={ragmode ? '已开启 RAG 知识库模式' : '点击开启 RAG 知识库模式'}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              ragmode
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${ragmode ? 'bg-indigo-500' : 'bg-gray-400'}`} />
            RAG
          </button>

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 transition-shadow">
            <textarea
              className="w-full resize-none bg-transparent px-3 py-2.5 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base leading-6"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? 'AI 正在回复...' : '请输入你的消息...'}
              disabled={isLoading}
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="button"
            onClick={isLoading ? stopStream : handleSend}
            aria-label={isLoading ? '停止回复' : '发送'}
            className={`tap-feedback p-2.5 sm:p-3 rounded-2xl shadow-md transition-colors flex-shrink-0 ${
              isLoading
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
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

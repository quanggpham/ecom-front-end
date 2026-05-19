'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Typewriter component for smooth streaming effect
const Typewriter = ({ text, isStreaming }: { text: string; isStreaming?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // If the streaming has ended and we haven't typed everything, snap to full text
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    let index = displayedText.length;
    // Reset if text was cleared or we are somehow ahead
    if (index > text.length) {
      setDisplayedText(text);
      return;
    }

    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        const nextLength = prev.length + 1;
        if (nextLength >= text.length) {
          clearInterval(timer);
          return text;
        }
        return text.slice(0, nextLength);
      });
    }, 15); // Adjust speed here (lower = faster)

    return () => clearInterval(timer);
  }, [text, displayedText.length, isStreaming]);

  // Format the currently displayed portion
  const formatted = displayedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\\n/g, '<br/>')
    .replace(/\n/g, '<br/>');

  return (
    <div className="relative inline-block">
      <span dangerouslySetInnerHTML={{ __html: formatted }} />
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 bg-amber-500 rounded-full ml-0.5 animate-pulse align-middle" />
      )}
    </div>
  );
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! 👋 Mình là trợ lý ảo của Bếp Việt. Bạn muốn tìm món ăn gì hôm nay?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hide the pulse animation after a while
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (directText?: string) => {
    const trimmed = (directText || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const encodedMessage = encodeURIComponent(trimmed);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/ai/chat/stream?message=${encodedMessage}`,
        {
          method: 'GET',
          headers,
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to connect to chatbot');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullContent = '';
      let networkBuffer = '';
      let eventDataBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush whatever is left
          if (eventDataBuffer) {
            fullContent += eventDataBuffer.endsWith('\n') ? eventDataBuffer.slice(0, -1) : eventDataBuffer;
          }
          break;
        }

        networkBuffer += decoder.decode(value, { stream: true });
        const lines = networkBuffer.split('\n');
        
        // Keep the last incomplete line in the network buffer
        networkBuffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            let data = line.slice(5);
            if (data.startsWith(' ')) data = data.slice(1);
            eventDataBuffer += data + '\n';
          } else if (line.trim() === '') {
            // Empty line means event ends
            if (eventDataBuffer) {
              // Strip the final \n joined during accumulation
              const payload = eventDataBuffer.slice(0, -1);
              
              if (payload !== '[DONE]') {
                fullContent += payload;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: fullContent, isStreaming: true }
                      : m
                  )
                );
              }
              eventDataBuffer = '';
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé!', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowPulse(false);
  };


  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-4 sm:right-6 z-50 transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Trợ lý Bếp Việt</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  <span className="text-white/80 text-xs">Đang hoạt động</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-amber-50/30 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-amber-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md'
                      : 'bg-white border border-border/60 text-foreground shadow-sm rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Typewriter text={msg.content} isStreaming={msg.isStreaming} />
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t bg-white/80">
              {['Món nào bán chạy?', 'Có món gì mát lạnh?', 'Gợi ý bữa trưa'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 text-xs rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="px-3 py-3 border-t bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về món ăn..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-40 hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                aria-label="Gửi tin nhắn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-700 rotate-0'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-xl hover:scale-105'
        }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 w-4 h-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}

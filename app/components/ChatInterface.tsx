"use client";

import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { X, SendHorizontal, Move } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_CHAT_WIDTH = 320;
const MIN_CHAT_WIDTH = 250;
const MAX_CHAT_WIDTH_MARGIN = 20;

const INITIAL_CHAT_CONTENT_HEIGHT = 250;
const MIN_CHAT_CONTENT_HEIGHT = 150;
const MAX_CHAT_CONTENT_HEIGHT_MARGIN = 50;

const CHAT_HEADER_HEIGHT = 40;
const CHAT_INPUT_HEIGHT = 50;
const CHAT_PADDING_VERTICAL = 16 * 2;
const WINDOW_DRAG_VIEWPORT_MARGIN = 10;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  onClose, 
}) => {
  const { currentAssistant } = useAssistant();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null); 

  const [chatSize, setChatSize] = useState({ width: INITIAL_CHAT_WIDTH, contentHeight: INITIAL_CHAT_CONTENT_HEIGHT });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number, y: number, width: number, height: number } | null>(null);
  
  const [windowPosition, setWindowPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const dragStartOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);

  useEffect(() => {
    setMessages([]); 
  }, [currentAssistant.id]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      handleResize(); 
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (isOpen && windowDimensions.width > 0 && windowDimensions.height > 0 && !isPositionInitialized) {
      const totalChatHeight = chatSize.contentHeight + CHAT_HEADER_HEIGHT + CHAT_INPUT_HEIGHT + CHAT_PADDING_VERTICAL;
      const initialTop = Math.max(WINDOW_DRAG_VIEWPORT_MARGIN, (windowDimensions.height - totalChatHeight) / 2);
      const initialLeft = Math.max(WINDOW_DRAG_VIEWPORT_MARGIN, (windowDimensions.width - chatSize.width) / 2);
      setWindowPosition({ top: initialTop, left: initialLeft });
      setIsPositionInitialized(true);
    }
    if (!isOpen) {
      setIsPositionInitialized(false); 
    }
  }, [isOpen, windowDimensions, chatSize.width, chatSize.contentHeight, isPositionInitialized]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleMouseDownOnResizeHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: chatSize.width,
      height: chatSize.contentHeight,
    };
  }, [chatSize]);

  useEffect(() => {
    const handleMouseMoveResize = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current || !chatWindowRef.current) return;
      const dx = e.clientX - resizeStartRef.current.x;
      const dy = e.clientY - resizeStartRef.current.y;

      let newWidth = resizeStartRef.current.width + dx;
      let newContentHeight = resizeStartRef.current.height + dy;
      
      const currentWindowLeft = chatWindowRef.current.offsetLeft;
      const currentWindowTop = chatWindowRef.current.offsetTop;

      newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(newWidth, windowDimensions.width - currentWindowLeft - MAX_CHAT_WIDTH_MARGIN));
      
      const totalFixedVerticalSpace = CHAT_HEADER_HEIGHT + CHAT_INPUT_HEIGHT + CHAT_PADDING_VERTICAL;
      newContentHeight = Math.max(MIN_CHAT_CONTENT_HEIGHT, Math.min(newContentHeight, windowDimensions.height - currentWindowTop - totalFixedVerticalSpace - MAX_CHAT_CONTENT_HEIGHT_MARGIN));
      
      setChatSize({ width: newWidth, contentHeight: newContentHeight });
    };

    const handleMouseUpResize = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMoveResize);
      document.addEventListener('mouseup', handleMouseUpResize);
    } else {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };
  }, [isResizing, windowDimensions]);

  const handleMouseDownOnHeader = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[title="调整大小"]')) {
        return;
    }
    e.preventDefault();
    setIsDraggingWindow(true);
    if (chatWindowRef.current) {
      dragStartOffsetRef.current = {
        x: e.clientX - chatWindowRef.current.offsetLeft,
        y: e.clientY - chatWindowRef.current.offsetTop,
      };
    }
  }, []);

  useEffect(() => {
    const handleMouseMoveDrag = (e: MouseEvent) => {
      if (!isDraggingWindow || !chatWindowRef.current) return;
      
      let newTop = e.clientY - dragStartOffsetRef.current.y;
      let newLeft = e.clientX - dragStartOffsetRef.current.x;

      newTop = Math.max(WINDOW_DRAG_VIEWPORT_MARGIN, Math.min(newTop, windowDimensions.height - chatWindowRef.current.offsetHeight - WINDOW_DRAG_VIEWPORT_MARGIN));
      newLeft = Math.max(WINDOW_DRAG_VIEWPORT_MARGIN, Math.min(newLeft, windowDimensions.width - chatWindowRef.current.offsetWidth - WINDOW_DRAG_VIEWPORT_MARGIN));
      
      setWindowPosition({ top: newTop, left: newLeft });
    };

    const handleMouseUpDrag = () => {
      setIsDraggingWindow(false);
    };

    if (isDraggingWindow) {
      document.addEventListener('mousemove', handleMouseMoveDrag);
      document.addEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMoveDrag);
      document.removeEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveDrag);
      document.removeEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingWindow, windowDimensions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const newUserMessage: Message = { id: Date.now().toString() + '-user', text: inputValue, sender: 'user' };
    const currentMessagesForApi = [...messages, newUserMessage];
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    const aiMessageId = Date.now().toString() + '-ai-loading';
    const loadingAiMessage: Message = { id: aiMessageId, text: `${currentAssistant.name}思考中...`, sender: 'ai' };
    setMessages((prev) => [...prev, loadingAiMessage]);
    try {
      const apiMessagesForHistory = currentMessagesForApi.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          messages: apiMessagesForHistory, 
          systemPrompt: currentAssistant.systemPrompt 
        }) 
      });
      setMessages(prev => prev.filter(m => m.id !== aiMessageId)); 
      if (!response.ok) {
        let errorText = `Failed to get response from ${currentAssistant.name}.`;
        try { const errorData = await response.json(); errorText = errorData.error || errorText; } catch (parseError) { errorText = response.statusText || errorText; }
        throw new Error(errorText);
      }
      const data = await response.json();
      const aiText = data.aiMessage;
      if (!aiText) throw new Error(`${currentAssistant.name}'s response did not contain text.`);
      const aiResponseMessage: Message = { id: Date.now().toString() + '-ai', text: aiText, sender: 'ai' };
      setMessages((prev) => [...prev, aiResponseMessage]);
    } catch (error) {
      console.error("Error fetching or processing AI response:", error);
      setMessages(prev => prev.filter(m => m.id !== aiMessageId)); 
      const errorResponseMessage: Message = { id: Date.now().toString() + '-error', text: error instanceof Error ? error.message : `An error occurred with ${currentAssistant.name}.`, sender: 'ai' };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      ref={chatWindowRef}
      className={`fixed p-4 rounded-lg shadow-xl glass-effect border border-border transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      style={{
        left: `${windowPosition.left}px`,
        top: `${windowPosition.top}px`,
        width: `${chatSize.width}px`,
        zIndex: 1001,
        cursor: isDraggingWindow ? 'grabbing' : (isResizing ? 'nwse-resize' : 'default'),
      }}
    >
      <div 
        className="relative z-[1] flex flex-col h-full"
      >
        <div 
          className="flex justify-between items-center mb-2 flex-shrink-0"
          style={{ cursor: isDraggingWindow ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDownOnHeader}
        >
          <div className="flex items-center gap-2">
            <Move size={16} className="text-muted-foreground" aria-hidden="true" />
            <h3 className="text-md font-semibold text-foreground select-none">与{currentAssistant.name}对话</h3>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="关闭聊天">
            <X size={18} />
          </button>
        </div>
        <div 
          className="overflow-y-auto mb-3 p-2 border border-border rounded-md bg-background/30 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent flex-grow"
          style={{ maxHeight: `${chatSize.contentHeight}px` }}
        >
          {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">{currentAssistant.welcomeMessage}</p>}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2.5 mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <img 
                  src={currentAssistant.avatarUrl}
                  alt={`${currentAssistant.name} Avatar`}
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1 object-cover border border-border"
                />
              )}
              <div className={`p-2 rounded-lg max-w-[80%] break-words text-sm shadow-md border border-black/[.15] dark:border-white/[.15] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <img 
                  src="/images/doctor-avatar.png"
                  alt="User Avatar"
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1 object-cover border border-border"
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center flex-shrink-0">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isLoading ? `${currentAssistant.name}思考中...` : "有什么想说的..."} className="flex-grow p-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-transparent placeholder:text-muted-foreground" disabled={isLoading} />
          <button 
            type="submit" 
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 flex-shrink-0"
            disabled={isLoading}
            aria-label="发送消息"
          >
            <SendHorizontal size={18} />
          </button>
        </form>
      </div>
      <div 
        onMouseDown={handleMouseDownOnResizeHandle}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-50 hover:opacity-100 transition-opacity duration-150 flex items-center justify-center"
        title="调整大小"
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 5.5L5.5 12.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12.5 8.5L8.5 12.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12.5 12.5H12.51" stroke="currentColor" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

export default ChatInterface; 
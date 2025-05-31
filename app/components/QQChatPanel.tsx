"use client";

import React, { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { X, SendHorizontal, Move, MessageCircle, User } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-light.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
  isError?: boolean;
  timestamp?: number;
}

interface ChatHistory {
  [assistantId: string]: Message[];
}

const INITIAL_PANEL_WIDTH = 800;
const INITIAL_PANEL_HEIGHT = 600;
const MIN_PANEL_WIDTH = 600;
const MIN_PANEL_HEIGHT = 400;
const ASSISTANT_LIST_WIDTH = 280;
const MIN_ASSISTANT_LIST_WIDTH = 200;
const MAX_ASSISTANT_LIST_WIDTH = 400;

// 调整类型枚举
type ResizeType = 'none' | 'right' | 'bottom' | 'corner' | 'divider';

// 打字指示器组件
const TypingIndicator: React.FC<{ 
  assistantName: string; 
  assistantAvatarUrl: string;
  isVisible: boolean;
  onAnimationEnd?: () => void;
}> = ({ assistantName, assistantAvatarUrl, isVisible, onAnimationEnd }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else if (shouldRender) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
        onAnimationEnd?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, onAnimationEnd]);

  if (!shouldRender) return null;

  return (
    <div className="flex items-start gap-3 mb-3 justify-start">
      <div className="qq-message-avatar">
        <Image 
          src={assistantAvatarUrl}
          alt={`${assistantName} Avatar`}
          width={36}
          height={36}
          className="rounded-full object-cover border-2 border-border"
        />
      </div>
      <div className={`qq-typing-indicator ${isAnimatingOut ? 'fade-out' : ''}`}>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
    </div>
  );
};

// 消息内容渲染组件
const MessageContent: React.FC<{ 
  text: string; 
  isLoading?: boolean;
  isError?: boolean;
}> = ({ text, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span>{text}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  // 检测是否包含数学公式
  const hasMath = /\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\[\[\(][\s\S]*?\\[\]\)]/.test(text);
  
  // 检测是否包含Markdown元素
  const hasMarkdown = /[#*_`\[\](){}]|^\s*[-*+]\s+|^\s*\d+\.\s+|^\s*>/.test(text);

  // 如果没有特殊格式，直接返回文本
  if (!hasMath && !hasMarkdown && !isError) {
    return <span className="markdown-content">{text}</span>;
  }

  try {
    return (
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
            // 自定义组件以确保样式正确
            p: ({ children }) => <p>{children}</p>,
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return <code className={className} {...props}>{children}</code>;
              }
              return (
                <pre>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            // 处理链接在新窗口打开
            a: ({ href, children, ...props }: any) => (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Markdown rendering error:', error);
    // 如果渲染失败，回退到纯文本
    return <span className="markdown-content">{text}</span>;
  }
};

// 消息气泡组件
const MessageBubble: React.FC<{ 
  message: Message; 
  currentAssistant: any;
  index: number;
}> = ({ message, currentAssistant, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className={`
      qq-message-item
      ${message.sender === 'user' ? 'qq-message-user' : 'qq-message-ai'}
      ${isVisible ? 'qq-message-visible' : 'qq-message-hidden'}
      ${message.isError ? 'qq-message-error' : ''}
    `}>
      {message.sender === 'ai' && (
        <div className="qq-message-avatar">
          <Image 
            src={currentAssistant.avatarUrl}
            alt={`${currentAssistant.name} Avatar`}
            width={36}
            height={36}
            className="rounded-full object-cover border-2 border-border"
          />
        </div>
      )}
      
      <div className={`
        qq-message-bubble
        ${message.sender === 'user' ? 'qq-bubble-user' : 'qq-bubble-ai'}
        ${message.isError ? 'qq-bubble-error' : ''}
      `}>
        {message.isLoading ? (
          <div className="flex items-center gap-2">
            <span>{message.text}</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <MessageContent text={message.text} isLoading={message.isLoading} isError={message.isError} />
        )}
      </div>
      
      {message.sender === 'user' && (
        <div className="qq-message-avatar">
          <Image 
            src="/images/doctor-avatar.png"
            alt="User Avatar"
            width={36}
            height={36}
            className="rounded-full object-cover border-2 border-border"
          />
        </div>
      )}
    </div>
  );
};

// 助手列表项组件
const AssistantItem: React.FC<{
  assistant: any;
  isActive: boolean;
  onClick: () => void;
  hasUnread?: boolean;
}> = ({ assistant, isActive, onClick, hasUnread = false }) => {
  return (
    <div 
      className={`
        qq-assistant-item
        ${isActive ? 'qq-assistant-active' : 'qq-assistant-inactive'}
        ${hasUnread ? 'qq-assistant-unread' : ''}
      `}
      onClick={onClick}
    >
      <div className="qq-assistant-avatar-container">
        <Image
          src={assistant.avatarUrl}
          alt={`${assistant.name} Avatar`}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="qq-online-indicator"></div>
        {hasUnread && <div className="qq-unread-badge"></div>}
      </div>
      
      <div className="qq-assistant-info">
        <div className="qq-assistant-name">{assistant.name}</div>
        <div className="qq-assistant-status">在线</div>
      </div>
    </div>
  );
};

// 主聊天面板组件
const QQChatPanel: React.FC = () => {
  const { assistants, currentAssistant, setCurrentAssistantById, isChatOpen, closeChat } = useAssistant();
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [panelSize, setPanelSize] = useState({ width: INITIAL_PANEL_WIDTH, height: INITIAL_PANEL_HEIGHT });
  const [panelPosition, setPanelPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<ResizeType>('none');
  const [assistantListWidth, setAssistantListWidth] = useState(ASSISTANT_LIST_WIDTH);
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isPositionInitialized, setIsPositionInitialized] = useState(false);

  const dragStartOffsetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const resizeStartRef = useRef<{ x: number, y: number, width: number, height: number, assistantListWidth?: number } | null>(null);

  // 获取当前助手的消息历史
  const currentMessages = chatHistory[currentAssistant.id] || [];

  // 窗口尺寸监听
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

  // 初始化面板位置
  useEffect(() => {
    if (isChatOpen && windowDimensions.width > 0 && windowDimensions.height > 0 && !isPositionInitialized) {
      const initialTop = Math.max(20, (windowDimensions.height - panelSize.height) / 2);
      const initialLeft = Math.max(20, (windowDimensions.width - panelSize.width) / 2);
      setPanelPosition({ top: initialTop, left: initialLeft });
      setIsPositionInitialized(true);
    }
    if (!isChatOpen) {
      setIsPositionInitialized(false);
    }
  }, [isChatOpen, windowDimensions, panelSize, isPositionInitialized]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [currentMessages, isChatOpen, scrollToBottom]);

  // 聚焦输入框
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, currentAssistant.id]);

  // 拖拽处理
  const handleMouseDownOnHeader = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsDragging(true);
    
    // 使用当前面板位置状态计算偏移量，而不是DOM的offset值
    dragStartOffsetRef.current = {
      x: e.clientX - panelPosition.left,
      y: e.clientY - panelPosition.top,
    };
  }, [panelPosition.left, panelPosition.top]);

  // 拖拽效果
  useEffect(() => {
    let animationId: number;
    
    const handleMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // 使用requestAnimationFrame优化拖拽性能
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      animationId = requestAnimationFrame(() => {
        let newTop = e.clientY - dragStartOffsetRef.current.y;
        let newLeft = e.clientX - dragStartOffsetRef.current.x;

        // 使用状态中的面板大小进行边界检测，避免DOM查询
        const panelWidth = panelSize.width;
        const panelHeight = panelSize.height;
        
        // 确保面板不会超出屏幕边界
        newTop = Math.max(10, Math.min(newTop, windowDimensions.height - panelHeight - 10));
        newLeft = Math.max(10, Math.min(newLeft, windowDimensions.width - panelWidth - 10));
        
        setPanelPosition({ top: newTop, left: newLeft });
      });
    };

    const handleMouseUpDrag = () => {
      setIsDragging(false);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveDrag, { passive: true });
      document.addEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.classList.add('qq-dragging');
    } else {
      document.removeEventListener('mousemove', handleMouseMoveDrag);
      document.removeEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('qq-dragging');
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveDrag);
      document.removeEventListener('mouseup', handleMouseUpDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('qq-dragging');
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isDragging, windowDimensions, panelSize]);

  // 窗口大小调整处理
  const handleResizeStart = useCallback((e: React.MouseEvent, type: ResizeType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeType(type);
    
    if (chatPanelRef.current) {
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: panelSize.width,
        height: panelSize.height,
        assistantListWidth: assistantListWidth
      };
    }
  }, [panelSize.width, panelSize.height, assistantListWidth]);

  // 窗口大小调整效果
  useEffect(() => {
    const handleMouseMoveResize = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current || !chatPanelRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      switch (resizeType) {
        case 'right': {
          const newWidth = Math.max(MIN_PANEL_WIDTH, 
            Math.min(windowDimensions.width - panelPosition.left - 20, 
              resizeStartRef.current.width + deltaX));
          setPanelSize(prev => ({ ...prev, width: newWidth }));
          break;
        }
        case 'bottom': {
          const newHeight = Math.max(MIN_PANEL_HEIGHT, 
            Math.min(windowDimensions.height - panelPosition.top - 20, 
              resizeStartRef.current.height + deltaY));
          setPanelSize(prev => ({ ...prev, height: newHeight }));
          break;
        }
        case 'corner': {
          const newWidth = Math.max(MIN_PANEL_WIDTH, 
            Math.min(windowDimensions.width - panelPosition.left - 20, 
              resizeStartRef.current.width + deltaX));
          const newHeight = Math.max(MIN_PANEL_HEIGHT, 
            Math.min(windowDimensions.height - panelPosition.top - 20, 
              resizeStartRef.current.height + deltaY));
          setPanelSize({ width: newWidth, height: newHeight });
          break;
        }
        case 'divider': {
          const newAssistantListWidth = Math.max(MIN_ASSISTANT_LIST_WIDTH, 
            Math.min(MAX_ASSISTANT_LIST_WIDTH, 
              (resizeStartRef.current.assistantListWidth || ASSISTANT_LIST_WIDTH) + deltaX));
          setAssistantListWidth(newAssistantListWidth);
          break;
        }
      }
    };

    const handleMouseUpResize = () => {
      setIsResizing(false);
      setResizeType('none');
      resizeStartRef.current = null;
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMoveResize);
      document.addEventListener('mouseup', handleMouseUpResize);
      document.body.style.userSelect = 'none';
      
      // 设置不同的光标样式
      switch (resizeType) {
        case 'right':
          document.body.style.cursor = 'ew-resize';
          break;
        case 'bottom':
          document.body.style.cursor = 'ns-resize';
          break;
        case 'corner':
          document.body.style.cursor = 'nw-resize';
          break;
        case 'divider':
          document.body.style.cursor = 'col-resize';
          break;
      }
    } else {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveResize);
      document.removeEventListener('mouseup', handleMouseUpResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resizeType, windowDimensions, panelPosition]);

  // 助手切换
  const handleAssistantChange = (assistantId: string) => {
    setCurrentAssistantById(assistantId);
  };

  // 发送消息
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = { 
      id: Date.now().toString() + '-user', 
      text: inputValue, 
      sender: 'user',
      timestamp: Date.now()
    };
    
    // 更新当前助手的聊天历史
    setChatHistory(prev => ({
      ...prev,
      [currentAssistant.id]: [...(prev[currentAssistant.id] || []), userMessage]
    }));
    
    setInputValue('');
    setIsLoading(true);
    setShowTyping(true);

    const startTime = Date.now();
    const minTypingTime = 1200;

    try {
      const currentMessagesForApi = [...(chatHistory[currentAssistant.id] || []), userMessage];
      const apiMessagesForHistory = currentMessagesForApi.map(msg => ({ 
        role: msg.sender === 'user' ? 'user' : 'assistant', 
        content: msg.text 
      }));
      
      const response = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          messages: apiMessagesForHistory, 
          systemPrompt: currentAssistant.systemPrompt 
        }) 
      });
      
      if (!response.ok) {
        let errorText = `Failed to get response from ${currentAssistant.name}.`;
        try { 
          const errorData = await response.json(); 
          errorText = errorData.error || errorText; 
        } catch (parseError) { 
          errorText = response.statusText || errorText; 
        }
        throw new Error(errorText);
      }
      
      const data = await response.json();
      const aiText = data.aiMessage;
      
      if (!aiText) throw new Error(`${currentAssistant.name}'s response did not contain text.`);
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minTypingTime - elapsedTime);
      
      setTimeout(() => {
        setShowTyping(false);
        
        setTimeout(() => {
          const aiResponseMessage: Message = { 
            id: Date.now().toString() + '-ai', 
            text: aiText, 
            sender: 'ai',
            timestamp: Date.now()
          };
          setChatHistory(prev => ({
            ...prev,
            [currentAssistant.id]: [...(prev[currentAssistant.id] || []), aiResponseMessage]
          }));
        }, 350);
      }, remainingTime);
      
    } catch (error) {
      console.error("Error fetching or processing AI response:", error);
      
      const elapsedTime = Date.now() - startTime;
      const minErrorTime = 800;
      const remainingTime = Math.max(0, minErrorTime - elapsedTime);
      
      setTimeout(() => {
        setShowTyping(false);
        
        setTimeout(() => {
          const errorResponseMessage: Message = { 
            id: Date.now().toString() + '-error', 
            text: error instanceof Error ? error.message : `An error occurred with ${currentAssistant.name}.`, 
            sender: 'ai',
            isError: true,
            timestamp: Date.now()
          };
          setChatHistory(prev => ({
            ...prev,
            [currentAssistant.id]: [...(prev[currentAssistant.id] || []), errorResponseMessage]
          }));
        }, 350);
      }, remainingTime);
    } finally { 
      setIsLoading(false); 
    }
  };

  const panelClasses = `
    fixed qq-chat-panel glass-effect border border-border
    ${isChatOpen ? 'qq-panel-enter' : 'qq-panel-exit opacity-0 pointer-events-none'}
    ${isDragging ? 'qq-panel-dragging' : ''}
    ${isResizing ? 'qq-panel-resizing' : ''}
  `;

  return (
    <div 
      ref={chatPanelRef}
      className={panelClasses}
      style={{
        left: `${panelPosition.left}px`,
        top: `${panelPosition.top}px`,
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
        zIndex: 1001,
      }}
    >
      {/* 标题栏 */}
      <div 
        className="qq-panel-header"
        onMouseDown={handleMouseDownOnHeader}
      >
        <div className="flex items-center gap-3">
          <MessageCircle size={18} className="text-primary" />
          <span className="qq-panel-title">AI助手终端</span>
        </div>
        <button 
          onClick={closeChat} 
          className="qq-close-button"
          aria-label="关闭聊天面板"
        >
          <X size={18} />
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="qq-panel-content">
        {/* 左侧助手列表 */}
        <div className="qq-assistant-list" style={{ width: assistantListWidth }}>
          <div className="qq-list-header">
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">AI助手</span>
            </div>
            <span className="text-xs text-muted-foreground">{assistants.length}/∞</span>
          </div>
          
          <div className="qq-list-content">
            {assistants.map((assistant) => (
              <AssistantItem
                key={assistant.id}
                assistant={assistant}
                isActive={currentAssistant.id === assistant.id}
                onClick={() => handleAssistantChange(assistant.id)}
                hasUnread={false} // 后续可以实现未读消息逻辑
              />
            ))}
          </div>
        </div>

        {/* 分隔符 - 用于调整助手列表宽度 */}
        <div 
          className="qq-divider"
          onMouseDown={(e) => handleResizeStart(e, 'divider')}
          title="拖拽调整助手列表宽度"
        >
          <div className="qq-divider-line"></div>
        </div>

        {/* 右侧聊天区域 */}
        <div className="qq-chat-area">
          {/* 聊天头部 */}
          <div className="qq-chat-header">
            <div className="flex items-center gap-3">
              <Image
                src={currentAssistant.avatarUrl}
                alt={`${currentAssistant.name} Avatar`}
                width={32}
                height={32}
                className="rounded-full object-cover border border-border"
              />
              <div>
                <div className="qq-chat-title">{currentAssistant.name}</div>
                <div className="qq-chat-status">
                  <div className="qq-online-dot"></div>
                  在线
                </div>
              </div>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="qq-messages-container">
            {currentMessages.length === 0 && (
              <div className="qq-welcome-message">
                <div className="qq-welcome-avatar">
                  <Image
                    src={currentAssistant.avatarUrl}
                    alt={`${currentAssistant.name} Avatar`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="qq-welcome-text">
                  <h3>开始与{currentAssistant.name}对话</h3>
                  <p>{currentAssistant.welcomeMessage}</p>
                </div>
              </div>
            )}
            
            {currentMessages.map((msg, index) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                currentAssistant={currentAssistant}
                index={index}
              />
            ))}
            
            {showTyping && (
              <TypingIndicator 
                assistantName={currentAssistant.name} 
                assistantAvatarUrl={currentAssistant.avatarUrl} 
                isVisible={showTyping} 
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="qq-input-area">
            <form onSubmit={handleSubmit} className="qq-input-form">
              <input 
                ref={inputRef}
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder={isLoading ? `${currentAssistant.name}正在思考中...` : "请输入消息..."} 
                className="qq-message-input" 
                disabled={isLoading} 
              />
              <button 
                type="submit" 
                className="qq-send-button"
                disabled={isLoading || !inputValue.trim()}
                aria-label="发送消息"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 窗口大小调整控制点 */}
      <div className="qq-resize-controls">
        {/* 右边缘调整 */}
        <div 
          className="qq-resize-handle qq-resize-right"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
          title="拖拽调整窗口宽度"
        />
        
        {/* 底边缘调整 */}
        <div 
          className="qq-resize-handle qq-resize-bottom"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          title="拖拽调整窗口高度"
        />
        
        {/* 右下角调整 */}
        <div 
          className="qq-resize-handle qq-resize-corner"
          onMouseDown={(e) => handleResizeStart(e, 'corner')}
          title="拖拽调整窗口大小"
        />
      </div>
    </div>
  );
};

export default QQChatPanel; 
"use client";

import React, { useState, FormEvent, useRef, useEffect, useLayoutEffect } from 'react';
import { X, SendHorizontal, Bot, User } from 'lucide-react'; // Added SendHorizontal, Bot, User icons

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  modelPosition: { x: number; y: number } | null;
  modelWidth: number;
  modelHeight: number;
}

const CHAT_BUBBLE_WIDTH = 280; // Increased width slightly for avatars
const CHAT_BUBBLE_MAX_CONTENT_HEIGHT = 200; // Max height for messages area
const BUBBLE_HEADER_HEIGHT = 40; // Approximate height for title + close button
const BUBBLE_INPUT_HEIGHT = 50; // Approximate height for input form
const BUBBLE_PADDING_VERTICAL = 16 * 2; // p-4 top and bottom for the main bubble content
const TOTAL_BUBBLE_FIXED_VERTICAL_SPACE = BUBBLE_HEADER_HEIGHT + BUBBLE_INPUT_HEIGHT + BUBBLE_PADDING_VERTICAL;
const BUBBLE_TAIL_HEIGHT = 10; // px
const GAP_ABOVE_MODEL = 8; // px, gap between model top and bubble tail bottom
const GAP_BELOW_MODEL = 8; // px, gap between model bottom and bubble tail top
const VIEWPORT_MARGIN = 10; // px, margin from viewport edges

interface BubblePositionState {
  top: number;
  left: number;
  opacity: number;
  transformOrigin: string;
  tailDirection: 'top' | 'bottom';
  isVisible: boolean; // To control actual rendering vs just calculation
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  modelPosition,
  modelWidth,
  modelHeight
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [bubbleState, setBubbleState] = useState<BubblePositionState>({
    top: 0, left: 0, opacity: 0, transformOrigin: 'bottom center', tailDirection: 'bottom', isVisible: false
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      handleResize(); // Initial size
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen && modelPosition && windowSize.width > 0 && windowSize.height > 0) {
      const bubbleContentHeight = CHAT_BUBBLE_MAX_CONTENT_HEIGHT; // Assuming fixed for now
      const bubbleOuterHeight = bubbleContentHeight + TOTAL_BUBBLE_FIXED_VERTICAL_SPACE + BUBBLE_TAIL_HEIGHT;

      let newTop_tryAbove = modelPosition.y - bubbleOuterHeight - GAP_ABOVE_MODEL;
      let newLeft = modelPosition.x + (modelWidth / 2) - (CHAT_BUBBLE_WIDTH / 2);
      let newTailDirection: 'top' | 'bottom' = 'bottom';
      let newTransformOrigin = 'bottom center';

      // Try positioning above the model first
      if (newTop_tryAbove < VIEWPORT_MARGIN) { // If overflows top
        // Try positioning below the model
        newTop_tryAbove = modelPosition.y + modelHeight + GAP_BELOW_MODEL;
        newTailDirection = 'top';
        newTransformOrigin = 'top center';
        // Check if it overflows bottom when placed below
        if (newTop_tryAbove + bubbleOuterHeight > windowSize.height - VIEWPORT_MARGIN) {
          // If still overflows bottom, try to fit it by adjusting top
          newTop_tryAbove = windowSize.height - bubbleOuterHeight - VIEWPORT_MARGIN;
          // If model is very tall, newTop_tryAbove could be < modelPosition.y + modelHeight. 
          // This case is complex; for now, we prioritize fitting in viewport.
        }
      }

      // Adjust left/right to fit viewport
      if (newLeft < VIEWPORT_MARGIN) {
        newLeft = VIEWPORT_MARGIN;
      }
      if (newLeft + CHAT_BUBBLE_WIDTH > windowSize.width - VIEWPORT_MARGIN) {
        newLeft = windowSize.width - CHAT_BUBBLE_WIDTH - VIEWPORT_MARGIN;
      }
      
      // Ensure top is not negative if it was forced down due to bottom overflow
      newTop_tryAbove = Math.max(VIEWPORT_MARGIN, newTop_tryAbove);

      setBubbleState({
        top: newTop_tryAbove,
        left: newLeft,
        opacity: 1, // Will be animated by className
        transformOrigin: newTransformOrigin,
        tailDirection: newTailDirection,
        isVisible: true,
      });
    } else {
      setBubbleState(prev => ({ ...prev, opacity: 0, isVisible: false }));
    }
  }, [isOpen, modelPosition, modelWidth, modelHeight, windowSize]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const newUserMessage: Message = { id: Date.now().toString() + '-user', text: inputValue, sender: 'user' };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInputValue('');
    setIsLoading(true);
    const aiMessageId = Date.now().toString() + '-ai-loading';
    const loadingAiMessage: Message = { id: aiMessageId, text: '阿米娅思考中...', sender: 'ai' };
    setMessages((prev) => [...prev, loadingAiMessage]);
    try {
      const apiMessagesForHistory = currentMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }));
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessagesForHistory }) });
      setMessages(prev => prev.filter(m => m.id !== aiMessageId));
      if (!response.ok) {
        let errorText = 'Failed to get response from Amiya.';
        try { const errorData = await response.json(); errorText = errorData.error || errorText; } catch (parseError) { errorText = response.statusText || errorText; }
        throw new Error(errorText);
      }
      const data = await response.json();
      const aiText = data.aiMessage;
      if (!aiText) throw new Error("Amiya's response did not contain text.");
      const aiResponseMessage: Message = { id: Date.now().toString() + '-ai', text: aiText, sender: 'ai' };
      setMessages((prev) => [...prev, aiResponseMessage]);
    } catch (error) {
      console.error("Error fetching or processing AI response:", error);
      setMessages(prev => prev.filter(m => m.id !== aiMessageId)); 
      const errorResponseMessage: Message = { id: Date.now().toString() + '-error', text: error instanceof Error ? error.message : 'An error occurred with Amiya.', sender: 'ai' };
      setMessages((prev) => [...prev, errorResponseMessage]);
    } finally { setIsLoading(false); }
  };

  if (!bubbleState.isVisible && !isOpen) { // Fully hidden and not attempting to open
    return null;
  }

  const tailBaseClasses = "absolute left-1/2 w-0 h-0 border-transparent -translate-x-1/2";
  let tailStyle: React.CSSProperties = {};
  if (bubbleState.tailDirection === 'bottom') {
    tailStyle = {
      bottom: `-${BUBBLE_TAIL_HEIGHT * 2 - 2}px`,
      borderTopWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderLeftWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderRightWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderTopColor: 'hsl(var(--card))', 
    };
  } else { // tailDirection === 'top'
    tailStyle = {
      top: `-${BUBBLE_TAIL_HEIGHT * 2 - 2}px`,
      borderBottomWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderLeftWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderRightWidth: `${BUBBLE_TAIL_HEIGHT}px`,
      borderBottomColor: 'hsl(var(--card))', 
    };
  }

  return (
    <div 
      className={`fixed p-4 rounded-lg shadow-xl glass-effect border border-border transition-opacity transition-transform duration-300 ease-in-out transform ${isOpen && bubbleState.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      style={{
        left: `${bubbleState.left}px`,
        top: `${bubbleState.top}px`,
        width: `${CHAT_BUBBLE_WIDTH}px`,
        zIndex: 1001,
        transformOrigin: bubbleState.transformOrigin,
        opacity: bubbleState.opacity, // Controlled by useLayoutEffect for initial setup
      }}
    >
      <div className={tailBaseClasses} style={tailStyle} />
      <div className="relative z-[1]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-foreground">与阿米娅对话</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="关闭聊天">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto mb-3 p-2 border border-border rounded-md bg-background/30 scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent" style={{ maxHeight: `${CHAT_BUBBLE_MAX_CONTENT_HEIGHT}px` }}>
          {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">博士，有什么可以帮您的吗？</p>}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2.5 mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <img 
                  src="/images/Amiya-avatar.png" 
                  alt="Amiya Avatar"
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1 object-cover border border-border"
                />
              )}
              <div className={`p-2 rounded-lg max-w-[80%] break-words text-sm shadow-md border border-black/[.15] dark:border-white/[.15] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <img 
                  src="/images/doctor-avatar.png" 
                  alt="Doctor Avatar"
                  className="w-6 h-6 rounded-full flex-shrink-0 mt-1 object-cover border border-border"
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isLoading ? "阿米娅思考中..." : "有什么想说的..."} className="flex-grow p-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-transparent placeholder:text-muted-foreground" disabled={isLoading} />
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
    </div>
  );
};

export default ChatInterface; 
"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';

export const AssistantSwitcher: React.FC = () => {
  const { assistants, currentAssistant, setCurrentAssistantById, toggleChat, openChat, isChatOpen } = useAssistant();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    // 直接打开聊天界面，不显示下拉菜单
    if (!isChatOpen) {
      openChat();
    } else {
      toggleChat();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* 主按钮 */}
      <button
        onClick={handleToggleDropdown}
        className={`
          assistant-avatar-button relative w-10 h-10 rounded-full flex items-center justify-center 
          bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
          hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/5
          active:scale-95 transition-all duration-500 ease-out
          transform hover:scale-110 hover:-translate-y-1
          focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30
          shadow-lg hover:shadow-xl hover:shadow-primary/20
          border-2 border-transparent hover:border-primary/20
          ${isChatOpen ? 'animate-pulse-gentle shadow-primary/30' : ''}
          group overflow-hidden
        `}
        aria-label={!isChatOpen ? "打开聊天对话" : "聊天对话已打开"}
        title={!isChatOpen ? "打开聊天对话" : "与当前助手对话"}
      >
        {/* 渐变边框效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-spin-slow"></div>
        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"></div>
        
        {/* 背景光效 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* 头像容器 */}
        <div className="assistant-avatar-container relative z-10">
          <Image
            src={currentAssistant.avatarUrl}
            alt={`${currentAssistant.name} Avatar`}
            width={28}
            height={28}
            className={`
              rounded-full object-cover border-2 border-white/50 dark:border-gray-700/50
              transition-all duration-500 ease-out
              group-hover:border-primary/50 group-hover:brightness-110
              ${isChatOpen ? 'brightness-110 border-primary/60' : ''}
            `}
          />
          
          {/* 呼吸光环效果 */}
          {!isChatOpen && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-purple-500/30 animate-ping opacity-75"></div>
          )}
        </div>

        {/* 悬停时的闪光效果 */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/60 rounded-full animate-twinkle"></div>
          <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/40 rounded-full animate-twinkle-delay"></div>
        </div>
      </button>

      {/* 在线状态指示器 - 移到按钮外层，确保显示在最上方 */}
      <div className={`
        absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
        transition-all duration-300 ease-out z-50
        ${isChatOpen 
          ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
          : 'bg-blue-500 shadow-lg shadow-blue-500/50'
        }
      `}>
        {/* 状态图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isChatOpen ? (
            <div className="w-1 h-1 bg-white rounded-full"></div>
          ) : (
            <MessageCircle size={6} className="text-white" />
          )}
        </div>
      </div>
    </div>
  );
};

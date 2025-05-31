"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { useAssistant } from '../contexts/AssistantContext';

export const AssistantSwitcher: React.FC = () => {
  const { assistants, currentAssistant, setCurrentAssistantById, toggleChat, openChat, isChatOpen } = useAssistant();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    // 直接打开聊天界面，不显示下拉菜单
    if (!isChatOpen) {
      openChat();
    } else {
      // 如果聊天已经打开，可以选择关闭或保持打开
      // 这里我们选择保持聊天打开，因为用户可能想继续使用
      // 如果您希望点击后关闭聊天，可以取消下面的注释
      toggleChat();
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggleDropdown}
        className={`
          assistant-avatar-button w-10 h-10 rounded-full flex items-center justify-center 
          bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 
          active:bg-muted transition-all duration-300 ease-in-out 
          transform hover:scale-110 active:scale-95 
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary 
          focus-visible:ring-offset-2 focus-visible:ring-offset-background
          shadow-sm hover:shadow-md
        `}
        aria-label={!isChatOpen ? "打开聊天对话" : "聊天对话已打开"}
        title={!isChatOpen ? "打开聊天对话" : "与当前助手对话"}
      >
        <div className="assistant-avatar-container relative">
          <Image
            src={currentAssistant.avatarUrl}
            alt={`${currentAssistant.name} Avatar`}
            width={28}
            height={28}
            className={`
              rounded-full object-cover border border-border/50 
              transition-all duration-300 ease-in-out
              ${isChatOpen ? 'brightness-110 ring-2 ring-primary/30' : ''}
            `}
          />
          {isChatOpen && (
            <div className={`
              absolute inset-0 rounded-full bg-primary/20 
              transition-opacity duration-300 ease-in-out opacity-100
            `} />
          )}
        </div>
      </button>
    </div>
  );
};

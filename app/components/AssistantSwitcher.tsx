"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check, ChevronUp } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';

export const AssistantSwitcher: React.FC = () => {
  const { assistants, currentAssistant, setCurrentAssistantById, toggleChat, openChat, isChatOpen } = useAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectAssistant = (assistantId: string) => {
    setCurrentAssistantById(assistantId);
    if (!isChatOpen) {
      openChat(); // Open chat if it's closed when switching assistant
    }
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggleDropdown} 
        className="rounded-full p-1.5 hover:bg-muted/80 active:bg-muted transition-all duration-150 ease-in-out transform active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={isOpen ? "关闭助手列表" : "打开助手列表并切换助手"}
        title="切换AI助手"
      >
        <Image 
          src={currentAssistant.avatarUrl}
          alt={`${currentAssistant.name} Avatar`}
          width={28} 
          height={28}
          className="rounded-full object-cover border border-border/50"
        />
      </button>

      {isOpen && (
        <div 
          className={`absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg p-2 z-50 
                      origin-bottom-right transition-all duration-200 ease-out 
                      ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        >
          <div className="flex justify-between items-center mb-1 px-1 pt-0.5">
            <p className="text-sm font-medium text-foreground">选择助手</p>
            <ChevronUp size={16} className="text-muted-foreground" />
          </div>
          <ul className="space-y-1">
            {assistants.map((assistant) => (
              <li key={assistant.id}>
                <button
                  onClick={() => handleSelectAssistant(assistant.id)}
                  className="w-full flex items-center justify-between text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors duration-150 ease-in-out focus:outline-none focus-visible:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Image 
                      src={assistant.avatarUrl}
                      alt={`${assistant.name} Avatar`}
                      width={24} 
                      height={24}
                      className="rounded-full object-cover border border-border/30"
                    />
                    <span className='text-foreground'>{assistant.name}</span>
                  </div>
                  {currentAssistant.id === assistant.id && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 
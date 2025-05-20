"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAssistant } from '../contexts/AssistantContext';
import { ChevronsUpDown, Check } from 'lucide-react';

export const AssistantSwitcher: React.FC = () => {
  const { availableAssistants, currentAssistant, setCurrentAssistantId } = useAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (availableAssistants.length <= 1) return null;

  const handleSelectAssistant = (assistantId: string) => {
    setCurrentAssistantId(assistantId);
    setIsOpen(false);
  };

  return (
    <div className="relative w-auto" ref={switcherRef}>
      <button
        type="button"
        className={`flex items-center justify-center p-2 text-sm bg-background border border-border rounded-full shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ease-in-out cursor-pointer aspect-square transform active:scale-90 hover:shadow-md ${isOpen ? 'ring-2 ring-primary shadow-md' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`当前助手: ${currentAssistant.name}`}
      >
        <span className="flex items-center justify-center">
          <img 
            src={currentAssistant.avatarUrl}
            alt={`${currentAssistant.name} avatar`}
            className="w-6 h-6 rounded-full object-cover flex-shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105"
          />
        </span>
      </button>

      <div 
        role="listbox"
        className={`absolute bottom-0 right-full mr-2 w-48 max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg z-10 focus:outline-none py-1 glass-effect transition-all duration-200 ease-in-out transform ${isOpen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 pointer-events-none -translate-x-2'}`}
        style={{ transformOrigin: 'right center' }}
      >
        {availableAssistants.map((assistant) => (
          <div
            key={assistant.id}
            onClick={() => handleSelectAssistant(assistant.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectAssistant(assistant.id)}
            role="option"
            aria-selected={assistant.id === currentAssistant.id}
            tabIndex={0}
            className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-primary/10 text-foreground transition-colors duration-150 ease-in-out data-[selected=true]:font-semibold data-[selected=true]:bg-primary/20`}
            data-selected={assistant.id === currentAssistant.id}
          >
            <span className="flex items-center">
              <img 
                src={assistant.avatarUrl}
                alt={`${assistant.name} avatar`}
                className="w-5 h-5 rounded-full mr-2 object-cover flex-shrink-0"
              />
              <span className="truncate">{assistant.name}</span>
            </span>
            {assistant.id === currentAssistant.id && (
              <Check size={16} className="ml-2 text-primary flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 
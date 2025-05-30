"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { assistants, AssistantConfig, defaultAssistantId } from '../config/assistants';

interface AssistantContextType {
  assistants: AssistantConfig[];
  currentAssistant: AssistantConfig;
  setCurrentAssistantById: (id: string) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAssistantId, setCurrentAssistantId] = useState(defaultAssistantId);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentAssistant = assistants.find(a => a.id === currentAssistantId) || assistants[0];

  const setCurrentAssistantById = (id: string) => {
    const newAssistant = assistants.find(a => a.id === id);
    if (newAssistant) {
      setCurrentAssistantId(id);
    } else {
      console.warn(`Assistant with id "${id}" not found.`);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  useEffect(() => {
    console.log(`Assistant changed to: ${currentAssistant.name}. Chat is ${isChatOpen ? 'open' : 'closed'}.`);
  }, [currentAssistantId, currentAssistant.name, isChatOpen]);

  return (
    <AssistantContext.Provider value={{ 
        assistants, 
        currentAssistant, 
        setCurrentAssistantById, 
        isChatOpen, 
        toggleChat,
        openChat,
        closeChat
    }}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}; 
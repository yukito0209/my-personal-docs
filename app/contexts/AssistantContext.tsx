"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { assistants, AssistantConfig, defaultAssistantId } from '../config/assistants';

interface AssistantContextType {
  availableAssistants: AssistantConfig[];
  currentAssistant: AssistantConfig;
  setCurrentAssistantId: (id: string) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider = ({ children }: { children: ReactNode }) => {
  const [currentId, setCurrentId] = useState<string>(defaultAssistantId);

  const currentAssistant = useMemo(() => {
    return assistants.find(a => a.id === currentId) || assistants.find(a => a.id === defaultAssistantId)!;
  }, [currentId]);

  const setCurrentAssistantId = useCallback((id: string) => {
    const assistantExists = assistants.some(a => a.id === id);
    if (assistantExists) {
      setCurrentId(id);
    } else {
      console.warn(`Assistant with id "${id}" not found. Falling back to default.`);
      setCurrentId(defaultAssistantId);
    }
  }, []);

  const value = useMemo(() => ({
    availableAssistants: assistants,
    currentAssistant,
    setCurrentAssistantId,
  }), [currentAssistant, setCurrentAssistantId]);

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}; 
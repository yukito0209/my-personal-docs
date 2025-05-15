"use client";

import React, { useState, FormEvent, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const ChatInterface: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString() + '-user',
      text: inputValue,
      sender: 'user',
    };

    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    const currentInputValue = inputValue; // Store before clearing
    setInputValue('');
    setIsLoading(true);

    // Placeholder for AI message while loading (optional, can be removed or simplified)
    const aiMessageId = Date.now().toString() + '-ai-loading';
    const loadingAiMessage: Message = {
      id: aiMessageId,
      text: '阿米娅思考中...', // Or simply '...' or 'Thinking...'
      sender: 'ai',
    };
    setMessages((prevMessages) => [...prevMessages, loadingAiMessage]);

    try {
      // Client messages should already be in the format { role: 'user'/'assistant', content: 'text' }
      // The backend expects `messages` field in the body to be this array.
      // Previous `apiMessagesForHistory` was already correctly structured.
      // `currentMessages` only contains { id, text, sender }, so we need to map it.
      const apiMessagesForHistory = currentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessagesForHistory }), // Send all messages for context
      });

      // Remove the loading message before processing the actual response
      setMessages(prev => prev.filter(m => m.id !== aiMessageId));

      if (!response.ok) {
        let errorText = 'Failed to get response from Amiya.';
        try {
            const errorData = await response.json(); 
            errorText = errorData.error || errorText;
        } catch (parseError) {
            // If parsing errorData fails, use the status text or a generic message
            errorText = response.statusText || errorText;
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      const aiText = data.aiMessage; // Backend now sends { aiMessage: "..." }

      if (!aiText) {
        throw new Error("Amiya's response did not contain text.");
      }

      const aiResponseMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: aiText,
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);

    } catch (error) {
      console.error("Error fetching or processing AI response:", error);
      // Ensure loading message is removed even on error if it wasn't already
      setMessages(prev => prev.filter(m => m.id !== aiMessageId)); 
      
      const errorResponseMessage: Message = {
        id: Date.now().toString() + '-error',
        text: error instanceof Error ? error.message : 'An error occurred with Amiya.',
        sender: 'ai', // Display as an AI message bubble
      };
      setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed bottom-0 right-0 mb-4 mr-4 p-4 rounded-lg shadow-xl glass-effect md:w-96 w-full max-w-md border border-border"
      style={{ zIndex: 1001 }}
    >
      <div className="h-64 overflow-y-auto mb-4 p-2 border border-border rounded-md bg-background/50">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground">Start a conversation with Amiya...</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg max-w-[80%] break-words ${msg.sender === 'user'
                ? 'bg-primary text-primary-foreground ml-auto'
                : 'bg-muted text-muted-foreground mr-auto'
              }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Amiya is thinking..." : "Ask Amiya anything..."}
          className="flex-grow p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-transparent placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Wait' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 
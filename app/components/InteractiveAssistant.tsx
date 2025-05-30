"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ChatInterface from './ChatInterface';
import { useAssistant } from '../contexts/AssistantContext';

const DynamicLive2DLoader = dynamic(() => import('./DynamicLive2DLoader'), {
  ssr: false,
  loading: () => (
    <div style={{ width: `200px`, height: `293px`, display: 'flex', alignItems:'center', justifyContent:'center', border: '1px dashed grey' }}>
      <p style={{color: 'grey', fontSize: '10px'}}>Loading Assistant...</p>
    </div>
  ),
});

const CLICK_THRESHOLD_PIXELS = 5;
const CLICK_THRESHOLD_MS = 250;

const InteractiveAssistant: React.FC = () => {
  const { currentAssistant } = useAssistant();
  const modelWidth = currentAssistant.modelWidth || 200;
  const modelHeight = currentAssistant.modelHeight || 293;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const mouseDownTimeRef = useRef<number>(0);

  useEffect(() => {
    setPosition({
      x: 10, 
      y: window.innerHeight - modelHeight - 0, 
    });
  }, [modelHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!position) return;
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    mouseDownTimeRef.current = Date.now();
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault(); 
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !position) return;
      
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;

      const maxX = window.innerWidth - modelWidth;
      const maxY = window.innerHeight - modelHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (mouseDownPosRef.current) {
        const deltaX = e.clientX - mouseDownPosRef.current.x;
        const deltaY = e.clientY - mouseDownPosRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const elapsedTime = Date.now() - mouseDownTimeRef.current;

        if (distance < CLICK_THRESHOLD_PIXELS && elapsedTime < CLICK_THRESHOLD_MS) {
          toggleChat();
        }
      }
      setIsDragging(false);
      mouseDownPosRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, modelWidth, modelHeight]);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  if (!position) {
    return (
        <div style={{ width: `${modelWidth}px`, height: `${modelHeight}px`, position: 'fixed', left: '10px', bottom: '0px', zIndex: 999, border: '1px dashed grey', display: 'flex', alignItems:'center', justifyContent:'center' }}>
            <p style={{color: 'grey', fontSize: '10px'}}>Initializing {currentAssistant.name}...</p>
        </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${modelWidth}px`,
          height: `${modelHeight}px`,
          zIndex: 999,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <DynamicLive2DLoader />
        {/* <div>Temp Placeholder for Live2D</div> */}
      </div>

      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default InteractiveAssistant; 
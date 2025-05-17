"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4"; // Restored import

// Path to your Live2D model's .model3.json file
// Make sure this path is correct and accessible from the public folder
const modelPath = "/live2d/阿米娅(1).model3.json"; // Path in the public folder

const MODEL_WIDTH = Math.round(300 * (2/3)); 
const MODEL_HEIGHT = Math.round(440 * (2/3)); 

const Live2DWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null); // Restored modelRef
  const hasInitializedRef = useRef(false); // Ref to track initialization

  useEffect(() => {
    let isMounted = true;
    console.log("[Live2D-Debug-SingleInit] useEffect triggered.");

    const initializePixi = async () => {
      if (hasInitializedRef.current && pixiAppRef.current) { // If already initialized by a previous effect run
        console.log("[Live2D-Debug-SingleInit] Already initialized by a previous effect run, skipping.");
        return;
      }
      if (!canvasRef.current) {
        console.error("[Live2D-Debug-SingleInit] Canvas element not found.");
        return;
      }
      // This check is technically redundant due to hasInitializedRef but kept for safety
      if (pixiAppRef.current) { 
        console.log("[Live2D-Debug-SingleInit] PixiJS App object already exists, skipping re-init (should be caught by hasInitializedRef).");
        return;
      }

      console.log("[Live2D-Debug-SingleInit] Initializing PixiJS app, loading model, and adding to stage...");

      try {
        if (!canvasRef.current) {
          console.error("[Live2D-Debug-SingleInit] Canvas element became null before Pixi app creation.");
          return;
        }

        const currentDevicePixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

        const app = new PIXI.Application({
          view: canvasRef.current,
          width: MODEL_WIDTH,
          height: MODEL_HEIGHT,
          backgroundAlpha: 0, 
          autoDensity: true, 
          resolution: currentDevicePixelRatio, 
        });
        pixiAppRef.current = app;
        console.log("[Live2D-Debug-SingleInit] PixiJS Application initialized:", app);

        console.log("[Live2D-Debug-SingleInit] Attempting to load Live2DModel from:", modelPath);
        const model = await Live2DModel.from(modelPath, { autoInteract: false }); // 必须禁用自动交互
        modelRef.current = model;
        console.log("[Live2D-Debug-SingleInit] Live2D Model loaded:", model);
        console.log(`[Live2D-Debug-SingleInit] Model original width: ${model.internalModel.width}, height: ${model.internalModel.height}`);

        // Restore: Add to stage, scale, and position
        model.anchor.set(0.5, 0.5);
        console.log("[Live2D-Debug-SingleInit] Model anchor set to 0.5, 0.5");

        if (pixiAppRef.current && pixiAppRef.current.stage) {
          pixiAppRef.current.stage.addChild(model as any);
        } else {
          console.error("[Live2D-Debug-SingleInit] Pixi app or stage is not available for addChild.");
          modelRef.current?.destroy();
          modelRef.current = null;
          pixiAppRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
          pixiAppRef.current = null;
          return; 
        }

        const canvasWidth = app.screen.width;
        const canvasHeight = app.screen.height;
        const scaleToFit = Math.min(canvasWidth / model.internalModel.width, canvasHeight / model.internalModel.height);
        const appliedScale = scaleToFit * 0.9; 
        (model as unknown as PIXI.Container).scale.set(appliedScale);
        console.log(`[Live2D-Debug-SingleInit] Calculated scaleToFit: ${scaleToFit}, applied scale: ${appliedScale}`);

        (model as unknown as PIXI.Container).x = canvasWidth / 2;
        (model as unknown as PIXI.Container).y = canvasHeight / 2;
        console.log(`[Live2D-Debug-SingleInit] Model position set to x: ${(model as unknown as PIXI.Container).x}, y: ${(model as unknown as PIXI.Container).y}`);
        
        console.log("[Live2D-Debug-SingleInit] Full setup complete.");
        hasInitializedRef.current = true; // Mark as initialized

      } catch (error) {
        console.error("[Live2D-Debug-SingleInit] Error during full setup:", error);
        modelRef.current?.destroy();
        modelRef.current = null;
        pixiAppRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
        pixiAppRef.current = null;
        hasInitializedRef.current = false; // Reset flag on error
      }
    };

    const cleanupPixi = () => {
      console.log("[Live2D-Debug-SingleInit] Cleanup triggered.");
      if (hasInitializedRef.current) { // Only cleanup if successfully initialized
        console.log("[Live2D-Debug-SingleInit] Performing cleanup of initialized resources...");
        if (modelRef.current && pixiAppRef.current && pixiAppRef.current.stage && pixiAppRef.current.stage.children.includes(modelRef.current as any)) {
          try {
            pixiAppRef.current.stage.removeChild(modelRef.current as any);
            console.log("[Live2D-Debug-SingleInit] Model removed from stage.");
          } catch (e) {
            console.error("[Live2D-Debug-SingleInit] Error removing model from stage:", e);
          }
        }
        modelRef.current?.destroy();
        modelRef.current = null;
        console.log("[Live2D-Debug-SingleInit] Live2D Model destroyed in cleanup.");
        
        pixiAppRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
        pixiAppRef.current = null;
        console.log("[Live2D-Debug-SingleInit] PixiJS Application destroyed in cleanup.");
        
        hasInitializedRef.current = false; // Reset flag after cleanup
        console.log("[Live2D-Debug-SingleInit] Cleanup of initialized resources complete.");
      } else {
        console.log("[Live2D-Debug-SingleInit] Skipping cleanup as not fully initialized or already cleaned up.");
      }
    };

    if (isMounted) {
        // In StrictMode (dev), this useEffect runs twice. 
        // The `hasInitializedRef` ensures `initializePixi`'s core logic only runs once.
        // The cleanup from the first run should ideally prepare for the second run, but that's the tricky part.
        // For now, we focus on making the *first* successful run display the model.
        initializePixi();
    }

    return () => {
      isMounted = false;
      console.log("[Live2D-Debug-SingleInit] Component unmounting, triggering cleanup...");
      cleanupPixi(); 
    };
  }, []);

  return (
    <div 
      style={{ 
        width: "100%",
        height: "100%",
        position: "relative",
       }}
      title="Amia-Debug-SingleInit"
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}/>
    </div>
  );
};

export default Live2DWidget;

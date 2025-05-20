"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";
import { useAssistant } from "../contexts/AssistantContext";

const Live2DWidget: React.FC = () => {
  const { currentAssistant } = useAssistant();
  const { modelPath, modelWidth: assistModelWidth, modelHeight: assistModelHeight } = currentAssistant;

  const MODEL_WIDTH = assistModelWidth || Math.round(300 * (2/3));
  const MODEL_HEIGHT = assistModelHeight || Math.round(440 * (2/3));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    console.log(`[Live2D-Debug] useEffect triggered for model: ${modelPath}. HasInit: ${hasInitializedRef.current}`);

    const initializePixi = async () => {
      let requiresDelay = false; // Flag to indicate if a delay is needed

      // If already initialized AND the model path hasn't changed, skip.
      // @ts-ignore
      if (hasInitializedRef.current && pixiAppRef.current && modelRef.current?.settings?.url === modelPath) { 
        console.log("[Live2D-Debug] Already initialized with the same model, skipping.");
        return;
      }
      // If initialized but model path IS different, cleanup first then proceed
      if (hasInitializedRef.current) {
        console.log("[Live2D-Debug] Model changed or re-init, performing cleanup before (re)initialization...");
        cleanupPixi(); // Call cleanup explicitly
        requiresDelay = true; // Mark that cleanup was performed, so a delay might be beneficial
      }

      if (!canvasRef.current) {
        console.error("[Live2D-Debug] Canvas element not found after potential cleanup.");
        return;
      }
      
      // If cleanup was just performed due to model change, introduce a small delay
      if (requiresDelay) {
        console.log("[Live2D-Debug] Delaying PIXI re-initialization slightly after cleanup.");
        await new Promise(resolve => setTimeout(resolve, 150)); // Increased delay to 150ms
        // Re-check canvas after delay
        if (!canvasRef.current) {
            console.error("[Live2D-Debug] Canvas element became null after 150ms delay. Aborting PIXI init.");
            hasInitializedRef.current = false; // Ensure we can try again if context changes
            return; // Abort if canvas disappeared
        }
        console.log("[Live2D-Debug] Canvas still valid after 150ms delay.");
      }

      // @ts-ignore
      if (pixiAppRef.current && modelRef.current?.settings?.url !== modelPath) { 
          console.log("[Live2D-Debug] PixiApp exists but model changed (checked again after potential delay), forcing cleanup if not already done.");
          if (!requiresDelay) cleanupPixi(); // Cleanup if not done before delay
          // This path might be redundant if the first cleanup for model change is robust
      } else if (pixiAppRef.current) {
          console.log("[Live2D-Debug] PixiApp object already exists and model same, should be caught by first check.");
          return;
      }

      console.log(`[Live2D-Debug] Initializing PixiJS for model: ${modelPath}, W: ${MODEL_WIDTH}, H: ${MODEL_HEIGHT}`);

      try {
        if (!canvasRef.current) {
          console.error("[Live2D-Debug] Canvas element became null before Pixi app creation.");
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
          forceCanvas: true,
        });
        pixiAppRef.current = app;
        console.log("[Live2D-Debug] PixiJS Application initialized:", app);

        console.log("[Live2D-Debug] Attempting to load Live2DModel from:", modelPath);
        if (!modelPath) {
            console.error("[Live2D-Debug] modelPath is undefined or empty. Cannot load model.");
            throw new Error("modelPath is undefined or empty.");
        }
        const model = await Live2DModel.from(modelPath, { autoInteract: false });
        modelRef.current = model;
        console.log("[Live2D-Debug] Live2D Model loaded:", model);
        console.log(`[Live2D-Debug] Model original width: ${model.internalModel.width}, height: ${model.internalModel.height}`);

        model.anchor.set(0.5, 0.5);
        console.log("[Live2D-Debug] Model anchor set to 0.5, 0.5");

        if (pixiAppRef.current && pixiAppRef.current.stage) {
          pixiAppRef.current.stage.addChild(model as any);
        } else {
          console.error("[Live2D-Debug] Pixi app or stage is not available for addChild.");
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
        console.log(`[Live2D-Debug] Calculated scaleToFit: ${scaleToFit}, applied scale: ${appliedScale}`);

        (model as unknown as PIXI.Container).x = canvasWidth / 2;
        (model as unknown as PIXI.Container).y = canvasHeight / 2;
        console.log(`[Live2D-Debug] Model position set to x: ${(model as unknown as PIXI.Container).x}, y: ${(model as unknown as PIXI.Container).y}`);
        
        console.log("[Live2D-Debug] Full setup complete for model:", modelPath);
        hasInitializedRef.current = true; 

      } catch (error) {
        console.error(`[Live2D-Debug] Error during full setup for model ${modelPath}:`, error);
        modelRef.current?.destroy();
        modelRef.current = null;
        pixiAppRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
        pixiAppRef.current = null;
        hasInitializedRef.current = false; 
      }
    };

    const cleanupPixi = () => {
      // @ts-ignore
      console.log(`[Live2D-Debug] Cleanup triggered for model: ${modelRef.current?.settings?.url || 'N/A'}. HasInit: ${hasInitializedRef.current}`);
      if (hasInitializedRef.current) { 
        console.log("[Live2D-Debug] Performing cleanup of initialized resources...");
        if (modelRef.current && pixiAppRef.current && pixiAppRef.current.stage && pixiAppRef.current.stage.children.includes(modelRef.current as any)) {
          try {
            pixiAppRef.current.stage.removeChild(modelRef.current as any);
            console.log("[Live2D-Debug] Model removed from stage.");
          } catch (e) {
            console.error("[Live2D-Debug] Error removing model from stage:", e);
          }
        }
        modelRef.current?.destroy();
        modelRef.current = null;
        console.log("[Live2D-Debug] Live2D Model destroyed in cleanup.");
        
        pixiAppRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
        pixiAppRef.current = null;
        console.log("[Live2D-Debug] PixiJS Application destroyed in cleanup.");
        
        hasInitializedRef.current = false; 
        console.log("[Live2D-Debug] Cleanup of initialized resources complete. HasInit reset.");
      } else {
        console.log("[Live2D-Debug] Skipping cleanup as not fully initialized or already cleaned up.");
      }
    };

    if (isMounted) {
        initializePixi();
    }

    return () => {
      isMounted = false;
      console.log(`[Live2D-Debug] Component unmounting or deps changed for ${modelPath}, triggering cleanup...`);
      cleanupPixi(); 
    };
  }, [modelPath, MODEL_WIDTH, MODEL_HEIGHT]);

  return (
    <div 
      style={{ 
        width: "100%",
        height: "100%",
        position: "relative",
       }}
      title={`AssistantModel-${currentAssistant.id}`}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}/>
    </div>
  );
};

export default Live2DWidget;


"use client";

import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display";

// Ensure PIXI is available on window for pixi-live2d-display to work
if (typeof window !== "undefined") {
  (window as any).PIXI = PIXI;
}

// Path to your Live2D model's .model3.json file
// Make sure this path is correct and accessible from the public folder
const modelPath = "/live2d/阿米娅(1).model3.json"; // Path in the public folder

const Live2DWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<Live2DModel | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("[Live2D] useEffect: Initializing or cleaning up...");

    const initializePixi = async () => {
      if (!canvasRef.current) {
        console.error("[Live2D] Canvas element not found.");
        return;
      }
      if (pixiAppRef.current) {
        console.log("[Live2D] PixiJS App already initialized, skipping re-init.");
        return;
      }

      console.log("[Live2D] Initializing PixiJS app and Live2D model (v6 style)..." + modelPath);

      try {
        const app = new PIXI.Application({
          view: canvasRef.current,
          width: 300,
          height: 440,
          transparent: true, // For PixiJS v6.x
          // backgroundAlpha: 0, // Use this for PixiJS v7+ if transparent is deprecated
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });
        pixiAppRef.current = app;
        console.log("[Live2D] PixiJS Application initialized (v6 style):", app);

        // Load the Live2D model, with autoInteract: false
        const model = await Live2DModel.from(modelPath, { autoInteract: false });
        modelRef.current = model;
        console.log("[Live2D] Live2D Model loaded (autoInteract: false):", model);
        console.log(`[Live2D] Model original width: ${model.width}, height: ${model.height}`);

        // Set anchor to the center of the model
        model.anchor.set(0.5, 0.5);
        console.log("[Live2D] Model anchor set to 0.5, 0.5");

        app.stage.addChild(model as any);

        const canvasWidth = app.screen.width;
        const canvasHeight = app.screen.height;
        
        const scaleToFit = Math.min(canvasWidth / model.width, canvasHeight / model.height);
        // Apply a 0.9 factor to add some padding, adjust as needed
        const appliedScale = scaleToFit * 0.9; 
        model.scale.set(appliedScale);
        
        console.log(`[Live2D] Calculated scaleToFit: ${scaleToFit}, applied scale: ${appliedScale}`);

        model.x = canvasWidth / 2;
        model.y = canvasHeight / 2;
        console.log(`[Live2D] Model position set to x: ${model.x}, y: ${model.y}`);
        
        // Since autoInteract is false, the built-in hit testing is disabled.
        // If you need custom interactions, you would set them up here.
        // For example, making the whole canvas clickable to trigger a random motion:
        /*
        if (canvasRef.current) {
          canvasRef.current.addEventListener('click', () => {
            if (modelRef.current) {
              // Attempt to play a random motion if available
              // modelRef.current.motion('Idle'); // Replace 'Idle' with actual motion group if known
              console.log("[Live2D] Canvas clicked, model might play a motion if defined.");
            }
          });
        }
        */

        console.log("[Live2D] Model setup complete.");

      } catch (error) {
        console.error("[Live2D] Error during PixiJS/Live2D initialization:", error);
        if (pixiAppRef.current) {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
          pixiAppRef.current = null;
        }
      }
    };

    const cleanupPixi = () => {
      console.log("[Live2D] Cleaning up PixiJS app and Live2D model...");
      if (modelRef.current && pixiAppRef.current?.stage?.children.includes(modelRef.current as any)) {
        try {
          pixiAppRef.current.stage.removeChild(modelRef.current as any);
          console.log("[Live2D] Model removed from stage.");
        } catch (e) {
          console.error("[Live2D] Error removing model from stage:", e);
        }
      }
      if (modelRef.current) {
        try {
          modelRef.current.destroy(); 
          modelRef.current = null;
          console.log("[Live2D] Model destroyed.");
        } catch (e) {
          console.error("[Live2D] Error destroying model:", e);
        }
      }
      if (pixiAppRef.current) {
        try {
          pixiAppRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
          pixiAppRef.current = null;
          console.log("[Live2D] PixiJS Application destroyed.");
        } catch (e) {
          console.error("[Live2D] Error destroying PixiJS App:", e);
        }
      }
      console.log("[Live2D] Cleanup attempt complete.");
    };

    if (isMounted) {
      initializePixi();
    }

    return () => {
      isMounted = false;
      console.log("[Live2D] Component unmounting, starting cleanup...");
      cleanupPixi();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return (
    <div 
      style={{ 
        position: "fixed", 
        left: "10px", 
        bottom: "0px", 
        zIndex: 1000, // Ensure it's above most other content
        width: "300px", // Desired width of the Live2D widget
        height: "440px", // Desired height of the Live2D widget
        // border: "1px solid red" // Optional: for debugging container bounds
       }}
      title="Amia" // Added a title for accessibility/hover info
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}/>
    </div>
  );
};

export default Live2DWidget;

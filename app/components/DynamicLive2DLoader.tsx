"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Placeholder for Live2DWidget until it's loaded
const Live2DWidgetPlaceholder = () => <div style={{width: '150px', height: '220px', position: 'fixed', left: '10px', bottom: '0px', zIndex: 999, border: '1px dashed grey'}} />;

// Dynamically import Live2DWidget
const Live2DWidget = dynamic(() => import('./Live2DWidget'), {
  ssr: false,
  loading: () => <Live2DWidgetPlaceholder />
});

const DynamicLive2DLoader = () => {
  const [cubism2RuntimeReady, setCubism2RuntimeReady] = useState(false);
  const [cubismCoreRuntimeReady, setCubismCoreRuntimeReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    console.log("[DynamicLoader] useEffect: Initiating Cubism runtimes loading...");

    const loadScript = (id: string, src: string, checkGlobal: string, onReady: () => void, onError: (msg: string) => void) => {
      if (typeof window === 'undefined') {
        console.warn(`[DynamicLoader] Window not defined, cannot load ${src}`);
        onError(`Window not defined for ${src}`);
        return;
      }

      if ((window as any)[checkGlobal]) {
        console.log(`[DynamicLoader] Runtime ${checkGlobal} already detected.`);
        onReady();
        return;
      }

      if (document.getElementById(id)) {
        console.log(`[DynamicLoader] Script tag ${id} already exists. Polling for ${checkGlobal}...`);
        let attempts = 0;
        const maxAttempts = 60; // 6 seconds
        const interval = setInterval(() => {
          attempts++;
          if ((window as any)[checkGlobal]) {
            console.log(`[DynamicLoader] Runtime ${checkGlobal} detected after polling.`);
            clearInterval(interval);
            onReady();
          } else if (attempts >= maxAttempts) {
            console.error(`[DynamicLoader] Runtime ${checkGlobal} did not load after script tag existed and polling.`);
            clearInterval(interval);
            onError(`Polling timeout for ${checkGlobal}`);
          }
        }, 100);
        return;
      }

      console.log(`[DynamicLoader] Loading runtime ${src} as ${checkGlobal}...`);
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        if ((window as any)[checkGlobal]) {
          console.log(`[DynamicLoader] Runtime ${src} loaded successfully via onload and ${checkGlobal} is available.`);
          onReady();
        } else {
          console.error(`[DynamicLoader] Runtime ${src} loaded via onload, but ${checkGlobal} is NOT available.`);
          onError(`${checkGlobal} not available after onload for ${src}`);
        }
      };
      script.onerror = (event: Event | string) => {
        console.error(`[DynamicLoader] Failed to load runtime ${src}:`, event);
        onError(`Failed to load ${src}`);
      };
      document.body.appendChild(script);
    };

    // Load Cubism 2 Runtime (live2d.min.js)
    loadScript(
      'cubism2-runtime-script',
      'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/live2d.min.js',
      'L2Dwidget',
      () => {
        console.log("[DynamicLoader] Cubism 2 (L2Dwidget) reported as ready by loadScript.");
        if (isMounted) setCubism2RuntimeReady(true);
      },
      (errMsg) => {
        console.error("[DynamicLoader C2 Error]", errMsg);
        console.log("[DynamicLoader] Even though L2Dwidget might not be defined, setting Cubism2RuntimeReady to true for leniency.");
        if (isMounted) setCubism2RuntimeReady(true);
      }
    );

    // Load Cubism Core Runtime (live2dcubismcore.min.js)
    // This will be triggered after the Cubism 2 attempt or in parallel if independent logic is desired
    // For now, let's assume they can load somewhat independently, but the widget waits for both.
    loadScript(
      'cubism-core-runtime-script',
      'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      'Live2DCubismCore',
      () => { if (isMounted) setCubismCoreRuntimeReady(true); },
      (errMsg) => console.error("[DynamicLoader Core Error]", errMsg)
    );

    return () => {
      isMounted = false;
      console.log("[DynamicLoader] Unmounting or re-running effect.");
    };
  }, []); // Runs once on mount

  if (!cubism2RuntimeReady || !cubismCoreRuntimeReady) {
    let statusMessage = "Runtimes not ready: ";
    if (!cubism2RuntimeReady) statusMessage += "Cubism2 (L2Dwidget) loading... ";
    if (!cubismCoreRuntimeReady) statusMessage += "CubismCore (Live2DCubismCore) loading...";
    console.log(`[DynamicLoader] ${statusMessage.trim()}, rendering placeholder.`);
    return <Live2DWidgetPlaceholder />;
  }

  console.log("[DynamicLoader] Both Cubism 2 and Cubism Core runtimes ready, rendering Live2DWidget.");
  return <Live2DWidget />;
};

export default DynamicLive2DLoader;
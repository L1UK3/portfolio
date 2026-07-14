import React, { useEffect, useRef } from 'react';
import type { VisualizerMode } from '../types';
import {
  drawOscilloscope,
  drawFrequencyBars,
  drawCircularWave,
  drawWaterfallSpectrogram
} from './visualizers/canvasRenderers';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  frequencyDataRef: React.RefObject<Uint8Array>;
  timeDomainDataRef: React.RefObject<Uint8Array>;
  sensitivity: number;
  speed: number;
  density: number;
  isWireframe: boolean;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  mode,
  frequencyDataRef,
  timeDomainDataRef,
  sensitivity,
  speed,
  density,
  isWireframe
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Peak-hold storage for FrequencyBars component (persisted between frames)
  const peakArrayRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle high-craft Retina/DPI screen scaling
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Adjust canvas backing resolution
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Reset context scaling
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      // If switching modes, clear canvas
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    // Initialize size and listen to changes
    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(container);

    const renderLoop = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const freqs = frequencyDataRef.current;
      const times = timeDomainDataRef.current;

      if (freqs && times && w > 0 && h > 0) {
        switch (mode) {
          case 'waveform':
            drawOscilloscope(ctx, times, w, h, sensitivity, isWireframe);
            break;
          case 'frequency':
            drawFrequencyBars(ctx, freqs, w, h, sensitivity, density, isWireframe, peakArrayRef);
            break;
          case 'circle':
            drawCircularWave(ctx, freqs, times, w, h, sensitivity, density, isWireframe);
            break;
          case 'waterfall':
            drawWaterfallSpectrogram(ctx, canvas, freqs, canvas.width, canvas.height, sensitivity, speed, isWireframe);
            break;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [mode, frequencyDataRef, timeDomainDataRef, sensitivity, speed, density, isWireframe]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-[#0a0a0c] flex items-center justify-center overflow-hidden"
    >
      {/* 2D Canvas Screen */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block z-0" 
      />

      {/* Retro CRT Scanline Bezel Overlay (Hallmark aesthetic) */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px]" />
      
      {/* Master Viewport Overlay Grid Frame */}
      <div className="absolute inset-0 border border-neutral-800/40 pointer-events-none rounded-lg z-20" />
    </div>
  );
};

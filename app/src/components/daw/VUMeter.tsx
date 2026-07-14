import React, { useEffect, useRef } from 'react';

interface VUMeterProps {
  vuLevelRef: React.RefObject<number>; // Real-time decibels ref (-60 to 0)
}

export const VUMeter: React.FC<VUMeterProps> = ({ vuLevelRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peakLevelRef = useRef<number>(-60);
  const peakHoldTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina High-DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Hardware LED Meter Geometry Configuration
    const numSegments = 16;
    const segmentGap = 1.5;
    const segmentHeight = (height - (numSegments - 1) * segmentGap) / numSegments;

    let frameId: number;

    const render = () => {
      const db = vuLevelRef.current ?? -60;

      // Update Peak-Hold decay
      if (db >= peakLevelRef.current) {
        peakLevelRef.current = db;
        peakHoldTimeRef.current = 30; // Hold peak for 30 frames (~500ms)
      } else {
        if (peakHoldTimeRef.current > 0) {
          peakHoldTimeRef.current--;
        } else {
          // Slow peak-decay
          peakLevelRef.current = Math.max(-60, peakLevelRef.current - 1.2);
        }
      }

      // Draw background panel
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      // Loop from bottom (index 0, low volume) to top (index 15, high volume/clipping)
      for (let i = 0; i < numSegments; i++) {
        // Map segment index to decibel threshold
        // Bottom is -60dB, top is 0dB
        const segmentDb = -60 + (i / (numSegments - 1)) * 60;
        const isActive = db >= segmentDb;

        // Choose segment color: Green (-60 to -12), Orange (-12 to -3), Red (-3 to 0)
        let ledColor = '#1f2937'; // Default inactive slate
        
        if (isActive) {
          if (segmentDb >= -3) {
            ledColor = '#ef4444'; // Clip Red
          } else if (segmentDb >= -15) {
            ledColor = '#f97316'; // Warning Orange
          } else {
            ledColor = '#22c55e'; // Active Green
          }
        }

        // Draw LED bar segment
        const y = height - (i + 1) * (segmentHeight + segmentGap) + segmentGap;
        ctx.fillStyle = ledColor;
        
        // Add subtle neon glow to active segments
        if (isActive) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = ledColor;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(0, y, width, segmentHeight);
      }

      // Draw Peak-Hold marker
      ctx.shadowBlur = 0;
      const peakIndex = Math.floor(((peakLevelRef.current + 60) / 60) * (numSegments - 1));
      if (peakIndex >= 0 && peakIndex < numSegments) {
        const peakY = height - (peakIndex + 1) * (segmentHeight + segmentGap) + segmentGap;
        let peakColor = '#22c55e';
        if (peakLevelRef.current >= -3) {
          peakColor = '#ef4444';
        } else if (peakLevelRef.current >= -15) {
          peakColor = '#f97316';
        }
        ctx.fillStyle = peakColor;
        ctx.fillRect(0, peakY, width, 1.5);
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [vuLevelRef]);

  return (
    <div className="w-[8px] h-full border border-neutral-950 rounded bg-neutral-950 overflow-hidden relative shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

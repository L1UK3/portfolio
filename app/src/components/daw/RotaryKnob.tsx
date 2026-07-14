import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RotaryKnobProps {
  value: number; // Current parameter value
  min: number;
  max: number;
  onChange: (val: number) => void;
  defaultValue?: number;
  label: string;
  size?: number; // Dial diameter in pixels
  unit?: string;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  value,
  min,
  max,
  onChange,
  defaultValue = 0,
  label,
  size = 46,
  unit = ''
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  // Map value to degrees: -135deg (min) to +135deg (max)
  const range = max - min;
  const percentage = (value - min) / range;
  const degrees = -135 + percentage * 270;

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    knobRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    // Y-axis delta: dragging up increases, dragging down decreases
    const deltaY = startYRef.current - e.clientY;
    
    // Sensitivity: 150px of vertical drag spans full range
    const travelDistance = 150;
    const valueDelta = (deltaY / travelDistance) * range;
    const targetVal = Math.max(min, Math.min(max, startValRef.current + valueDelta));
    
    onChange(targetVal);
  }, [isDragging, min, max, onChange, range]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    knobRef.current?.releasePointerCapture(e.pointerId);
  }, [isDragging]);

  // Register global pointer listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Handle Double Click to reset to default value
  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  // Keyboard navigation support (Accessibility)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = range * 0.05; // 5% increments
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      onChange(Math.min(max, value + step));
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      onChange(Math.max(min, value - step));
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center select-none font-mono text-[9px] w-14">
      {/* Knob Label */}
      <span className="text-neutral-500 uppercase tracking-widest text-[8px] mb-1 truncate max-w-full">
        {label}
      </span>

      {/* Tactile Rotary Body */}
      <div
        ref={knobRef}
        className={cn(
          "relative rounded-full border border-neutral-950 bg-neutral-900 shadow-inner flex items-center justify-center cursor-ns-resize focus:outline-none focus:ring-1 focus:ring-primary/50",
          isDragging && "ring-1 ring-primary/55 border-neutral-800"
        )}
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        {/* Rotating Cap Plate */}
        <div
          className="absolute inset-[3px] rounded-full border border-neutral-800 bg-radial from-neutral-800 to-neutral-900 shadow-inner"
          style={{ transform: `rotate(${degrees}deg)` }}
        >
          {/* Indicator Dot (LED Cyan Notch) */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary shadow-[0_0_3px_#06b6d4]" />
        </div>
      </div>

      {/* Digital Numeric Display */}
      <span className="mt-1 text-primary text-[8px] font-bold">
        {value.toFixed(1)}
        <span className="text-neutral-600 font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  );
};

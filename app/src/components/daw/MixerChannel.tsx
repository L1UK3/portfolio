import React from 'react';
import { RotaryKnob } from './RotaryKnob';
import { VUMeter } from './VUMeter';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { EQConfig } from '../../types';

interface MixerChannelProps {
  label: string;
  subLabel?: string;
  isMaster?: boolean;
  
  // Volume & VU
  volume: number;
  onVolumeChange: (val: number) => void;
  vuLevelRef: React.RefObject<number>;
  
  // Panning & EQ (Only for non-master channels)
  pan?: number;
  onPanChange?: (val: number) => void;
  eq?: EQConfig;
  onEQChange?: (eqType: keyof EQConfig, val: number) => void;
  
  // Mute / Solo (Only for non-master channels)
  isMuted?: boolean;
  onMuteToggle?: () => void;
  isSoloed?: boolean;
  onSoloToggle?: () => void;
  
  // Track selection (Only for non-master channels)
  isActive?: boolean;
  onActivate?: () => void;
}

export const MixerChannel: React.FC<MixerChannelProps> = ({
  label,
  subLabel,
  isMaster = false,
  volume,
  onVolumeChange,
  vuLevelRef,
  pan = 0,
  onPanChange,
  eq = { lowGain: 0, midGain: 0, highGain: 0 },
  onEQChange,
  isMuted = false,
  onMuteToggle,
  isSoloed = false,
  onSoloToggle,
  isActive = false,
  onActivate
}) => {
  return (
    <div className={`w-[96px] bg-neutral-900 border border-neutral-950 rounded flex flex-col items-center py-2 px-1 select-none font-mono text-[9px] relative ${
      isActive && !isMaster ? 'ring-1 ring-primary/40 border-neutral-800' : ''
    }`}>
      
      {/* Active channel header label */}
      <div 
        onClick={!isMaster ? onActivate : undefined}
        className={`w-full text-center py-0.5 rounded cursor-pointer transition-colors ${
          isMaster 
            ? 'bg-neutral-950 text-neutral-300 font-bold' 
            : isActive 
              ? 'bg-primary/20 text-primary font-bold' 
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300'
        }`}
      >
        {label}
      </div>
      
      {/* Interactive Controls (Bypassed on Master) */}
      {!isMaster ? (
        <div className="flex flex-col items-center gap-1.5 mt-2 w-full">
          
          {/* Panning Dial */}
          <RotaryKnob
            label="PAN"
            min={-1}
            max={1}
            value={pan}
            onChange={onPanChange || (() => {})}
            defaultValue={0}
            size={24}
          />

          {/* EQ Dials */}
          <div className="flex flex-col items-center gap-1 border-t border-neutral-850 pt-1.5 w-full">
            <RotaryKnob
              label="HIGH"
              min={-12}
              max={12}
              value={eq.highGain}
              onChange={(val) => onEQChange?.('highGain', val)}
              defaultValue={0}
              unit="dB"
              size={24}
            />
            <RotaryKnob
              label="MID"
              min={-12}
              max={12}
              value={eq.midGain}
              onChange={(val) => onEQChange?.('midGain', val)}
              defaultValue={0}
              unit="dB"
              size={24}
            />
            <RotaryKnob
              label="LOW"
              min={-12}
              max={12}
              value={eq.lowGain}
              onChange={(val) => onEQChange?.('lowGain', val)}
              defaultValue={0}
              unit="dB"
              size={24}
            />
          </div>

          {/* Mute & Solo Buttons */}
          <div className="flex gap-1 border-t border-neutral-850 pt-1.5 w-full justify-center">
            {/* Solo */}
            <Button
              size="sm"
              variant="outline"
              onClick={onSoloToggle}
              className={`h-4 text-[7px] px-1 font-bold rounded ${
                isSoloed 
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 hover:bg-amber-600' 
                  : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border-neutral-950'
              }`}
            >
              S
            </Button>

            {/* Mute */}
            <Button
              size="sm"
              variant="outline"
              onClick={onMuteToggle}
              className={`h-4 text-[7px] px-1 font-bold rounded ${
                isMuted 
                  ? 'bg-red-500 text-neutral-950 border-red-500 hover:bg-red-600' 
                  : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border-neutral-950'
              }`}
            >
              M
            </Button>
          </div>

        </div>
      ) : (
        // Master Strip spacer/placeholder
        <div className="flex-grow flex items-center justify-center text-neutral-700 text-[8px] uppercase tracking-widest font-bold rotate-90 my-16 select-none font-mono">
          Master Out
        </div>
      )}

      {/* Fader Console & VU Meter Grid */}
      <div className="flex h-36 gap-2 mt-2 w-full justify-center border-t border-neutral-850 pt-2 relative">
        
        {/* dB Fader Grids markings */}
        <div className="flex flex-col justify-between text-[6px] text-neutral-600 h-full font-mono font-bold select-none pr-1">
          <span>+6</span>
          <span>0</span>
          <span>-6</span>
          <span>-18</span>
          <span>-36</span>
          <span>-oo</span>
        </div>

        {/* Volume Fader Slider */}
        <div className="h-full flex items-center justify-center">
          <Slider
            orientation="vertical"
            value={[volume * 100]}
            onValueChange={(val: any) => onVolumeChange(val[0] / 100)}
            min={0}
            max={isMaster ? 150 : 120} // Master fader can boost +6dB (1.5 multiplier)
            step={1}
            className="h-full cursor-ns-resize"
          />
        </div>

        {/* VU Level Segment Meter */}
        <div className="h-full">
          <VUMeter vuLevelRef={vuLevelRef} />
        </div>

      </div>

      {/* Sublabel descriptor */}
      <div className="text-[7px] text-neutral-500 uppercase tracking-widest mt-1.5 text-center truncate max-w-full font-mono">
        {isMaster ? 'MAIN LR' : subLabel || 'TRACK'}
      </div>

    </div>
  );
};

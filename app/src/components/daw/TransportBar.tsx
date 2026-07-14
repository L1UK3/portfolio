import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Info, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DEMO_TRACKS } from '../../hooks/useAudioAnalyser';

interface TransportBarProps {
  isPlaying: boolean;
  currentTime: number;
  currentTrackIndex: number;
  bpm: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  audioContextState?: string;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  currentTime,
  currentTrackIndex,
  bpm,
  play,
  pause,
  stop
}) => {
  const [tempoBlink, setTempoBlink] = useState(false);

  // Format time to 00:00.00 (minutes:seconds.centiseconds)
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const cents = Math.floor((time % 1) * 100);
    
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');
    const cStr = cents.toString().padStart(2, '0');
    
    return `${mStr}:${sStr}.${cStr}`;
  };

  // Tempo Blinker loop reflecting BPM
  useEffect(() => {
    const intervalMs = (60 / bpm) * 1000;
    
    const interval = setInterval(() => {
      setTempoBlink(true);
      setTimeout(() => setTempoBlink(false), 80);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [bpm]);

  return (
    <header className="bg-neutral-950 border-b-2 border-neutral-900 py-3 px-4 flex items-center justify-between font-mono shrink-0 select-none shadow-md z-10">
      
      {/* DAW Title / Brand */}
      <div className="flex items-center gap-3">
        <Activity className="size-5 text-primary animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[12px] font-bold tracking-widest text-neutral-100 uppercase">
            WAV-ANALYS.2D
          </span>
          <span className="text-[7px] text-neutral-500 tracking-[0.25em] uppercase font-bold">
            Interactive Portfolio Console
          </span>
        </div>
      </div>

      {/* Center Console: Playback Controls */}
      <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded p-1 shadow-inner px-2.5">
        
        {/* Buttons */}
        <div className="flex items-center gap-1 border-r border-neutral-800 pr-2">
          {/* Play */}
          <Button
            size="icon"
            variant="ghost"
            onClick={play}
            className={`size-6 hover:bg-neutral-800 ${isPlaying ? 'text-primary' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            <Play className="size-3.5 fill-current" />
          </Button>

          {/* Pause */}
          <Button
            size="icon"
            variant="ghost"
            onClick={pause}
            className={`size-6 hover:bg-neutral-800 ${!isPlaying && currentTime > 0 ? 'text-primary' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            <Pause className="size-3.5 fill-current" />
          </Button>

          {/* Stop */}
          <Button
            size="icon"
            variant="ghost"
            onClick={stop}
            className="size-6 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          >
            <Square className="size-3 fill-current" />
          </Button>
        </div>

        {/* Digital Time Indicator */}
        <div className="flex flex-col items-end w-20 border-r border-neutral-800 pr-3.5">
          <span className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">
            TIMELINE
          </span>
          <span className="text-[13px] text-primary font-bold tabular-nums font-mono leading-none mt-0.5">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* BPM & Blink LED */}
        <div className="flex items-center gap-2 pl-1.5">
          <div className="flex flex-col items-start w-12">
            <span className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">
              TEMPO
            </span>
            <span className="text-[12px] text-neutral-300 font-bold tabular-nums mt-0.5 leading-none">
              {bpm}
              <span className="text-[7px] text-neutral-600 font-normal ml-0.5">BPM</span>
            </span>
          </div>

          {/* Blinker LED */}
          <div
            className={`size-2.5 rounded-full border border-neutral-950 transition-all duration-75 ${
              tempoBlink
                ? 'bg-primary shadow-[0_0_6px_#06b6d4] scale-105'
                : 'bg-neutral-800 shadow-none'
            }`}
          />
        </div>

      </div>

      {/* Right Console: Track Indicator & VST Info */}
      <div className="flex items-center gap-3">
        
        {/* Current Active Track Display */}
        <div className="flex flex-col items-end pr-2 border-r border-neutral-800">
          <span className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">
            CURRENT FEED
          </span>
          <Badge
            variant="outline"
            className="bg-neutral-900 border-neutral-800 text-[9px] text-primary py-0.5 px-2 mt-0.5"
          >
            {DEMO_TRACKS[currentTrackIndex].title}
          </Badge>
        </div>

        {/* User Info Help Button (Dialog) */}
        <Dialog>
          <DialogTrigger
            className="size-7 bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-neutral-200 flex items-center justify-center rounded cursor-pointer transition-colors"
          >
            <Info className="size-4" />
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-2 border-neutral-950 text-neutral-200 max-w-sm rounded-lg shadow-2xl p-5">
            <DialogHeader>
              <DialogTitle className="text-sm font-mono tracking-widest text-primary uppercase">
                Workstation Instructions
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 mt-2 font-sans leading-relaxed">
                Welcome to the 2D Wavelength and Frequency Analyser Portfolio. 
                <br /><br />
                *   **Mixer Channel Knobs:** Drag up or down on the dials to adjust High, Mid, Low frequencies, and Stereo Panning. Double-click to reset back to center values.
                *   **BPM Blink LED:** Indicates tempo beat coordinates.
                *   **Media Tree Browser:** Expand folders to view my resume and application briefs styled as VST Rack plug-ins. Bypassing a VST mimics hardware shutdowns!
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

      </div>
    </header>
  );
};

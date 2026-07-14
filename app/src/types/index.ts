export type VisualizerMode = 'waveform' | 'frequency' | 'circle' | 'waterfall';
export type PaletteName = 'cyan-glow' | 'sunset-neon' | 'mono-chrome' | 'emerald-gold';

export interface EQConfig {
  lowGain: number;   // -12dB to +12dB
  midGain: number;   // -12dB to +12dB
  highGain: number;  // -12dB to +12dB
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  bpm: number;
}

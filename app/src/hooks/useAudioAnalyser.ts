import { useEffect, useRef, useState, useCallback } from 'react';
import type { EQConfig, VisualizerMode, AudioTrack } from '../types';

export const DEMO_TRACKS: AudioTrack[] = [
  { id: 'track1', title: 'Midnight City', artist: 'M83', src: 'audio/track1.mp3', bpm: 105 },
  { id: 'track2', title: 'Retro Groove', artist: 'Synthwave', src: 'audio/track2.mp3', bpm: 120 }
];

export const useAudioAnalyser = () => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [bpm, setBpm] = useState(DEMO_TRACKS[0].bpm);

  // Audio Node volumes
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [channelVolumes, setChannelVolumes] = useState<number[]>([0.7, 0.7]);
  const [channelMutes, setChannelMutes] = useState<boolean[]>([false, false]);
  const [channelSolos, setChannelSolos] = useState<boolean[]>([false, false]);
  const [channelPans, setChannelPans] = useState<number[]>([0, 0]); // -1 (Left) to 1 (Right)

  // Visualizer configuration
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('waveform');

  // Equalizer gains (-12dB to 12dB)
  const [channelEQs, setChannelEQs] = useState<EQConfig[]>([
    { lowGain: 0, midGain: 0, highGain: 0 },
    { lowGain: 0, midGain: 0, highGain: 0 }
  ]);

  // Web Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementsRef = useRef<(HTMLAudioElement | null)[]>([]);
  const sourceNodesRef = useRef<(MediaElementAudioSourceNode | null)[]>([]);
  const gainNodesRef = useRef<(GainNode | null)[]>([]);
  const panNodesRef = useRef<(StereoPannerNode | null)[]>([]);

  // EQ Node Refs (Low / Mid / High Biquad filters per channel)
  const eqLowNodesRef = useRef<(BiquadFilterNode | null)[]>([]);
  const eqMidNodesRef = useRef<(BiquadFilterNode | null)[]>([]);
  const eqHighNodesRef = useRef<(BiquadFilterNode | null)[]>([]);
  const masterGainNodeRef = useRef<GainNode | null>(null);

  // Dynamic binary buffers (References read by canvas visualizer at 60fps)
  const frequencyDataRef = useRef<Uint8Array>(new Uint8Array(0));
  const timeDomainDataRef = useRef<Uint8Array>(new Uint8Array(0));

  // Decibel meters refs (Updated on frame callback, read by VU canvas meters)
  const masterVULevelRef = useRef<number>(-60);
  const channelVULevelsRef = useRef<number[]>([-60, -60]);

  // Track time update events
  useEffect(() => {
    const activeAudio = audioElementsRef.current[currentTrackIndex];
    if (!activeAudio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(activeAudio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(activeAudio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    activeAudio.addEventListener('timeupdate', handleTimeUpdate);
    activeAudio.addEventListener('durationchange', handleDurationChange);
    activeAudio.addEventListener('ended', handleEnded);

    return () => {
      activeAudio.removeEventListener('timeupdate', handleTimeUpdate);
      activeAudio.removeEventListener('durationchange', handleDurationChange);
      activeAudio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  // Audio nodes initializer graph
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;

    // Create browser audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Create visualizer analyser node
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256; // Fine FFT size for 2D rendering speed
    analyserRef.current = analyser;

    // Allocate binary data arrays
    frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    timeDomainDataRef.current = new Uint8Array(analyser.fftSize);

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    masterGainNodeRef.current = masterGain;

    // Connect master gain to analyser and destination
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Set up channel subgraphs
    DEMO_TRACKS.forEach((_, index) => {
      const audio = audioElementsRef.current[index];
      if (!audio) return;

      const source = ctx.createMediaElementSource(audio);
      sourceNodesRef.current[index] = source;

      // Channel Gain
      const channelGain = ctx.createGain();
      channelGain.gain.value = channelMutes[index] ? 0 : channelVolumes[index];
      gainNodesRef.current[index] = channelGain;

      // Stereo Panner
      const panner = ctx.createStereoPanner();
      panner.pan.value = channelPans[index];
      panNodesRef.current[index] = panner;

      // Equalizer nodes: Biquad Filters
      const lowFilter = ctx.createBiquadFilter();
      lowFilter.type = 'lowshelf';
      lowFilter.frequency.value = 250; // Bass frequency floor
      lowFilter.gain.value = channelEQs[index].lowGain;
      eqLowNodesRef.current[index] = lowFilter;

      const midFilter = ctx.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.Q.value = 1.0;
      midFilter.frequency.value = 1000; // Mids frequency range
      midFilter.gain.value = channelEQs[index].midGain;
      eqMidNodesRef.current[index] = midFilter;

      const highFilter = ctx.createBiquadFilter();
      highFilter.type = 'highshelf';
      highFilter.frequency.value = 4000; // Highs frequency range
      highFilter.gain.value = channelEQs[index].highGain;
      eqHighNodesRef.current[index] = highFilter;

      // Route: Source -> Low EQ -> Mid EQ -> High EQ -> Pan -> Gain -> MasterGain
      source
        .connect(lowFilter)
        .connect(midFilter)
        .connect(highFilter)
        .connect(panner)
        .connect(channelGain)
        .connect(masterGain);
    });
  }, [masterVolume, channelVolumes, channelMutes, channelPans, channelEQs]);

  // Master Volume controller
  const setMasterVolumeLevel = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1.5, val));
    setMasterVolume(clamped);
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.setValueAtTime(clamped, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Transport commands
  const play = useCallback(async () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }

    const activeAudio = audioElementsRef.current[currentTrackIndex];
    if (activeAudio) {
      // Pause all other tracks to avoid overlays
      audioElementsRef.current.forEach((el, idx) => {
        if (idx !== currentTrackIndex && el) {
          el.pause();
        }
      });

      activeAudio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio Context playback error:", err);
      });
    }
  }, [currentTrackIndex, initAudio]);

  const pause = useCallback(() => {
    const activeAudio = audioElementsRef.current[currentTrackIndex];
    if (activeAudio) {
      activeAudio.pause();
    }
    setIsPlaying(false);
  }, [currentTrackIndex]);

  const stop = useCallback(() => {
    const activeAudio = audioElementsRef.current[currentTrackIndex];
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentTrackIndex]);

  const selectTrack = useCallback((index: number) => {
    const wasPlaying = isPlaying;
    stop();
    setCurrentTrackIndex(index);
    setBpm(DEMO_TRACKS[index].bpm);

    if (wasPlaying) {
      setTimeout(() => {
        if (!audioContextRef.current) {
          initAudio();
        }
        const activeAudio = audioElementsRef.current[index];
        if (activeAudio) {
          activeAudio.play().then(() => {
            setIsPlaying(true);
          });
        }
      }, 50);
    }
  }, [isPlaying, stop, initAudio]);

  const seek = useCallback((fraction: number) => {
    const activeAudio = audioElementsRef.current[currentTrackIndex];
    if (activeAudio && duration > 0) {
      const targetTime = fraction * duration;
      activeAudio.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  }, [currentTrackIndex, duration]);

  // Channel strip controllers
  const setVolume = useCallback((trackIdx: number, val: number) => {
    const clamped = Math.max(0, Math.min(1.2, val));
    setChannelVolumes(prev => {
      const next = [...prev];
      next[trackIdx] = clamped;
      return next;
    });

    const gainNode = gainNodesRef.current[trackIdx];
    if (gainNode) {
      // If channel is muted, keep absolute volume at 0
      const isMuted = channelMutes[trackIdx];
      gainNode.gain.setValueAtTime(
        isMuted ? 0 : clamped,
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [channelMutes]);

  const toggleMute = useCallback((trackIdx: number) => {
    let mState = false;
    setChannelMutes(prev => {
      const next = [...prev];
      next[trackIdx] = !next[trackIdx];
      mState = next[trackIdx];
      return next;
    });

    const gainNode = gainNodesRef.current[trackIdx];
    if (gainNode) {
      gainNode.gain.setValueAtTime(
        mState ? 0 : channelVolumes[trackIdx],
        audioContextRef.current?.currentTime || 0
      );
    }
  }, [channelVolumes]);

  const toggleSolo = useCallback((trackIdx: number) => {
    let nextSolos: boolean[] = [];
    setChannelSolos(prev => {
      nextSolos = [...prev];
      nextSolos[trackIdx] = !nextSolos[trackIdx];
      return nextSolos;
    });

    // If solo is active, mute all non-soloed active channels
    const hasSoloed = nextSolos.some(s => s);
    DEMO_TRACKS.forEach((_, idx) => {
      const gainNode = gainNodesRef.current[idx];
      if (gainNode) {
        let activeVolume = channelVolumes[idx];
        if (channelMutes[idx]) {
          activeVolume = 0;
        } else if (hasSoloed && !nextSolos[idx]) {
          activeVolume = 0; // Muted by other solo strip
        }
        gainNode.gain.setValueAtTime(activeVolume, audioContextRef.current?.currentTime || 0);
      }
    });
  }, [channelVolumes, channelMutes]);

  const setPan = useCallback((trackIdx: number, val: number) => {
    const clamped = Math.max(-1, Math.min(1, val));
    setChannelPans(prev => {
      const next = [...prev];
      next[trackIdx] = clamped;
      return next;
    });

    const pannerNode = panNodesRef.current[trackIdx];
    if (pannerNode) {
      pannerNode.pan.setValueAtTime(clamped, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  const setEQ = useCallback((trackIdx: number, eqType: keyof EQConfig, val: number) => {
    const clampedVal = Math.max(-12, Math.min(12, val)); // Gain in dB
    setChannelEQs(prev => {
      const next = prev.map((item, idx) => {
        if (idx === trackIdx) {
          return { ...item, [eqType]: clampedVal };
        }
        return item;
      });
      return next;
    });

    // Update Biquad Filters
    if (eqType === 'lowGain') {
      const node = eqLowNodesRef.current[trackIdx];
      if (node) node.gain.setValueAtTime(clampedVal, audioContextRef.current?.currentTime || 0);
    } else if (eqType === 'midGain') {
      const node = eqMidNodesRef.current[trackIdx];
      if (node) node.gain.setValueAtTime(clampedVal, audioContextRef.current?.currentTime || 0);
    } else if (eqType === 'highGain') {
      const node = eqHighNodesRef.current[trackIdx];
      if (node) node.gain.setValueAtTime(clampedVal, audioContextRef.current?.currentTime || 0);
    }
  }, []);

  // Frame animation loop to update visualizer buffers and VU levels
  useEffect(() => {
    let animationFrameId: number;

    // Helper to calculate RMS peak volume in decibels
    const calculateDB = (dataArray: ArrayLike<number>): number => {
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        // Map 0-255 to normalized range [-1.0, 1.0]
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      if (rms <= 0.0001) return -60; // floor
      const db = 20 * Math.log10(rms);
      return Math.max(-60, Math.min(0, db));
    };

    const updateFrame = () => {
      if (analyserRef.current && isPlaying) {
        const analyser = analyserRef.current;
        
        // Write frequency and time-domain data directly into refs (bypass React state rendering)
        analyser.getByteFrequencyData(frequencyDataRef.current as any);
        analyser.getByteTimeDomainData(timeDomainDataRef.current as any);

        // Calculate Master VU level
        const masterDb = calculateDB(timeDomainDataRef.current);
        masterVULevelRef.current = masterDb;

        // Calculate Channel VU levels
        DEMO_TRACKS.forEach((_, idx) => {
          if (idx === currentTrackIndex) {
            // Active playing channel mirrors master but scaled by channel volume
            const channelDb = masterDb + 20 * Math.log10(channelVolumes[idx] || 0.001);
            channelVULevelsRef.current[idx] = Math.max(-60, Math.min(0, channelDb));
          } else {
            // Muted/Inactive channels are silent
            channelVULevelsRef.current[idx] = -60;
          }
        });
      } else if (!isPlaying) {
        // Smoothly decay VU meters to silent floor when stopped/paused
        masterVULevelRef.current = Math.max(-60, masterVULevelRef.current - 2);
        channelVULevelsRef.current = channelVULevelsRef.current.map(level => Math.max(-60, level - 2));
      }

      animationFrameId = requestAnimationFrame(updateFrame);
    };

    updateFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentTrackIndex, channelVolumes]);

  return {
    isPlaying,
    currentTime,
    duration,
    currentTrackIndex,
    masterVolume,
    visualizerMode,
    bpm,
    channelVolumes,
    channelMutes,
    channelSolos,
    channelPans,
    channelEQs,
    
    // Audio References
    audioElementsRef,
    frequencyDataRef,
    timeDomainDataRef,
    masterVULevelRef,
    channelVULevelsRef,

    // Controls
    play,
    pause,
    stop,
    selectTrack,
    seek,
    setVolume,
    setMasterVolume: setMasterVolumeLevel,
    toggleMute,
    toggleSolo,
    setPan,
    setEQ,
    setVisualizerMode
  };
};

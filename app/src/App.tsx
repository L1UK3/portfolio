import React, { useState, useEffect } from 'react';
import { useAudioAnalyser, DEMO_TRACKS } from './hooks/useAudioAnalyser';
import { TransportBar } from './components/daw/TransportBar';
import { MixerChannel } from './components/daw/MixerChannel';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { MediaBrowser } from './components/daw/MediaBrowser';
import { VSTConsole } from './components/daw/VSTConsole';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Eye, Settings, Sliders } from 'lucide-react';
import type { VisualizerMode } from './types';

export default function App() {
  const audio = useAudioAnalyser();

  // Visualizer settings state
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [speed, setSpeed] = useState<number>(1.5);
  const [density, setDensity] = useState<number>(20);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Selected project key for VST plug-in details
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Single-channel VU refs to feed into Mixer strips
  const track1VURef = React.useRef<number>(-60);
  const track2VURef = React.useRef<number>(-60);
  const masterVURef = React.useRef<number>(-60);

  // Continuous loop to update individual VU level values from analyser hook refs
  useEffect(() => {
    let frameId: number;
    const updateVURefs = () => {
      track1VURef.current = audio.channelVULevelsRef.current[0];
      track2VURef.current = audio.channelVULevelsRef.current[1];
      masterVURef.current = audio.masterVULevelRef.current;
      frameId = requestAnimationFrame(updateVURefs);
    };
    updateVURefs();
    return () => cancelAnimationFrame(frameId);
  }, [audio.channelVULevelsRef, audio.masterVULevelRef]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-[#0a0a0c] daw-grid overflow-hidden text-neutral-100 min-h-screen">
        
        {/* Top Transport Console */}
        <TransportBar
          isPlaying={audio.isPlaying}
          currentTime={audio.currentTime}
          currentTrackIndex={audio.currentTrackIndex}
          bpm={audio.bpm}
          play={audio.play}
          pause={audio.pause}
          stop={audio.stop}
        />

        {/* Central Workstation Workspace */}
        <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Left Panel: Visualizer Settings & Parameters */}
          <section className="w-full md:w-[260px] border-r-2 border-neutral-950 bg-neutral-900/30 flex flex-col p-4 gap-4 overflow-y-auto shrink-0 select-none">
            
            <div className="flex items-center gap-2 border-b border-neutral-850 pb-2">
              <Sliders className="size-4 text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300">
                Visualizer Rack
              </span>
            </div>

            {/* Mode Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                Display Mode
              </label>
              <Tabs
                value={audio.visualizerMode}
                onValueChange={(val: string) => audio.setVisualizerMode(val as VisualizerMode)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 bg-neutral-950 border border-neutral-800 p-0.5 h-14 rounded">
                  <TabsTrigger value="waveform" className="text-[10px] font-mono py-1">Waveform</TabsTrigger>
                  <TabsTrigger value="frequency" className="text-[10px] font-mono py-1">Freq Grid</TabsTrigger>
                  <TabsTrigger value="circle" className="text-[10px] font-mono py-1">Circular</TabsTrigger>
                  <TabsTrigger value="waterfall" className="text-[10px] font-mono py-1">Waterfall</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sensitivity Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                <span>Gain/Sensitivity</span>
                <span className="text-primary">{sensitivity.toFixed(1)}x</span>
              </div>
              <Slider
                value={[sensitivity * 10]}
                onValueChange={(val: any) => setSensitivity(val[0] / 10)}
                min={5}
                max={30}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                <span>Waterfall Speed</span>
                <span className="text-primary">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed * 10]}
                onValueChange={(val: any) => setSpeed(val[0] / 10)}
                min={5}
                max={40}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Density Slider */}
            <div className="flex flex-col gap-2 border-b border-neutral-850 pb-3">
              <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                <span>Resolution</span>
                <span className="text-primary">{Math.round(density)}</span>
              </div>
              <Slider
                value={[density]}
                onValueChange={(val: any) => setDensity(val[0])}
                min={10}
                max={40}
                step={1}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 border-b border-neutral-850 pb-2 pt-1">
              <Settings className="size-4 text-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300">
                Render Controls
              </span>
            </div>

            {/* Camera Controls Toggle */}
            <div className="flex flex-col gap-3">
              {/* Wireframe Button */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
                  {audio.visualizerMode === 'waterfall' ? 'Monochrome' : 'Wireframe Line'}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsWireframe(!isWireframe)}
                  className={`h-6 text-[10px] font-mono px-3 ${
                    isWireframe 
                      ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Eye className="size-3 mr-1" />
                  {isWireframe ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-850 my-2" />

            {/* Media Browser */}
            <MediaBrowser
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />

          </section>

          {/* Center Panel: Visualizer Viewport */}
          <section className="flex-grow h-full relative border-neutral-950 bg-black">
            <VisualizerCanvas
              mode={audio.visualizerMode}
              frequencyDataRef={audio.frequencyDataRef}
              timeDomainDataRef={audio.timeDomainDataRef}
              sensitivity={sensitivity}
              speed={speed}
              density={density}
              isWireframe={isWireframe}
            />
          </section>
          
        </main>

        {/* Bottom Panel: Mixer Rack Console */}
        <footer className="bg-neutral-950 border-t border-neutral-900 py-3 px-4 flex justify-center items-center overflow-x-auto shrink-0 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.5)] z-10">
          <div className="flex gap-4 min-w-max mx-auto px-4">
            
            {/* Mixer Channel 1: Track 1 */}
            <MixerChannel
              label="CH 1"
              subLabel={DEMO_TRACKS[0].title}
              volume={audio.channelVolumes[0]}
              onVolumeChange={(val) => audio.setVolume(0, val)}
              vuLevelRef={track1VURef}
              pan={audio.channelPans[0]}
              onPanChange={(val) => audio.setPan(0, val)}
              eq={audio.channelEQs[0]}
              onEQChange={(type, val) => audio.setEQ(0, type, val)}
              isMuted={audio.channelMutes[0]}
              onMuteToggle={() => audio.toggleMute(0)}
              isSoloed={audio.channelSolos[0]}
              onSoloToggle={() => audio.toggleSolo(0)}
              isActive={audio.currentTrackIndex === 0}
              onActivate={() => audio.selectTrack(0)}
            />

            {/* Mixer Channel 2: Track 2 */}
            <MixerChannel
              label="CH 2"
              subLabel={DEMO_TRACKS[1].title}
              volume={audio.channelVolumes[1]}
              onVolumeChange={(val) => audio.setVolume(1, val)}
              vuLevelRef={track2VURef}
              pan={audio.channelPans[1]}
              onPanChange={(val) => audio.setPan(1, val)}
              eq={audio.channelEQs[1]}
              onEQChange={(type, val) => audio.setEQ(1, type, val)}
              isMuted={audio.channelMutes[1]}
              onMuteToggle={() => audio.toggleMute(1)}
              isSoloed={audio.channelSolos[1]}
              onSoloToggle={() => audio.toggleSolo(1)}
              isActive={audio.currentTrackIndex === 1}
              onActivate={() => audio.selectTrack(1)}
            />

            {/* Master Rack Divider */}
            <div className="w-[2px] bg-neutral-950 self-stretch my-2 shadow-[1px_0_0_#1f2937]" />

            {/* Mixer Channel 3: Master */}
            <MixerChannel
              label="MASTER"
              isMaster={true}
              volume={audio.masterVolume}
              onVolumeChange={audio.setMasterVolume}
              vuLevelRef={masterVURef}
            />

          </div>
        </footer>

        {/* Hidden programmatically bound HTML5 Audio controls for Web Audio nodes */}
        <audio
          ref={(el) => { audio.audioElementsRef.current[0] = el; }}
          src={DEMO_TRACKS[0].src}
          crossOrigin="anonymous"
          loop
        />
        <audio
          ref={(el) => { audio.audioElementsRef.current[1] = el; }}
          src={DEMO_TRACKS[1].src}
          crossOrigin="anonymous"
          loop
        />

        {/* VST Console Details View */}
        <VSTConsole
          projectKey={selectedProject}
          onClose={() => setSelectedProject(null)}
        />

      </div>
    </TooltipProvider>
  );
}

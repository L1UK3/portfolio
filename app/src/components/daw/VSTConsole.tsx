import React, { useState } from 'react';
import { ExternalLink, X, Power, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface VSTConsoleProps {
  projectKey: string | null;
  onClose: () => void;
}

interface ProjectData {
  title: string;
  subtitle: string;
  description: string;
  techTags: string[];
  link?: string;
  linkLabel?: string;
  parameters: { name: string; val: string }[];
}

const PROJECT_REGISTRY: Record<string, ProjectData> = {
  spectro: {
    title: "Spectrophotometer Visualiser",
    subtitle: "Laboratory Data Processing VST",
    description: "Developed to assist a university dissertation, this web-based application replaces compatibility-locked Windows XP legacy software. It parses raw spectrophotometer .txt readings uploaded by researchers and plots them instantly into interactive, inspectable graphs directly in the browser. Still actively used by laboratory supervisors.",
    techTags: ["HTML5", "CSS3", "JavaScript", "GitHub Pages", "Chart.js"],
    link: "https://l1uk3.github.io/Spectrophotometer-Output-Visualiser/",
    linkLabel: "Open Visualiser",
    parameters: [
      { name: "Input", val: ".txt parsing" },
      { name: "Compatibility", val: "Universal" },
      { name: "Status", val: "In Lab Use" }
    ]
  },
  pokemon: {
    title: "Play South Wales",
    subtitle: "Event Scheduler & Retention Enhancer",
    description: "A competitive Pokemon tournament league scheduler built to solve player retention and event clashes in the South Wales gaming scene. Acting as lead developer, I collaborated with local players to release a platform that aggregates events, tracks scheduling, and schedules matches. Achieved 250+ page views in its release window.",
    techTags: ["React.js", "FastAPI", "Supabase", "REST API", "Tailwind"],
    link: "https://playsouthwales.uk/",
    linkLabel: "Open Platform",
    parameters: [
      { name: "Engine", val: "FastAPI" },
      { name: "Database", val: "Supabase" },
      { name: "Views", val: "250+ (Release)" }
    ]
  },
  pipeline: {
    title: "CI/CD Deployment Pipelines",
    subtitle: "Full-Stack Deployment Controller",
    description: "Configured automated deployment pipelines and full-stack environments. Projects leverage a FastAPI/Python backend deployed automatically to Render, synced with a React/Vite frontend deployed to Vercel. Integrates Clerk Authentication, TanStack Query, and TanStack Router, focusing on reducing developer stress and pipeline friction.",
    techTags: ["FastAPI", "Vite", "Render", "Vercel", "Clerk Auth", "TanStack"],
    parameters: [
      { name: "Backend", val: "FastAPI / Render" },
      { name: "Frontend", val: "Vite / Vercel" },
      { name: "Auth", val: "Clerk" }
    ]
  }
};

export const VSTConsole: React.FC<VSTConsoleProps> = ({
  projectKey,
  onClose
}) => {
  const [isBypassed, setIsBypassed] = useState(false);

  if (!projectKey) return null;
  const project = PROJECT_REGISTRY[projectKey];
  if (!project) return null;

  return (
    <Dialog open={!!projectKey} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="bg-neutral-900 border-2 border-neutral-950 text-neutral-200 font-sans p-0 max-w-xl overflow-hidden shadow-2xl rounded-lg">
        
        {/* VST Chrome Header */}
        <div className="bg-neutral-950 px-4 py-2 flex items-center justify-between border-b border-neutral-800 select-none">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-primary" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
              VST PLUG-IN // {project.title.replace(/\s+/g, '').toUpperCase()} // VER 1.0.0
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* DAW Bypass Switch */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBypassed(!isBypassed)}
              className={`h-5 px-2 text-[8px] font-mono uppercase tracking-widest font-bold border transition-colors ${
                isBypassed 
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-400' 
                  : 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
              }`}
            >
              <Power className="size-2 mr-1" />
              {isBypassed ? 'Bypassed' : 'Active'}
            </Button>
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* VST Faceplate Workspace */}
        <div className={`p-5 flex flex-col md:flex-row gap-5 transition-opacity duration-200 ${isBypassed ? 'opacity-40' : 'opacity-100'}`}>
          
          {/* Left Rack Panel: Hardware Indicators */}
          <div className="w-full md:w-[160px] bg-neutral-950 border border-neutral-800 rounded p-3 flex flex-col justify-between shrink-0 font-mono text-[9px]">
            <div className="flex flex-col gap-2.5">
              <div className="text-[8px] text-neutral-500 uppercase tracking-widest border-b border-neutral-850 pb-1 font-bold">
                PARAMETERS
              </div>
              {project.parameters.map((param, idx) => (
                <div key={idx} className="flex flex-col border-b border-neutral-900 pb-1">
                  <span className="text-neutral-400 font-bold uppercase">{param.name}</span>
                  <span className="text-primary truncate mt-0.5">{param.val}</span>
                </div>
              ))}
            </div>

            {/* Glowing active indicator */}
            <div className="flex items-center gap-1.5 pt-4 border-t border-neutral-900 mt-4">
              <div className={`size-2 rounded-full ${isBypassed ? 'bg-neutral-800 shadow-none' : 'bg-led-green shadow-[0_0_6px_#22c55e]'}`} />
              <span className="text-neutral-400 uppercase tracking-widest text-[8px]">
                {isBypassed ? 'BYPASSED' : 'PROCESSING'}
              </span>
            </div>
          </div>

          {/* Right Rack Panel: Project Details & Audio Outs */}
          <div className="flex-grow flex flex-col justify-between gap-4">
            
            {/* Titles & Desc */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-primary uppercase tracking-widest font-bold">
                  {project.subtitle}
                </span>
                <h3 className="text-base font-mono font-bold text-neutral-100 tracking-wide mt-0.5">
                  {project.title}
                </h3>
              </div>
              
              <p className="text-xs leading-relaxed text-neutral-300">
                {project.description}
              </p>
            </div>

            {/* Technology Badge Rack */}
            <div className="flex flex-wrap gap-1">
              {project.techTags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="bg-neutral-950 text-[9px] border-neutral-800 font-mono text-neutral-400 px-1.5 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* VST Output Link */}
            {project.link && (
              <div className="pt-3 border-t border-neutral-800 flex justify-end">
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/20 hover:border-primary px-3.5 py-1.5 rounded transition-all active:scale-95 ${
                    isBypassed ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <span>{project.linkLabel}</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            )}

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};

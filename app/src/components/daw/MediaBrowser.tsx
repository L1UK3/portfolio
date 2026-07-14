import React from 'react';
import { FileText, FileDown, ExternalLink, Library, Folder, CheckSquare } from 'lucide-react';

interface MediaBrowserProps {
  onSelectProject: (project: string) => void;
  selectedProject: string | null;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({
  onSelectProject,
  selectedProject
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Media Browser Title */}
      <div className="flex items-center gap-2 border-b border-neutral-850 pb-2">
        <Library className="size-4 text-primary" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300">
          Media & Files Browser
        </span>
      </div>

      {/* Directory Tree */}
      <div className="flex flex-col gap-3 font-mono text-[11px] text-neutral-400">
        
        {/* CV & Documents Folder */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
            <Folder className="size-3.5 text-primary" />
            <span>DOCUMENTS</span>
          </div>
          
          <div className="pl-4 flex flex-col gap-1 border-l border-neutral-800 ml-1.5 py-1">
            {/* View HTML Resume */}
            <a 
              href="cv/resume.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between hover:text-primary transition-colors py-0.5 group"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="size-3 text-neutral-500" />
                <span>resume.html</span>
              </span>
              <ExternalLink className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Download PDF CV */}
            <a 
              href="cv/Luke Enness CV.pdf" 
              download
              className="flex items-center justify-between hover:text-primary transition-colors py-0.5 group"
            >
              <span className="flex items-center gap-1.5">
                <FileDown className="size-3 text-neutral-500" />
                <span>Luke_Enness_CV.pdf</span>
              </span>
              <FileDown className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Applications Folder */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
            <Folder className="size-3.5 text-primary" />
            <span>APPLICATIONS (VSTs)</span>
          </div>

          <div className="pl-4 flex flex-col gap-1 border-l border-neutral-800 ml-1.5 py-1">
            
            {/* Spectrophotometer project */}
            <button
              onClick={() => onSelectProject('spectro')}
              className={`flex items-center justify-between hover:text-primary text-left py-1 group w-full ${
                selectedProject === 'spectro' ? 'text-primary font-bold' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <CheckSquare className={`size-3 ${selectedProject === 'spectro' ? 'text-primary' : 'text-neutral-500'}`} />
                <span className="truncate">Spectrophotometer.vst</span>
              </span>
              <span className={`size-1.5 rounded-full ${selectedProject === 'spectro' ? 'bg-primary shadow-[0_0_4px_#06b6d4]' : 'bg-neutral-800'}`} />
            </button>

            {/* Play South Wales */}
            <button
              onClick={() => onSelectProject('pokemon')}
              className={`flex items-center justify-between hover:text-primary text-left py-1 group w-full ${
                selectedProject === 'pokemon' ? 'text-primary font-bold' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <CheckSquare className={`size-3 ${selectedProject === 'pokemon' ? 'text-primary' : 'text-neutral-500'}`} />
                <span className="truncate">PlaySouthWales.vst</span>
              </span>
              <span className={`size-1.5 rounded-full ${selectedProject === 'pokemon' ? 'bg-primary shadow-[0_0_4px_#06b6d4]' : 'bg-neutral-800'}`} />
            </button>

            {/* CI/CD Pipelines */}
            <button
              onClick={() => onSelectProject('pipeline')}
              className={`flex items-center justify-between hover:text-primary text-left py-1 group w-full ${
                selectedProject === 'pipeline' ? 'text-primary font-bold' : ''
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <CheckSquare className={`size-3 ${selectedProject === 'pipeline' ? 'text-primary' : 'text-neutral-500'}`} />
                <span className="truncate">CICDPipelines.vst</span>
              </span>
              <span className={`size-1.5 rounded-full ${selectedProject === 'pipeline' ? 'bg-primary shadow-[0_0_4px_#06b6d4]' : 'bg-neutral-800'}`} />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

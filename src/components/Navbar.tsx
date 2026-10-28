import React from 'react';
import { ShieldCheck, Volume2, VolumeX, FolderUp, Video, FileText, History } from 'lucide-react';
import { playCyberClick } from '../utils/sound';

interface NavbarProps {
  activeTab: 'upload' | 'review' | 'meet' | 'history';
  setActiveTab: (tab: 'upload' | 'review' | 'meet' | 'history') => void;
  hasReview: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasReview,
  soundEnabled,
  onToggleSound,
  onNewAudit,
}) => {
  const handleNav = (tab: 'upload' | 'review' | 'meet' | 'history') => {
    playCyberClick();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1A1F1D]/90 backdrop-blur-md border-b border-[#3B413C] px-4 sm:px-8 py-3.5 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#94D1BE] to-[#3B413C] flex items-center justify-center shadow-[0_0_15px_rgba(148,209,190,0.35)] border border-[#94D1BE]/40">
            <ShieldCheck className="w-5 h-5 text-[#161A18] stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
              TaskReview <span className="text-[#94D1BE] font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-[#222825] border border-[#3B413C]">Pro</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-medium">
          <button
            onClick={() => handleNav('upload')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs uppercase tracking-wider font-mono ${
              activeTab === 'upload'
                ? 'bg-[#2E3632] text-[#94D1BE] border border-[#94D1BE]/50 shadow-[0_0_10px_rgba(148,209,190,0.2)]'
                : 'text-[#9DB5B2] hover:text-[#FFFFFF] hover:bg-[#252B28]'
            }`}
          >
            <FolderUp className="w-3.5 h-3.5 text-[#94D1BE]" />
            Upload Task Folder
          </button>

          <button
            onClick={() => handleNav('review')}
            disabled={!hasReview}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs uppercase tracking-wider font-mono ${
              !hasReview
                ? 'opacity-40 cursor-not-allowed text-[#9DB5B2]/50'
                : activeTab === 'review'
                ? 'bg-[#2E3632] text-[#DAF0EE] border border-[#9DB5B2]/60 shadow-[0_0_10px_rgba(157,181,178,0.2)]'
                : 'text-[#9DB5B2] hover:text-[#FFFFFF] hover:bg-[#252B28]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#DAF0EE]" />
            Review Document
          </button>

          <button
            onClick={() => handleNav('meet')}
            disabled={!hasReview}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs uppercase tracking-wider font-mono ${
              !hasReview
                ? 'opacity-40 cursor-not-allowed text-[#9DB5B2]/50'
                : activeTab === 'meet'
                ? 'bg-[#2E3632] text-[#94D1BE] border border-[#94D1BE]/60 shadow-[0_0_10px_rgba(148,209,190,0.25)]'
                : 'text-[#9DB5B2] hover:text-[#FFFFFF] hover:bg-[#252B28]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#94D1BE]" />
            AI Google Meet Room
          </button>

          <button
            onClick={() => handleNav('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs uppercase tracking-wider font-mono ${
              activeTab === 'history'
                ? 'bg-[#2E3632] text-[#DAF0EE] border border-[#9DB5B2]/60'
                : 'text-[#9DB5B2] hover:text-[#FFFFFF] hover:bg-[#252B28]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#9DB5B2]" />
            Audit Vault
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Visual Palette Pill swatch */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-md bg-[#252B28] border border-[#3B413C]" title="Theme Palette: #FFFFFF · #3B413C · #9DB5B2 · #DAF0EE · #94D1BE">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B413C]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#9DB5B2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#DAF0EE]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#94D1BE]" />
          </div>

          <button
            onClick={() => {
              playCyberClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute Tactical SFX' : 'Enable Tactical SFX'}
            className="p-2 rounded-lg bg-[#252B28] border border-[#3B413C] text-[#9DB5B2] hover:text-[#94D1BE] hover:border-[#94D1BE]/50 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#94D1BE]" /> : <VolumeX className="w-4 h-4 text-[#9DB5B2]/60" />}
          </button>

          <button
            onClick={() => {
              playCyberClick();
              onNewAudit();
            }}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-[#161A18] bg-gradient-to-r from-[#94D1BE] to-[#A5DBCB] hover:brightness-105 rounded-lg transition-all shadow-[0_0_12px_rgba(148,209,190,0.35)] whitespace-nowrap shrink-0 active:scale-95 cursor-pointer font-bold"
          >
            + New Audit
          </button>
        </div>
      </div>
    </header>
  );
};

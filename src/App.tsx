/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { FolderUploader } from './components/FolderUploader';
import { ReviewDocumentView } from './components/ReviewDocumentView';
import { AiMeetRoom } from './components/AiMeetRoom';
import { AuditHistory } from './components/AuditHistory';
import { ReviewDocumentData } from './types';
import { toggleAudio, isSoundMuted } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'meet' | 'history'>('upload');
  const [currentReview, setCurrentReview] = useState<ReviewDocumentData | null>(null);
  const [history, setHistory] = useState<ReviewDocumentData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load past history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taskreview_audit_vault');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          // Pre-select most recent review
          setCurrentReview(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Could not parse saved audits:', e);
    }
  }, []);

  const handleScanComplete = (review: ReviewDocumentData) => {
    setCurrentReview(review);
    setActiveTab('review');

    // Save to history
    setHistory((prev) => {
      const updated = [review, ...prev.filter((r) => r.meetCode !== review.meetCode)].slice(0, 20);
      try {
        localStorage.setItem('taskreview_audit_vault', JSON.stringify(updated));
      } catch (e) {
        // quota exceeded or private mode
      }
      return updated;
    });

    // Palette celebration confetti (#94D1BE Pearl Aqua, #DAF0EE Light Cyan, #9DB5B2 Ash Grey, #FFFFFF White)
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#94D1BE', '#DAF0EE', '#9DB5B2', '#FFFFFF', '#3B413C'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const newState = toggleAudio();
    setSoundEnabled(newState);
  };

  const handleNewAudit = () => {
    setActiveTab('upload');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('taskreview_audit_vault');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#161A18] text-[#DAF0EE] flex flex-col font-sans selection:bg-[#94D1BE] selection:text-[#161A18]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasReview={!!currentReview}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNewAudit={handleNewAudit}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
        {activeTab === 'upload' && (
          <FolderUploader
            onScanComplete={handleScanComplete}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
        )}

        {activeTab === 'review' && currentReview && (
          <ReviewDocumentView
            review={currentReview}
            onJoinMeet={() => setActiveTab('meet')}
          />
        )}

        {activeTab === 'meet' && currentReview && (
          <AiMeetRoom
            review={currentReview}
            onLeaveMeeting={() => setActiveTab('review')}
          />
        )}

        {activeTab === 'history' && (
          <AuditHistory
            history={history}
            onSelectReview={(rev) => {
              setCurrentReview(rev);
              setActiveTab('review');
            }}
            onEnterMeet={(rev) => {
              setCurrentReview(rev);
              setActiveTab('meet');
            }}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print py-6 border-t border-[#3B413C] bg-[#161A18] text-center text-xs text-[#9DB5B2] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>TaskReview Pro · AI Client Deliverable Auditing System</span>
            <span className="hidden sm:inline">·</span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#222825] border border-[#3B413C]">
              <span className="text-[10px] text-[#9DB5B2]">Palette:</span>
              <span className="w-2 h-2 rounded-full bg-[#FFFFFF]" title="White #FFFFFF" />
              <span className="w-2 h-2 rounded-full bg-[#3B413C]" title="Charcoal Brown #3B413C" />
              <span className="w-2 h-2 rounded-full bg-[#9DB5B2]" title="Ash Grey #9DB5B2" />
              <span className="w-2 h-2 rounded-full bg-[#DAF0EE]" title="Light Cyan #DAF0EE" />
              <span className="w-2 h-2 rounded-full bg-[#94D1BE]" title="Pearl Aqua #94D1BE" />
            </div>
          </div>
          <span className="text-[#9DB5B2]/70">
            Powered by Gemini 3.8 Flash · Web Audio API · Google Meet Integration
          </span>
        </div>
      </footer>
    </div>
  );
}

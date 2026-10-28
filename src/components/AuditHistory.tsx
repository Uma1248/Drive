import React from 'react';
import { History, FileText, Video, Trash2, ArrowRight } from 'lucide-react';
import { ReviewDocumentData } from '../types';
import { playCyberClick } from '../utils/sound';

interface AuditHistoryProps {
  history: ReviewDocumentData[];
  onSelectReview: (rev: ReviewDocumentData) => void;
  onClearHistory: () => void;
  onEnterMeet: (rev: ReviewDocumentData) => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({
  history,
  onSelectReview,
  onClearHistory,
  onEnterMeet,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-2xl bg-[#222825]/90 border border-[#3B413C] flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
            <History className="w-5 h-5 text-[#94D1BE]" />
            Audit Vault & Past Deliverables ({history.length})
          </h2>
          <p className="text-xs text-[#9DB5B2] mt-1">
            Revisit past task reviews, inspect generated rubrics, or re-open scheduled Google Meet links.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              playCyberClick();
              if (confirm('Clear all stored audit history?')) {
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#2A312D] hover:bg-rose-950 text-[#9DB5B2] hover:text-rose-300 border border-[#3B413C] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Vault
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#3B413C] p-8 space-y-3 bg-[#222825]/30">
          <FileText className="w-12 h-12 text-[#9DB5B2]/40 mx-auto" />
          <h3 className="text-sm font-semibold text-[#FFFFFF]">No Audits in Vault Yet</h3>
          <p className="text-xs text-[#9DB5B2] max-w-sm mx-auto">
            Uploaded task folders and their generated executive review documents will be permanently preserved here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#222825]/80 border border-[#3B413C] hover:border-[#94D1BE]/50 space-y-4 transition-all hover:shadow-[0_0_15px_rgba(148,209,190,0.15)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161A18] border border-[#3B413C] text-[#94D1BE]">
                      REF: REV-{item.meetCode?.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-[#9DB5B2]">
                      {item.reviewDate}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#FFFFFF]">{item.projectName}</h4>
                  <div className="text-xs text-[#9DB5B2]">Client: {item.clientName}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-bold font-mono text-[#94D1BE]">
                    {item.overallScore}%
                  </div>
                  <div className="text-[10px] text-[#9DB5B2] font-mono">{item.fileCount} files</div>
                </div>
              </div>

              <p className="text-xs text-[#DAF0EE]/80 line-clamp-2 leading-relaxed">
                {item.executiveSummary}
              </p>

              <div className="pt-3 border-t border-[#3B413C] flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => {
                    playCyberClick();
                    onEnterMeet(item);
                  }}
                  className="text-[#94D1BE] hover:text-[#A5DBCB] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Google Meet</span>
                </button>

                <button
                  onClick={() => {
                    playCyberClick();
                    onSelectReview(item);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] hover:text-[#FFFFFF] border border-[#3B413C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Report</span>
                  <ArrowRight className="w-3 h-3 text-[#94D1BE]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

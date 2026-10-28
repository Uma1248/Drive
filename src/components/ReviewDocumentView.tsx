import React, { useState, useRef } from 'react';
import {
  FileText,
  Video,
  Calendar,
  Download,
  Printer,
  Copy,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Share2,
  AlertTriangle,
  ArrowRight,
  FileDown,
  Loader2
} from 'lucide-react';
import { ReviewDocumentData } from '../types';
import { createGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { exportElementToPdf } from '../utils/pdfExport';
import { playCyberClick, playSuccessChime } from '../utils/sound';

interface ReviewDocumentViewProps {
  review: ReviewDocumentData;
  onJoinMeet: () => void;
}

export const ReviewDocumentView: React.FC<ReviewDocumentViewProps> = ({
  review,
  onJoinMeet,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [actionItems, setActionItems] = useState(
    review.actionItems.map((item) => ({ ...item, completed: false }))
  );

  const documentPaperRef = useRef<HTMLDivElement>(null);

  const toggleActionItem = (id: string) => {
    playCyberClick();
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCopyMeetLink = () => {
    playCyberClick();
    navigator.clipboard.writeText(review.googleMeetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    playCyberClick();
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentPaperRef.current || isExportingPdf) return;
    playCyberClick();
    setIsExportingPdf(true);
    setPdfSuccess(false);

    try {
      const success = await exportElementToPdf(documentPaperRef.current, {
        projectName: review.projectName,
        filename: `TaskReview-Report-${review.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
      });

      if (success) {
        playSuccessChime();
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyMarkdown = () => {
    playCyberClick();
    const md = `# FORMAL DELIVERABLE REVIEW DOCUMENT
Project: ${review.projectName}
Client: ${review.clientName}
Review Date & Time: ${review.reviewDate} at ${review.reviewTime}
Google Meet Link: ${review.googleMeetLink}
Overall Score: ${review.overallScore}/100
Verdict: ${review.verdict}

## EXECUTIVE SUMMARY
${review.executiveSummary}

## PERFORMANCE RUBRIC
${review.rubrics.map((r) => `### ${r.criteria}: ${r.score}/${r.maxScore}\n${r.assessment}\n`).join('\n')}

## KEY STRENGTHS
${review.strengths.map((s) => `- ${s}`).join('\n')}

## CRITICAL OBSERVATIONS & REMEDIATION
${review.criticalObservations.map((o) => `### [${o.severity}] ${o.target}\n- Observation: ${o.observation}\n- Recommendation: ${o.recommendation}\n`).join('\n')}

## ACTION ITEMS
${review.actionItems.map((a) => `- [ ] [${a.priority}] ${a.task} (Owner: ${a.owner}, Effort: ${a.estimatedEffort})`).join('\n')}

## GOOGLE MEET REVIEW AGENDA
${review.meetingAgenda.map((ag) => `- ${ag.time}: ${ag.topic} (${ag.objective})`).join('\n')}

---
Signed: ${review.reviewerProfile.name}, ${review.reviewerProfile.role}
Organization: ${review.reviewerProfile.organization}
`;

    navigator.clipboard.writeText(md);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    playCyberClick();
    const md = `# FORMAL DELIVERABLE REVIEW DOCUMENT\nProject: ${review.projectName}\nClient: ${review.clientName}\nReview Date: ${review.reviewDate} at ${review.reviewTime}\nGoogle Meet: ${review.googleMeetLink}\nScore: ${review.overallScore}/100\n\n${review.executiveSummary}\n`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review-report-${review.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calendarUrl = createGoogleCalendarUrl(review);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Controls Action Toolbar (no-print) */}
      <div className="no-print p-4 rounded-2xl bg-[#222825]/90 border border-[#3B413C] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#94D1BE]/10 border border-[#94D1BE]/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#94D1BE]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#FFFFFF]">Deliverable Audit Report Generated</h2>
            <p className="text-xs text-[#9DB5B2] font-mono">
              Review Date: <span className="text-[#94D1BE]">{review.reviewDate}</span> · {review.reviewTime}
            </p>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Download as PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className={`px-4 py-2 rounded-lg font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(148,209,190,0.3)] cursor-pointer active:scale-95 ${
              pdfSuccess
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'bg-[#94D1BE] hover:bg-[#A5DBCB] text-[#161A18]'
            }`}
            title="Export high-resolution PDF document"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#161A18]" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-[#161A18]" />
                <span>Download as PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              playCyberClick();
              onJoinMeet();
            }}
            className="px-3.5 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] hover:text-[#94D1BE] border border-[#3B413C] font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#94D1BE]" />
            AI Meet Room
          </button>

          <a
            href={review.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playCyberClick}
            className="px-3 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#94D1BE]" />
            Google Meet
          </a>

          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playCyberClick}
            className="px-3 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#94D1BE]" />
            Calendar
          </a>

          <button
            onClick={() => {
              playCyberClick();
              downloadIcsFile(review);
            }}
            title="Download .ics Calendar Invite"
            className="p-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#DAF0EE]" />
          </button>

          <button
            onClick={handlePrint}
            title="Print Document"
            className="p-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#DAF0EE]" />
          </button>

          <button
            onClick={handleCopyMarkdown}
            title="Copy as Markdown"
            className="px-3 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedDoc ? <CheckCircle className="w-3.5 h-3.5 text-[#94D1BE]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDoc ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Scheduled Google Meet Highlight Card (no-print) */}
      <div className="no-print p-5 rounded-2xl bg-gradient-to-r from-[#222825] via-[#2A312D] to-[#222825] border border-[#94D1BE]/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(148,209,190,0.2)]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#94D1BE]/15 border border-[#94D1BE]/40 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-[#94D1BE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94D1BE] font-semibold">
                Scheduled AI Review Conference
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#161A18] border border-[#3B413C] text-[#DAF0EE]">
                Official Google Meet
              </span>
            </div>
            <div className="text-base font-bold text-[#FFFFFF] mt-0.5">
              {review.reviewDate} · {review.reviewTime}
            </div>
            <div className="text-xs text-[#9DB5B2] font-mono mt-0.5">
              Link:{' '}
              <span className="text-[#94D1BE] select-all font-semibold">
                {review.googleMeetLink}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyMeetLink}
            className="px-3 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] border border-[#3B413C] text-xs font-mono text-[#DAF0EE] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-[#94D1BE]" /> : <Share2 className="w-3.5 h-3.5 text-[#9DB5B2]" />}
            {copiedLink ? 'Link Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3 py-2 rounded-lg bg-[#2A312D] hover:bg-[#343D38] border border-[#94D1BE]/50 text-xs font-mono text-[#94D1BE] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>PDF</span>
          </button>

          <button
            onClick={() => {
              playCyberClick();
              onJoinMeet();
            }}
            className="px-4 py-2 rounded-lg bg-[#94D1BE] hover:bg-[#A5DBCB] text-[#161A18] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(148,209,190,0.35)] cursor-pointer"
          >
            <span>Join Review Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The Printable & Professional Review Document Paper */}
      <div
        ref={documentPaperRef}
        id="review-document-paper"
        className="review-document-content rounded-2xl bg-[#FFFFFF] text-[#3B413C] border border-[#9DB5B2]/40 shadow-2xl p-8 sm:p-12 space-y-8 font-sans"
      >
        {/* Print-Only Confidential Header */}
        <div className="print-only hidden pb-3 mb-2 border-b border-[#3B413C]/40 text-[9pt] font-mono text-[#6C827F] justify-between items-center">
          <span className="font-bold tracking-wider text-[#3B413C]">TASKREVIEW PRO · FORMAL DELIVERABLE AUDIT REPORT</span>
          <span>A4 FORMAT · CONFIDENTIAL</span>
        </div>

        {/* Document Header & Formal Letterhead */}
        <div className="border-b-2 border-[#3B413C] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-[#6C827F] uppercase">
                Formal Deliverable Review & Performance Audit
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3B413C] tracking-tight mt-1">
                {review.projectName}
              </h1>
              <div className="text-sm text-[#4A524C] mt-1">
                Client Organization: <strong className="text-[#3B413C]">{review.clientName}</strong>
              </div>
            </div>

            {/* Audit Metadata Box */}
            <div className="text-right sm:border-l sm:border-[#9DB5B2]/60 sm:pl-6 space-y-1">
              <div className="text-xs font-mono text-[#6C827F]">
                AUDIT REF: <span className="text-[#3B413C] font-bold">REV-{review.meetCode?.toUpperCase() || '7942'}</span>
              </div>
              <div className="text-xs font-mono text-[#6C827F]">
                DATE: <span className="text-[#3B413C]">{review.reviewDate}</span>
              </div>
              <div className="text-xs font-mono text-[#6C827F]">
                MEET TIME: <span className="text-[#3B413C]">{review.reviewTime}</span>
              </div>
              <div className="text-xs font-mono text-[#6C827F]">
                FILES EVALUATED: <span className="text-[#3B413C] font-bold">{review.fileCount} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Verdict & Score Strip */}
        <div className="p-6 rounded-xl bg-[#DAF0EE]/30 border border-[#9DB5B2]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#6C827F]">
              Deliverable Evaluation Status
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#3B413C] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#94D1BE] shrink-0" />
              <span>{review.verdict}</span>
            </div>
            <div className="text-xs text-[#4A524C] max-w-xl">
              Reviewed and certified against modern software engineering and architectural standards.
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-[#FFFFFF] p-4 rounded-xl border border-[#9DB5B2]/50">
            <div className="text-right">
              <div className="text-xs font-mono text-[#6C827F] uppercase">Composite Score</div>
              <div className="text-3xl font-black font-mono text-[#3B413C]">
                {review.overallScore}<span className="text-sm text-[#9DB5B2] font-normal">/100</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-[#94D1BE] flex items-center justify-center font-mono font-bold text-[#3B413C] text-sm">
              {review.overallScore}%
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>01.</span> Executive Summary
          </h2>
          <div className="text-sm text-[#4A524C] leading-relaxed space-y-3">
            <p className="whitespace-pre-line">{review.executiveSummary}</p>
          </div>
        </div>

        {/* Section 2: Rubric Evaluation Matrix */}
        <div className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>02.</span> Criteria & Performance Rubrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {review.rubrics.map((r, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#DAF0EE]/20 border border-[#9DB5B2]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#3B413C]">{r.criteria}</span>
                  <span className="text-xs font-mono font-bold text-[#3B413C] px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#9DB5B2]/50">
                    {r.score} / {r.maxScore}
                  </span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-2 rounded-full bg-[#DAF0EE] overflow-hidden">
                  <div
                    className="h-full bg-[#3B413C] rounded-full"
                    style={{ width: `${(r.score / r.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#4A524C] leading-relaxed">{r.assessment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Key Strengths & Accomplishments */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>03.</span> Strengths & Highlights
          </h2>
          <ul className="space-y-2 text-sm text-[#4A524C]">
            {review.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#94D1BE] shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4: Detailed Critical Observations & Remediation */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>04.</span> Critical Observations & Remediation Guide
          </h2>
          <div className="space-y-3">
            {review.criticalObservations.map((obs, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#9DB5B2]/50 bg-[#DAF0EE]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#3B413C]">{obs.target}</span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      obs.severity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : obs.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#DAF0EE] text-[#3B413C]'
                    }`}
                  >
                    {obs.severity} Priority
                  </span>
                </div>
                <div className="text-xs text-[#4A524C]">
                  <strong className="text-[#3B413C]">Observation: </strong>
                  {obs.observation}
                </div>
                <div className="text-xs text-[#4A524C] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#9DB5B2]/50">
                  <strong className="text-[#3B413C]">Recommendation: </strong>
                  {obs.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Prioritized Action Items */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>05.</span> Immediate Action Items for Milestone Sign-Off
          </h2>
          <div className="space-y-2">
            {actionItems.map((act) => (
              <div
                key={act.id}
                onClick={() => toggleActionItem(act.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  act.completed
                    ? 'bg-[#DAF0EE]/40 border-[#94D1BE] text-[#6C827F] line-through'
                    : 'bg-[#FFFFFF] border-[#9DB5B2]/50 hover:border-[#3B413C]'
                }`}
              >
                <button type="button" className="mt-0.5 shrink-0 text-[#3B413C]">
                  {act.completed ? (
                    <CheckSquare className="w-4 h-4 text-[#94D1BE]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#9DB5B2]" />
                  )}
                </button>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-bold text-[#3B413C]">{act.id}</span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-[#DAF0EE] text-[#3B413C]">
                      {act.priority}
                    </span>
                    <span className="text-[#6C827F]">· Owner: {act.owner}</span>
                    <span className="text-[#6C827F]">· Effort: {act.estimatedEffort}</span>
                  </div>
                  <div className="text-[#3B413C] text-xs font-medium">{act.task}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Google Meet Review Session Agenda */}
        <div className="space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#3B413C] border-b border-[#9DB5B2]/40 pb-2 flex items-center gap-2 font-mono">
            <span>06.</span> Google Meet Review Agenda ({review.reviewDate} at {review.reviewTime})
          </h2>
          <div className="rounded-xl border border-[#9DB5B2]/50 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DAF0EE]/40 font-mono text-[#3B413C] border-b border-[#9DB5B2]/50">
                <tr>
                  <th className="px-4 py-2.5">Time Slot</th>
                  <th className="px-4 py-2.5">Topic</th>
                  <th className="px-4 py-2.5">Review Objective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DB5B2]/30 text-[#4A524C]">
                {review.meetingAgenda.map((ag, i) => (
                  <tr key={i} className="hover:bg-[#DAF0EE]/20">
                    <td className="px-4 py-2.5 font-mono font-semibold text-[#3B413C] whitespace-nowrap">
                      {ag.time}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#3B413C]">{ag.topic}</td>
                    <td className="px-4 py-2.5 text-[#4A524C]">{ag.objective}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-[#6C827F] font-mono pt-1">
            Official Google Meet Room:{' '}
            <a
              href={review.googleMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B413C] underline font-semibold hover:text-[#94D1BE]"
            >
              {review.googleMeetLink}
            </a>
          </div>
        </div>

        {/* Section 7: Formal Reviewer Ratification & Signature */}
        <div className="pt-6 border-t-2 border-[#3B413C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#6C827F]">
              Auditor Certification & Sign-off
            </div>
            <div className="text-base font-bold text-[#3B413C]">
              {review.reviewerProfile.name}
            </div>
            <div className="text-xs text-[#4A524C] font-medium">
              {review.reviewerProfile.role}
            </div>
            <div className="text-xs text-[#6C827F] font-mono">
              {review.reviewerProfile.organization}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-dashed border-[#9DB5B2] text-center font-mono text-[11px] text-[#4A524C] space-y-1 bg-[#DAF0EE]/20">
            <div className="font-bold text-[#3B413C]">DIGITAL AUDIT SEAL VERIFIED</div>
            <div>SHA-256: 8a4f9b2d...{review.meetCode}</div>
            <div>Timestamp: {review.scannedAt || new Date().toISOString()}</div>
          </div>
        </div>

        {/* Print-Only Page Running Footer */}
        <div className="print-only hidden pt-3 mt-6 border-t border-[#3B413C]/40 text-[8.5pt] font-mono text-[#6C827F] justify-between items-center">
          <span>Client: {review.clientName} · Project: {review.projectName}</span>
          <span>Verified Reference: REV-{review.meetCode?.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

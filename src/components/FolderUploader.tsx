import React, { useState, useRef } from 'react';
import {
  FolderUp,
  Files,
  UploadCloud,
  FileCode,
  FileText,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Cpu
} from 'lucide-react';
import { ScannedFile, ReviewDocumentData } from '../types';
import { SAMPLE_PACKAGES, SamplePackage } from '../data/samplePackages';
import { playCyberClick, playScanSweep, playSuccessChime } from '../utils/sound';

interface FolderUploaderProps {
  onScanComplete: (review: ReviewDocumentData) => void;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

export const FolderUploader: React.FC<FolderUploaderProps> = ({
  onScanComplete,
  isScanning,
  setIsScanning,
}) => {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [folderName, setFolderName] = useState<string>('Production-Release-v1.0');
  const [clientName, setClientName] = useState<string>('Client Engineering Core');
  const [taskGoal, setTaskGoal] = useState<string>('Completed production deliverables, code modules, and architectural specifications.');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<ScannedFile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<string>('Ready for analysis');
  const [scanProgress, setScanProgress] = useState<number>(0);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.size > 2 * 1024 * 1024) {
        resolve(`[File size ${file.size} bytes exceeds preview buffer]`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = () => {
        resolve('[Error reading file content]');
      };
      reader.readAsText(file);
    });
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    playCyberClick();
    setErrorMsg(null);

    const rawFiles = Array.from(e.target.files);
    const firstRel = rawFiles[0].webkitRelativePath;
    if (firstRel) {
      const parts = firstRel.split('/');
      if (parts.length > 1) {
        setFolderName(parts[0]);
      }
    }

    const processedFiles: ScannedFile[] = [];
    for (const file of rawFiles) {
      const content = await readFileContent(file);
      processedFiles.push({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'unknown',
        content,
        lastModified: file.lastModified,
      });
    }

    setFiles(processedFiles);
    if (processedFiles.length > 0) {
      setSelectedFileForPreview(processedFiles[0]);
    }
  };

  const handleDirectoryPicker = async () => {
    playCyberClick();
    setErrorMsg(null);

    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        setFolderName(dirHandle.name);

        const loadedFiles: ScannedFile[] = [];

        async function scanDir(handle: any, currentPath: string) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const fileObj = await entry.getFile();
              const content = await readFileContent(fileObj);
              loadedFiles.push({
                name: entry.name,
                path: `${currentPath}/${entry.name}`,
                size: fileObj.size,
                type: fileObj.type || entry.name.split('.').pop() || 'file',
                content,
                lastModified: fileObj.lastModified,
              });
            } else if (entry.kind === 'directory') {
              await scanDir(entry, `${currentPath}/${entry.name}`);
            }
          }
        }

        await scanDir(dirHandle, dirHandle.name);
        setFiles(loadedFiles);
        if (loadedFiles.length > 0) {
          setSelectedFileForPreview(loadedFiles[0]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          folderInputRef.current?.click();
        }
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    playCyberClick();
    setErrorMsg(null);

    const rawFiles = Array.from(e.target.files);
    const processedFiles: ScannedFile[] = [];

    for (const file of rawFiles) {
      const content = await readFileContent(file);
      processedFiles.push({
        name: file.name,
        path: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file',
        content,
        lastModified: file.lastModified,
      });
    }

    setFiles((prev) => [...prev, ...processedFiles]);
    if (processedFiles.length > 0 && !selectedFileForPreview) {
      setSelectedFileForPreview(processedFiles[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    playCyberClick();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const rawFiles = Array.from(e.dataTransfer.files);
      const processedFiles: ScannedFile[] = [];

      for (const file of rawFiles) {
        const content = await readFileContent(file);
        processedFiles.push({
          name: file.name,
          path: (file as any).webkitRelativePath || file.name,
          size: file.size,
          type: file.type || file.name.split('.').pop() || 'file',
          content,
          lastModified: file.lastModified,
        });
      }

      setFiles((prev) => [...prev, ...processedFiles]);
      if (processedFiles.length > 0 && !selectedFileForPreview) {
        setSelectedFileForPreview(processedFiles[0]);
      }
    }
  };

  const loadSample = (pkg: SamplePackage) => {
    playCyberClick();
    setFolderName(pkg.name);
    setClientName(pkg.clientName);
    setTaskGoal(pkg.description);
    setFiles(pkg.files);
    setSelectedFileForPreview(pkg.files[0] || null);
    setErrorMsg(null);
  };

  const executeScan = async () => {
    if (files.length === 0) {
      setErrorMsg('Please upload a completed task folder or select a sample package first.');
      return;
    }

    playScanSweep();
    setIsScanning(true);
    setErrorMsg(null);
    setScanProgress(15);
    setScanStep('Cataloging deliverable file tree & manifests...');

    const timer1 = setTimeout(() => {
      setScanProgress(45);
      setScanStep('Running deep architecture & code quality static analysis...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setScanProgress(75);
      setScanStep('Drafting executive review document, rubrics & scheduling Google Meet session...');
    }, 2800);

    try {
      const response = await fetch('/api/review/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName,
          clientName,
          taskGoal,
          customInstructions,
          files: files.map((f) => ({
            name: f.name,
            path: f.path,
            size: f.size,
            type: f.type,
            content: f.content,
          })),
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server returned review scan error.');
      }

      setScanProgress(100);
      setScanStep('Review complete! Launching executive review package...');
      playSuccessChime();

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(data.review);
      }, 700);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsScanning(false);
      setErrorMsg(err.message || 'Failed to complete task folder scan. Please try again.');
    }
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs', 'cpp'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-[#94D1BE]" />;
    }
    if (['json', 'yaml', 'yml'].includes(ext || '')) {
      return <FileJson className="w-4 h-4 text-[#DAF0EE]" />;
    }
    return <FileText className="w-4 h-4 text-[#9DB5B2]" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#222825] via-[#2A312D] to-[#1E2321] border border-[#3B413C] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#94D1BE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#DAF0EE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161A18]/80 border border-[#3B413C] text-[#94D1BE] text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              AI Deliverable Audit & Google Meet Engine
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFFFF] tracking-tight">
              Client Task & Deliverable Review System
            </h1>
            <p className="text-[#DAF0EE]/90 text-sm sm:text-base leading-relaxed">
              Upload your completed project deliverables, local task folders, or code packages.
              Our Senior AI Review Lead scans the full file tree, generates an executive-grade
              performance review document, schedules a formal review date & time, and joins your dedicated Google Meet room.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-[#161A18]/90 border border-[#3B413C] flex flex-col">
              <span className="text-xs text-[#9DB5B2] font-mono">Deliverables Scanned</span>
              <span className="text-xl font-bold font-mono text-[#94D1BE] mt-1">{files.length} Files</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161A18]/90 border border-[#3B413C] flex flex-col">
              <span className="text-xs text-[#9DB5B2] font-mono">Total Volume</span>
              <span className="text-xl font-bold font-mono text-[#DAF0EE] mt-1">{formatBytes(totalBytes)}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161A18]/90 border border-[#3B413C] flex flex-col col-span-2 sm:col-span-1">
              <span className="text-xs text-[#9DB5B2] font-mono">Review Channel</span>
              <span className="text-xl font-bold font-mono text-[#94D1BE] mt-1">Google Meet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Load Sample Deliverables (Client Accessibility) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#9DB5B2] flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#94D1BE]" />
            Quick Test: Pre-Packaged Client Deliverables
          </span>
          <span className="text-xs text-[#9DB5B2]/70 font-mono">Instant 1-Click Verification</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => loadSample(pkg)}
              className="group text-left p-4 rounded-xl bg-[#222825]/80 hover:bg-[#2A312D] border border-[#3B413C] hover:border-[#94D1BE]/60 transition-all duration-200 hover:shadow-[0_0_15px_rgba(148,209,190,0.18)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161A18] text-[#94D1BE] border border-[#3B413C]">
                    {pkg.category}
                  </span>
                  <span className="text-xs font-mono text-[#9DB5B2]">{pkg.files.length} files</span>
                </div>
                <h4 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#94D1BE] transition-colors">
                  {pkg.name}
                </h4>
                <p className="text-xs text-[#DAF0EE]/75 mt-1 line-clamp-2">
                  {pkg.description}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#3B413C] flex items-center justify-between text-xs text-[#9DB5B2] font-mono">
                <span>Client: {pkg.clientName}</span>
                <span className="text-[#94D1BE] group-hover:translate-x-1 transition-transform">Load →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload & Folder Ingestion Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Form & Uploader (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata Form */}
          <div className="p-6 rounded-2xl bg-[#222825]/90 border border-[#3B413C] space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#94D1BE] flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              1. Deliverable Context & Client Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9DB5B2]">Client / Company Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161A18] border border-[#3B413C] text-sm text-[#FFFFFF] focus:outline-none focus:border-[#94D1BE] focus:ring-1 focus:ring-[#94D1BE] transition-all font-sans"
                  placeholder="e.g. Acme Innovations Corp."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#9DB5B2]">Task / Folder Package Title</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161A18] border border-[#3B413C] text-sm text-[#FFFFFF] focus:outline-none focus:border-[#94D1BE] focus:ring-1 focus:ring-[#94D1BE] transition-all font-sans"
                  placeholder="e.g. Final Sprint Release v2.0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9DB5B2]">Task Objective & Scope Description</label>
              <textarea
                value={taskGoal}
                onChange={(e) => setTaskGoal(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161A18] border border-[#3B413C] text-sm text-[#FFFFFF] focus:outline-none focus:border-[#94D1BE] focus:ring-1 focus:ring-[#94D1BE] transition-all font-sans resize-none"
                placeholder="What requirements or milestone objectives does this deliverable satisfy?"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9DB5B2]">Special Auditor Instructions (Optional)</label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#161A18] border border-[#3B413C] text-sm text-[#FFFFFF] focus:outline-none focus:border-[#94D1BE] focus:ring-1 focus:ring-[#94D1BE] transition-all font-sans"
                placeholder="e.g. Pay special attention to security, error edge cases, or API documentation."
              />
            </div>
          </div>

          {/* Folder & File Drag/Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-8 transition-all text-center flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-[#94D1BE] bg-[#94D1BE]/10 shadow-[0_0_25px_rgba(148,209,190,0.3)]'
                : 'border-[#3B413C] bg-[#222825]/50 hover:border-[#9DB5B2] hover:bg-[#222825]/80'
            }`}
          >
            {/* Hidden native inputs */}
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderSelect}
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={filesInputRef}
              onChange={handleFilesSelect}
              multiple
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#94D1BE]/20 to-[#3B413C] border border-[#94D1BE]/30 flex items-center justify-center shadow-[0_0_20px_rgba(148,209,190,0.2)]">
              <UploadCloud className="w-8 h-8 text-[#94D1BE]" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h4 className="text-base font-semibold text-[#FFFFFF]">
                Drag & Drop Completed Task Folder or Files Here
              </h4>
              <p className="text-xs text-[#9DB5B2]">
                Access your local hard drive to upload full directory structures, code files, documents, or asset bundles.
              </p>
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirectoryPicker}
                className="px-4 py-2.5 rounded-lg bg-[#94D1BE] hover:bg-[#A5DBCB] text-[#161A18] font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(148,209,190,0.35)] transition-all active:scale-95 cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-[#161A18]" />
                Select Local Task Folder
              </button>

              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  filesInputRef.current?.click();
                }}
                className="px-4 py-2.5 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] font-medium text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Files className="w-4 h-4 text-[#94D1BE]" />
                Select Individual Files
              </button>
            </div>

            <div className="text-[11px] text-[#9DB5B2]/80 font-mono pt-1">
              Supports .ts, .js, .py, .json, .md, .html, .css, .pdf, .docx, .zip & directory trees
            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action Button: Execute AI Deliverable Scan */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#222825] via-[#2A312D] to-[#222825] border border-[#3B413C] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#94D1BE]/10 border border-[#94D1BE]/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#94D1BE]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#FFFFFF]">
                  {files.length > 0 ? `${files.length} Deliverable Files Loaded` : 'Ready for Ingestion'}
                </div>
                <div className="text-xs text-[#9DB5B2]">
                  Generates executive review document + scheduled Google Meet link
                </div>
              </div>
            </div>

            <button
              onClick={executeScan}
              disabled={isScanning || files.length === 0}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all shadow-lg flex items-center justify-center gap-2.5 ${
                isScanning || files.length === 0
                  ? 'bg-[#2A312D] text-[#9DB5B2]/50 border border-[#3B413C] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#94D1BE] to-[#DAF0EE] text-[#161A18] hover:opacity-95 shadow-[0_0_20px_rgba(148,209,190,0.4)] active:scale-95 cursor-pointer'
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#161A18] border-t-transparent rounded-full animate-spin" />
                  <span>Auditing Files...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#161A18]" />
                  <span>Run AI Deliverable Audit</span>
                </>
              )}
            </button>
          </div>

          {/* High-tech Scanning Telemetry Modal / Overlay */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-[#161A18] border border-[#94D1BE]/60 shadow-[0_0_30px_rgba(148,209,190,0.25)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#94D1BE] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#94D1BE] animate-ping" />
                  Deep Deliverable Analysis Active
                </span>
                <span className="text-xs font-mono text-[#9DB5B2]">{scanProgress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#222825] overflow-hidden border border-[#3B413C]">
                <div
                  className="h-full bg-gradient-to-r from-[#94D1BE] to-[#DAF0EE] transition-all duration-500 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[#DAF0EE]">
                <span className="text-[#94D1BE]">►</span>
                <span>{scanStep}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: File Explorer & Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#222825]/90 border border-[#3B413C] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#FFFFFF] flex items-center gap-2">
                <Files className="w-4 h-4 text-[#94D1BE]" />
                Folder Manifest ({files.length})
              </h3>
              {files.length > 0 && (
                <button
                  onClick={() => {
                    playCyberClick();
                    setFiles([]);
                    setSelectedFileForPreview(null);
                  }}
                  className="text-xs text-[#9DB5B2] hover:text-rose-400 flex items-center gap-1 font-mono transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* File List */}
            {files.length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-[#3B413C] rounded-xl space-y-2">
                <Files className="w-8 h-8 text-[#9DB5B2]/40 mx-auto" />
                <div className="text-xs text-[#9DB5B2] font-mono">No files in manifest yet</div>
                <div className="text-[11px] text-[#9DB5B2]/70">
                  Select a local folder or choose a sample package above
                </div>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playCyberClick();
                      setSelectedFileForPreview(file);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                      selectedFileForPreview?.path === file.path
                        ? 'bg-[#2E3632] text-[#94D1BE] border border-[#94D1BE]/60 shadow-[0_0_10px_rgba(148,209,190,0.18)]'
                        : 'bg-[#161A18]/80 text-[#DAF0EE]/85 hover:bg-[#2A312D] border border-[#3B413C]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(file.name)}
                      <span className="truncate">{file.path || file.name}</span>
                    </div>
                    <span className="text-[10px] text-[#9DB5B2] shrink-0 ml-2">
                      {formatBytes(file.size)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected File Content Snippet Drawer */}
            {selectedFileForPreview && (
              <div className="space-y-2 pt-2 border-t border-[#3B413C]">
                <div className="flex items-center justify-between text-xs font-mono text-[#9DB5B2]">
                  <span className="truncate font-semibold text-[#FFFFFF]">
                    {selectedFileForPreview.name}
                  </span>
                  <span className="text-[10px] text-[#94D1BE] uppercase">
                    Preview ({formatBytes(selectedFileForPreview.size)})
                  </span>
                </div>
                <div className="rounded-xl bg-[#161A18] border border-[#3B413C] p-3 max-h-52 overflow-y-auto font-mono text-[11px] text-[#DAF0EE] leading-relaxed scanline">
                  {selectedFileForPreview.content ? (
                    <pre className="whitespace-pre-wrap break-all">
                      {selectedFileForPreview.content.slice(0, 3000)}
                      {selectedFileForPreview.content.length > 3000 && '\n... [Remaining content loaded for AI scan]'}
                    </pre>
                  ) : (
                    <div className="text-[#9DB5B2] italic">Binary or empty file. Parsed for metadata.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

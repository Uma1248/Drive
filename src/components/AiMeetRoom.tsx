import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  PhoneOff,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  Send,
  User,
  ShieldCheck,
  FileText,
  Clock,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { ReviewDocumentData, ChatMessage } from '../types';
import { speakText, stopSpeaking, isSpeechSupported, createSpeechRecognizer } from '../utils/speech';
import { playCyberClick, playMeetChime } from '../utils/sound';

interface AiMeetRoomProps {
  review: ReviewDocumentData;
  onLeaveMeeting: () => void;
}

export const AiMeetRoom: React.FC<AiMeetRoomProps> = ({ review, onLeaveMeeting }) => {
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [presentingDoc, setPresentingDoc] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Play chime on entering meeting
  useEffect(() => {
    playMeetChime();

    const initialText =
      review.speechIntro ||
      `Hello! I am Dr. Elena Vance, your Principal Review Lead. I have evaluated all ${review.fileCount} items in your task folder "${review.projectName}". Your performance score is ${review.overallScore} out of 100 with a status of "${review.verdict}". I am ready to answer any questions and walk through the rubric findings.`;

    const welcomeMsg: ChatMessage = {
      id: 'msg-welcome',
      sender: 'ai',
      text: initialText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);

    if (voicePlaybackEnabled && isSpeechSupported()) {
      setIsAiSpeaking(true);
      speakText(
        initialText,
        () => setIsAiSpeaking(true),
        () => setIsAiSpeaking(false)
      );
    }

    return () => {
      stopSpeaking();
      stopCamera();
    };
  }, []);

  // Meeting Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleCamera = async () => {
    playCyberClick();
    if (cameraEnabled) {
      stopCamera();
      setCameraEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraEnabled(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraEnabled(false);
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleMicListening = () => {
    playCyberClick();
    if (isListeningMic) {
      setIsListeningMic(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setInputMsg(transcript);
          setIsListeningMic(false);
        },
        () => setIsListeningMic(false)
      );
      if (recognizer) {
        try {
          recognizer.start();
          setIsListeningMic(true);
        } catch (e) {
          setIsListeningMic(false);
        }
      } else {
        alert('Speech recognition is not supported in this browser. Please type your message.');
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isAiThinking) return;

    playCyberClick();
    const userText = inputMsg.trim();
    setInputMsg('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/review/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          reviewContext: review,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || 'I understand. Let us review that item in the task specifications.';

      const replyMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, replyMsg]);

      if (voicePlaybackEnabled && isSpeechSupported()) {
        speakText(
          aiReply,
          () => setIsAiSpeaking(true),
          () => setIsAiSpeaking(false)
        );
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleReplaySpeech = (text: string) => {
    playCyberClick();
    if (isSpeechSupported()) {
      speakText(
        text,
        () => setIsAiSpeaking(true),
        () => setIsAiSpeaking(false)
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto rounded-2xl bg-[#161A18] border border-[#3B413C] overflow-hidden shadow-2xl">
      {/* Google Meet Room Top Bar */}
      <div className="px-6 py-3 bg-[#222825] border-b border-[#3B413C] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#94D1BE]/20 border border-[#94D1BE]/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-[#94D1BE] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#FFFFFF] tracking-tight">
                Google Meet: {review.projectName}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161A18] border border-[#94D1BE]/60 text-[#94D1BE] font-semibold">
                LIVE
              </span>
            </div>
            <div className="text-xs text-[#9DB5B2] font-mono flex items-center gap-2">
              <span>meet.google.com/{review.meetCode}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#DAF0EE]">
                <Clock className="w-3 h-3 text-[#94D1BE]" />
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <a
            href={review.googleMeetLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playCyberClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] border border-[#3B413C] text-xs font-mono transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#94D1BE]" />
            Launch Tab
          </a>

          <button
            onClick={() => {
              playCyberClick();
              if (isAiSpeaking) {
                stopSpeaking();
                setIsAiSpeaking(false);
              }
              setVoicePlaybackEnabled(!voicePlaybackEnabled);
            }}
            title={voicePlaybackEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            className="p-2 rounded-lg bg-[#2A312D] border border-[#3B413C] text-[#DAF0EE] hover:text-[#94D1BE] transition-colors cursor-pointer"
          >
            {voicePlaybackEnabled ? (
              <Volume2 className="w-4 h-4 text-[#94D1BE]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#9DB5B2]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Video & Chat Stage */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Stage (Grid of AI Reviewer & Client) */}
        <div className="flex-1 p-4 bg-[#161A18] flex flex-col justify-between overflow-y-auto">
          {/* Main Video Grid */}
          <div
            className={`grid gap-4 flex-1 items-stretch ${
              presentingDoc ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {/* If Presenting Document is Active */}
            {presentingDoc && (
              <div className="lg:col-span-2 rounded-2xl bg-[#FFFFFF] text-[#3B413C] border border-[#9DB5B2]/50 p-6 overflow-y-auto max-h-[500px] shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-[#9DB5B2]/40 mb-4">
                  <span className="text-xs font-mono font-bold text-[#6C827F] uppercase">
                    Screen Share: Task Review Document
                  </span>
                  <span className="text-xs font-mono font-bold text-[#3B413C] bg-[#DAF0EE] px-2 py-0.5 rounded">
                    Score: {review.overallScore}/100
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#3B413C]">{review.projectName}</h3>
                <p className="text-xs text-[#4A524C] mt-1">{review.executiveSummary}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {review.rubrics.map((r, i) => (
                    <div key={i} className="p-2.5 rounded bg-[#DAF0EE]/20 border border-[#9DB5B2]/40">
                      <div className="font-semibold text-[#3B413C]">{r.criteria}</div>
                      <div className="text-[#6C827F] font-mono text-[11px]">{r.score}/100</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reviewer Tile */}
            <div className="relative rounded-2xl bg-gradient-to-br from-[#222825] via-[#2A312D] to-[#1E2321] border border-[#94D1BE]/40 p-6 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_0_25px_rgba(148,209,190,0.2)] min-h-[260px]">
              {/* Tactical Gamer HUD Corners */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161A18]/90 border border-[#3B413C] text-[11px] font-mono text-[#94D1BE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#94D1BE]" />
                <span>AI Principal Auditor</span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#161A18] text-[#94D1BE] border border-[#3B413C] font-semibold">
                  {review.overallScore}% MATCH
                </span>
              </div>

              {/* AI Avatar with Speaking Waves */}
              <div className="relative mt-2">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr from-[#94D1BE] via-[#DAF0EE] to-[#3B413C] p-1 transition-all duration-300 ${
                    isAiSpeaking ? 'scale-105 shadow-[0_0_35px_rgba(148,209,190,0.6)]' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-[#161A18] flex items-center justify-center overflow-hidden">
                    <Sparkles className="w-10 h-10 text-[#94D1BE]" />
                  </div>
                </div>

                {/* Animated Speech Equalizer */}
                {isAiSpeaking && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#161A18] border border-[#94D1BE] shadow-md">
                    <div className="w-1 h-3 bg-[#94D1BE] rounded-full animate-bounce" />
                    <div className="w-1 h-5 bg-[#94D1BE] rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-1 h-4 bg-[#94D1BE] rounded-full animate-bounce [animation-delay:0.3s]" />
                    <div className="w-1 h-2 bg-[#94D1BE] rounded-full animate-bounce [animation-delay:0.45s]" />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="text-base font-bold text-[#FFFFFF] flex items-center justify-center gap-1.5">
                  {review.reviewerProfile.name}
                </h4>
                <p className="text-xs text-[#9DB5B2] font-mono">
                  {review.reviewerProfile.role}
                </p>
              </div>

              {/* Speaking / Thinking Status pill */}
              <div className="mt-3">
                {isAiSpeaking ? (
                  <span className="text-[11px] font-mono text-[#161A18] font-bold px-3 py-1 rounded-full bg-[#94D1BE] border border-[#A5DBCB] flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    Presenting Review Feedback Aloud...
                  </span>
                ) : isAiThinking ? (
                  <span className="text-[11px] font-mono text-[#DAF0EE] px-3 py-1 rounded-full bg-[#2A312D] border border-[#3B413C] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#94D1BE]" />
                    Analyzing Question & Code Context...
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-[#9DB5B2] px-3 py-1 rounded-full bg-[#161A18] border border-[#3B413C]">
                    Listening · Ready for Discussion
                  </span>
                )}
              </div>
            </div>

            {/* Client Tile */}
            <div className="relative rounded-2xl bg-[#222825] border border-[#3B413C] p-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[260px]">
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#161A18]/90 border border-[#3B413C] text-[11px] font-mono text-[#DAF0EE] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#94D1BE]" />
                <span>Client Lead</span>
              </div>

              <div className="absolute top-3 right-3">
                {micEnabled ? (
                  <div className="p-1 rounded bg-[#94D1BE]/20 border border-[#94D1BE] text-[#94D1BE]">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="p-1 rounded bg-rose-950 border border-rose-800 text-rose-400">
                    <MicOff className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Client Webcam or Avatar */}
              {cameraEnabled ? (
                <div className="w-full h-full absolute inset-0 bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#161A18] border-2 border-[#3B413C] flex items-center justify-center">
                  <User className="w-12 h-12 text-[#9DB5B2]" />
                </div>
              )}

              <div className="relative z-10 mt-4 space-y-1 bg-[#161A18]/90 px-4 py-2 rounded-xl backdrop-blur-sm border border-[#3B413C]">
                <h4 className="text-sm font-bold text-[#FFFFFF]">{review.clientName}</h4>
                <p className="text-[11px] text-[#9DB5B2] font-mono">
                  {cameraEnabled ? 'Live Video Enabled' : 'Camera Off (Click to activate)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Meeting Chat Drawer */}
        {chatOpen && (
          <div className="w-full lg:w-96 bg-[#222825]/95 border-t lg:border-t-0 lg:border-l border-[#3B413C] flex flex-col shrink-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#3B413C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#94D1BE]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFFFFF]">
                  Review Meeting Discussion
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#9DB5B2]">
                {messages.length} messages
              </span>
            </div>

            {/* Chat Stream */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[400px] lg:max-h-none">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'client' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#9DB5B2]">
                      {m.sender === 'ai' ? review.reviewerProfile.name : review.clientName}
                    </span>
                    <span className="text-[9px] text-[#9DB5B2]/60 font-mono">{m.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                      m.sender === 'client'
                        ? 'bg-[#94D1BE] text-[#161A18] font-medium rounded-br-none shadow-sm'
                        : 'bg-[#161A18] text-[#DAF0EE] border border-[#3B413C] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => handleReplaySpeech(m.text)}
                        title="Replay Voice Speech"
                        className="mt-2 text-[10px] font-mono text-[#94D1BE] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        Play Audio
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#94D1BE] p-2">
                  <div className="w-3 h-3 border-2 border-[#94D1BE] border-t-transparent rounded-full animate-spin" />
                  <span>Dr. Elena Vance is drafting feedback...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#3B413C] bg-[#161A18]">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask a question about the review feedback..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#222825] border border-[#3B413C] text-xs text-[#FFFFFF] placeholder:text-[#9DB5B2] focus:outline-none focus:border-[#94D1BE] transition-colors font-sans pr-16"
                />

                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMicListening}
                    title={isListeningMic ? 'Listening...' : 'Voice Input (Dictate)'}
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      isListeningMic
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'text-[#9DB5B2] hover:text-[#94D1BE]'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputMsg.trim() || isAiThinking}
                    className="p-1.5 rounded-md bg-[#94D1BE] text-[#161A18] hover:bg-[#A5DBCB] transition-colors disabled:opacity-40 cursor-pointer font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Google Meet Bottom Controls Bar */}
      <div className="px-6 py-4 bg-[#222825] border-t border-[#3B413C] flex items-center justify-between gap-4 shrink-0">
        <div className="text-xs font-mono text-[#9DB5B2] hidden sm:block">
          Session ID: <span className="text-[#94D1BE]">{review.meetCode}</span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={() => {
              playCyberClick();
              setMicEnabled(!micEnabled);
            }}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              micEnabled
                ? 'bg-[#2A312D] text-[#DAF0EE] hover:bg-[#343D38]'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
            title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              cameraEnabled
                ? 'bg-[#2A312D] text-[#DAF0EE] hover:bg-[#343D38]'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
            title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              playCyberClick();
              setPresentingDoc(!presentingDoc);
            }}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              presentingDoc
                ? 'bg-[#94D1BE] text-[#161A18] shadow-[0_0_15px_rgba(148,209,190,0.4)]'
                : 'bg-[#2A312D] text-[#DAF0EE] hover:bg-[#343D38]'
            }`}
            title="Present Review Document on Stage"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              playCyberClick();
              setChatOpen(!chatOpen);
            }}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              chatOpen ? 'bg-[#343D38] text-[#94D1BE]' : 'bg-[#2A312D] text-[#DAF0EE] hover:bg-[#343D38]'
            }`}
            title="Toggle Meeting Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              playCyberClick();
              stopSpeaking();
              stopCamera();
              onLeaveMeeting();
            }}
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
            title="Leave Meeting Room"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playCyberClick();
              setPresentingDoc(!presentingDoc);
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A312D] hover:bg-[#343D38] text-[#DAF0EE] text-xs font-mono cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#94D1BE]" />
            {presentingDoc ? 'Hide Document' : 'Project Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

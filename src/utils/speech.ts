// Web Speech API wrapper for AI Reviewer Voice and Client Voice Input

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  stopSpeaking();

  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .slice(0, 500); // Speak first 500 characters cleanly

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Prefer natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Victoria'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  if (onStart) utterance.onstart = onStart;
  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
) {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'en-US';

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  if (onError) {
    recognizer.onerror = onError;
  }

  return recognizer;
}

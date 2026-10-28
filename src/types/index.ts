export interface ScannedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content?: string;
  lastModified?: number;
}

export interface RubricItem {
  criteria: string;
  score: number;
  maxScore: number;
  assessment: string;
}

export interface CriticalObservation {
  target: string;
  severity: 'High' | 'Medium' | 'Low';
  observation: string;
  recommendation: string;
}

export interface ActionItem {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  task: string;
  owner: string;
  estimatedEffort: string;
  completed?: boolean;
}

export interface MeetingAgendaItem {
  time: string;
  topic: string;
  objective: string;
}

export interface ReviewerProfile {
  name: string;
  role: string;
  organization: string;
}

export interface ReviewDocumentData {
  projectName: string;
  clientName: string;
  reviewDate: string;
  reviewTime: string;
  scheduledIso?: string;
  googleMeetLink: string;
  meetCode: string;
  overallScore: number;
  verdict: string;
  executiveSummary: string;
  rubrics: RubricItem[];
  strengths: string[];
  criticalObservations: CriticalObservation[];
  actionItems: ActionItem[];
  meetingAgenda: MeetingAgendaItem[];
  reviewerProfile: ReviewerProfile;
  speechIntro: string;
  scannedAt: string;
  fileCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'client';
  text: string;
  timestamp: string;
}

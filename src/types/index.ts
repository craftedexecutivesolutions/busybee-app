export interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: number;
  status: 'recording' | 'processing' | 'completed' | 'error';
  type: 'commission' | 'case' | 'board' | 'other';
  audioUrl?: string;
  transcriptUrl?: string;
  summaryUrl?: string;
  participants: string[];
}

export interface MeetingTemplate {
  id: string;
  name: string;
  type: 'commission' | 'case' | 'board' | 'notice';
  template: string;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
  stream?: MediaStream;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: {
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }[];
}

export interface AIProcessingResult {
  transcript: string;
  summary: string;
  actionItems: string[];
  participants: string[];
  meetingType: 'general' | 'case' | 'board' | 'other' | 'error';
  keyDecisions: string[];
}

// Specialized result types for different agents
export interface BoardMeetingResult extends AIProcessingResult {
  meetingType: 'board';
  attendance: Array<{
    name: string;
    role: string;
    present: boolean;
    arrivalTime?: string;
  }>;
  motions: Array<{
    number: number;
    text: string;
    maker: string;
    seconder: string;
    result: string;
    voteCount?: { yes: number; no: number; abstain: number; };
  }>;
  quorumStatus: {
    met: boolean;
    presentCount: number;
    requiredCount: number;
  };
  agendaItems: Array<{
    title: string;
    discussion: string;
    outcome?: string;
  }>;
}

export interface LegalCaseResult extends AIProcessingResult {
  meetingType: 'case';
  caseInformation: {
    caseNumber?: string;
    caseTitle?: string;
    jurisdiction?: string;
    caseType?: string;
  };
  parties: {
    plaintiffs: string[];
    defendants: string[];
    attorneys: Array<{
      name: string;
      representing: string;
      role: string;
    }>;
  };
  courtPersonnel: {
    judge?: string;
    hearingOfficer?: string;
    courtReporter?: string;
    bailiff?: string;
  };
  hearingDetails: {
    hearingType?: string;
    date: string;
    time?: string;
    location?: string;
  };
  legalIssues: string[];
  proceduralMatters: Array<{
    type: 'motion' | 'objection' | 'ruling' | 'order';
    description: string;
    outcome?: string;
  }>;
  evidence: Array<{
    type: 'document' | 'testimony' | 'exhibit';
    description: string;
    submittedBy?: string;
  }>;
  rulings: Array<{
    issue: string;
    ruling: string;
    reasoning?: string;
  }>;
  nextSteps: Array<{
    description: string;
    deadline?: string;
    responsibleParty?: string;
  }>;
  importantDates: Array<{
    date: string;
    description: string;
    type: 'hearing' | 'filing' | 'deadline' | 'other';
  }>;
}
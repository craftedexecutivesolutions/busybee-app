export interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: number;
  status: 'recording' | 'processing' | 'completed' | 'error';
  type: 'commission' | 'case' | 'other';
  audioUrl?: string;
  transcriptUrl?: string;
  summaryUrl?: string;
  participants: string[];
}

export interface MeetingTemplate {
  id: string;
  name: string;
  type: 'commission' | 'case' | 'notice';
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
  meetingType: 'commission' | 'case' | 'other';
  keyDecisions: string[];
}
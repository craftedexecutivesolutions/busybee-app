import { TranscriptionResult, AIProcessingResult } from '@/types';
import { COMMON_NAMES, MEETING_TEMPLATES } from './templates';

export class AIProcessor {
  // Simulate AI transcription (in production, you'd integrate with OpenAI Whisper or similar)
  static async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        // This is a mock implementation
        // In production, you would send audioBlob to your transcription service
        resolve({
          text: "This is a mock transcription. In production, this would be the actual transcribed text from the audio recording.",
          confidence: 0.95,
          segments: [
            {
              start: 0,
              end: 5,
              text: "Meeting called to order by Chairperson Raymond Muna.",
              speaker: "Raymond Muna"
            },
            {
              start: 5,
              end: 10,
              text: "Thank you, Chair. I move to approve the agenda.",
              speaker: "Patrick Fitial"
            }
          ]
        });
      }, 2000);
    });
  }

  // Process transcript and generate structured meeting notes
  static async processTranscript(
    transcript: string, 
    meetingTitle: string
  ): Promise<AIProcessingResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Detect meeting type based on content keywords
        const meetingType = this.detectMeetingType(transcript, meetingTitle);
        
        // Extract participants using name matching
        const participants = this.extractParticipants(transcript);
        
        // Generate summary based on meeting type
        const summary = this.generateSummary(transcript, meetingType);
        
        // Extract action items
        const actionItems = this.extractActionItems(transcript);
        
        // Extract key decisions
        const keyDecisions = this.extractKeyDecisions(transcript);

        resolve({
          transcript: this.correctNames(transcript),
          summary,
          actionItems,
          participants,
          meetingType,
          keyDecisions
        });
      }, 3000);
    });
  }

  private static detectMeetingType(transcript: string, title: string): 'commission' | 'case' | 'other' {
    const text = (transcript + ' ' + title).toLowerCase();
    
    // Check for case-related keywords
    if (text.includes('csc-') || text.includes('appellant') || text.includes('hearing officer') || 
        text.includes('status conference') || text.includes('adjudication')) {
      return 'case';
    }
    
    // Check for commission meeting keywords
    if (text.includes('commission meeting') || text.includes('chairperson') || 
        text.includes('motion') || text.includes('quorum') || text.includes('agenda')) {
      return 'commission';
    }
    
    return 'other';
  }

  private static extractParticipants(transcript: string): string[] {
    const participants = new Set<string>();
    const text = transcript.toLowerCase();
    
    // Check for each known name and its variations
    Object.entries(COMMON_NAMES).forEach(([correctName, variations]) => {
      const found = variations.some(variation => 
        text.includes(variation.toLowerCase())
      );
      if (found) {
        participants.add(correctName);
      }
    });
    
    return Array.from(participants);
  }

  private static correctNames(transcript: string): string {
    let correctedTranscript = transcript;
    
    Object.entries(COMMON_NAMES).forEach(([correctName, variations]) => {
      variations.forEach(variation => {
        const regex = new RegExp(`\\b${variation}\\b`, 'gi');
        correctedTranscript = correctedTranscript.replace(regex, correctName);
      });
    });
    
    return correctedTranscript;
  }

  private static generateSummary(transcript: string, meetingType: 'commission' | 'case' | 'other'): string {
    const template = MEETING_TEMPLATES.find(t => t.type === meetingType)?.template;
    
    if (!template) {
      return this.generateBasicSummary(transcript);
    }

    // In production, you would use AI to fill in the template placeholders
    // For now, we'll return a basic summary
    return this.generateBasicSummary(transcript);
  }

  private static generateBasicSummary(transcript: string): string {
    // Extract first few sentences as summary
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    return `# Meeting Summary\n\n${summary}\n\n## Key Points\n- Meeting discussions recorded\n- Participants identified\n- Action items extracted`;
  }

  private static extractActionItems(transcript: string): string[] {
    const actionWords = ['will', 'shall', 'must', 'need to', 'should', 'deadline', 'by'];
    const sentences = transcript.split(/[.!?]+/);
    
    const actionItems = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return actionWords.some(word => lowerSentence.includes(word)) &&
             (lowerSentence.includes('date') || lowerSentence.includes('time') || lowerSentence.includes('week'));
    });
    
    return actionItems.slice(0, 5).map(item => item.trim());
  }

  private static extractKeyDecisions(transcript: string): string[] {
    const decisionWords = ['approved', 'denied', 'decided', 'voted', 'motion carried', 'motion failed'];
    const sentences = transcript.split(/[.!?]+/);
    
    const decisions = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return decisionWords.some(word => lowerSentence.includes(word));
    });
    
    return decisions.slice(0, 3).map(decision => decision.trim());
  }

  // Save processed meeting files to the actual file system folders
  static async saveMeetingFiles(
    result: AIProcessingResult,
    meetingTitle: string,
    audioBlob: Blob,
    duration: number = 0
  ): Promise<{ transcriptPath: string; summaryPath: string; audioPath: string }> {
    const { FileSystemManager } = await import('./file-system');
    const { FileOrganizer } = await import('./file-organizer');
    
    try {
      // Generate appropriate file names
      const audioFileName = FileSystemManager.generateFileName(
        meetingTitle,
        result.meetingType,
        'wav'
      );
      
      const transcriptFileName = FileSystemManager.generateFileName(
        meetingTitle,
        result.meetingType,
        'txt',
        'transcript'
      );
      
      const summaryFileName = FileSystemManager.generateFileName(
        meetingTitle,
        result.meetingType,
        'md',
        'summary'
      );
      
      const analysisFileName = FileSystemManager.generateFileName(
        meetingTitle,
        result.meetingType,
        'json',
        'analysis'
      );

      // Determine if this is an official order
      const isOfficialOrder = this.isOfficialOrder(result);
      
      // Apply appropriate template
      const templateType = isOfficialOrder ? 'notice' : 
                          (result.meetingType === 'case' ? 'case' : 'commission');
      
      const formattedSummary = FileOrganizer.applyTemplate(templateType, result, {
        id: Date.now().toString(),
        title: meetingTitle,
        date: new Date(),
        duration,
        status: 'completed' as const,
        type: result.meetingType,
        participants: result.participants
      });

      // Save files to respective folders with downloads
      const audioPath = await FileSystemManager.saveAudioFile(audioBlob, audioFileName);
      const transcriptPath = await FileSystemManager.saveTranscriptFile(result.transcript, transcriptFileName);
      const summaryPath = await FileSystemManager.saveSummaryFile(formattedSummary, summaryFileName, isOfficialOrder);
      
      // Save analysis metadata
      const analysisData = {
        meetingTitle,
        meetingType: result.meetingType,
        participants: result.participants,
        actionItems: result.actionItems,
        keyDecisions: result.keyDecisions,
        confidence: 0.95,
        processedAt: new Date().toISOString(),
        duration
      };
      
      await FileSystemManager.saveAnalysisFile(analysisData, analysisFileName);

      return {
        transcriptPath,
        summaryPath,
        audioPath
      };
      
    } catch (error) {
      console.error('Error saving meeting files:', error);
      throw new Error('Failed to save meeting files to folders');
    }
  }

  // Helper method to determine if content should be an official order
  private static isOfficialOrder(result: AIProcessingResult): boolean {
    const orderKeywords = [
      'hereby ordered',
      'status conference',
      'hearing notice',
      'scheduling order',
      'continuance notice', 
      'final decision',
      'administrative order',
      'procedural notice',
      'civil service case',
      'csc-'
    ];

    const transcript = result.transcript.toLowerCase();
    
    // Check if transcript contains order-related keywords
    const hasOrderKeywords = orderKeywords.some(keyword => 
      transcript.includes(keyword.toLowerCase())
    );

    // Check if it's a case-related meeting (case meetings often generate orders)
    const isCaseRelated = result.meetingType === 'case';

    // Check if key decisions contain order language
    const hasOrderDecisions = result.keyDecisions.some(decision =>
      orderKeywords.some(keyword => decision.toLowerCase().includes(keyword.toLowerCase()))
    );

    return hasOrderKeywords || (isCaseRelated && hasOrderDecisions);
  }
}
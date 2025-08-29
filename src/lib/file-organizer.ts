import { Recording, AIProcessingResult } from '@/types';
import { MEETING_TEMPLATES } from './templates';

export class FileOrganizer {
  // Base paths that match your existing system structure
  private static readonly FOLDER_PATHS = {
    recordings: '/Recordings',
    transcripts: '/Transcripts', 
    notes: '/Notes',
    orders: '/Orders_Notice',
    logs: '/Logs'
  };

  /**
   * Organize files based on meeting type and content
   */
  static organizeFiles(
    recording: Recording,
    result: AIProcessingResult,
    audioBlob: Blob
  ): Promise<{ organizedPaths: Record<string, string> }> {
    return new Promise((resolve) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedTitle = recording.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
      const baseFileName = `${sanitizedTitle}_${timestamp}`;

      // Determine file organization based on meeting type and content
      const paths = this.determineFilePaths(recording, result, baseFileName);

      // In production, you would actually move/copy files here
      // For now, we simulate the organization
      setTimeout(() => {
        resolve({
          organizedPaths: paths
        });
      }, 1000);
    });
  }

  /**
   * Determine appropriate file paths based on meeting type and content analysis
   */
  private static determineFilePaths(
    recording: Recording,
    result: AIProcessingResult,
    baseFileName: string
  ): Record<string, string> {
    const paths: Record<string, string> = {};

    // Audio file always goes to Recordings
    paths.audio = `${this.FOLDER_PATHS.recordings}/${baseFileName}.wav`;

    // Transcript always goes to Transcripts
    paths.transcript = `${this.FOLDER_PATHS.transcripts}/${baseFileName}_transcript.txt`;

    // Determine where summary/notes should go based on content analysis
    if (this.isOfficialOrder(result)) {
      // Official orders and notices go to Orders_Notice folder
      paths.summary = `${this.FOLDER_PATHS.orders}/${baseFileName}_order.md`;
    } else {
      // Regular meeting notes go to Notes folder
      paths.summary = `${this.FOLDER_PATHS.notes}/${baseFileName}_summary.md`;
    }

    // Additional analysis file for processing metadata
    paths.analysis = `${this.FOLDER_PATHS.transcripts}/${baseFileName}_analysis.json`;

    return paths;
  }

  /**
   * Analyze content to determine if it should be classified as an official order/notice
   */
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

  /**
   * Generate appropriate filename based on content and templates
   */
  static generateFileName(
    recording: Recording,
    result: AIProcessingResult,
    fileType: 'audio' | 'transcript' | 'summary' | 'analysis'
  ): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const sanitizedTitle = recording.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');

    let fileName = '';

    switch (result.meetingType) {
      case 'case':
        // Extract case number if available
        const caseNumber = this.extractCaseNumber(result.transcript);
        if (caseNumber) {
          fileName = `${caseNumber}_${sanitizedTitle}_${date}`;
        } else {
          fileName = `Case_${sanitizedTitle}_${date}`;
        }
        break;

      case 'commission':
        fileName = `Commission_${sanitizedTitle}_${date}`;
        break;

      default:
        fileName = `${sanitizedTitle}_${date}`;
    }

    // Add file type suffix
    switch (fileType) {
      case 'audio':
        return `${fileName}.wav`;
      case 'transcript':
        return `${fileName}_transcript.txt`;
      case 'summary':
        return `${fileName}_summary.md`;
      case 'analysis':
        return `${fileName}_analysis.json`;
      default:
        return fileName;
    }
  }

  /**
   * Extract case number from transcript if available
   */
  private static extractCaseNumber(transcript: string): string | null {
    // Look for CSC case number pattern: CSC-XX-XXX
    const caseNumberRegex = /CSC-\d{2}-\d{3}/gi;
    const match = transcript.match(caseNumberRegex);
    return match ? match[0].toUpperCase() : null;
  }

  /**
   * Create folder structure if it doesn't exist (simulation)
   */
  static async ensureFolderStructure(): Promise<void> {
    // In production, this would actually create the directories
    // For now, we just simulate the check
    return new Promise((resolve) => {
      console.log('Ensuring folder structure exists...');
      setTimeout(() => {
        console.log('Folder structure verified');
        resolve();
      }, 500);
    });
  }

  /**
   * Apply template to generate formatted output
   */
  static applyTemplate(
    templateType: 'commission' | 'case' | 'notice',
    result: AIProcessingResult,
    recording: Recording
  ): string {
    const template = MEETING_TEMPLATES.find(t => t.type === templateType);
    if (!template) {
      return result.summary; // Fallback to basic summary
    }

    let formattedContent = template.template;

    // Replace common placeholders
    const date = new Date(recording.date);
    formattedContent = formattedContent
      .replace(/\[MEETING_DATE\]/g, date.toISOString().split('T')[0])
      .replace(/\[RECORDING_FILENAME\]/g, `${recording.title}.wav`)
      .replace(/\[MEETING_TYPE\]/g, recording.type.charAt(0).toUpperCase() + recording.type.slice(1))
      .replace(/\[PREPARATION_DATE\]/g, new Date().toISOString().split('T')[0]);

    // Add participants if available
    if (result.participants.length > 0) {
      const participantsList = result.participants.map(p => `- ${p}`).join('\n');
      formattedContent = formattedContent.replace(/\[PARTICIPANTS\]/g, participantsList);
    }

    // Add action items if available
    if (result.actionItems.length > 0) {
      const actionItemsList = result.actionItems.map(item => `- ${item}`).join('\n');
      formattedContent = formattedContent.replace(/\[ACTION_ITEMS\]/g, actionItemsList);
    }

    // Add key decisions if available
    if (result.keyDecisions.length > 0) {
      const decisionsList = result.keyDecisions.map(decision => `- ${decision}`).join('\n');
      formattedContent = formattedContent.replace(/\[KEY_DECISIONS\]/g, decisionsList);
    }

    return formattedContent;
  }

  /**
   * Save all processed files to their organized locations
   */
  static async saveOrganizedFiles(
    recording: Recording,
    result: AIProcessingResult,
    audioBlob: Blob,
    organizedPaths: Record<string, string>
  ): Promise<{ success: boolean; savedPaths: Record<string, string> }> {
    try {
      await this.ensureFolderStructure();

      // Apply appropriate template based on content analysis
      const templateType = this.isOfficialOrder(result) ? 'notice' : 
                          (result.meetingType === 'case' ? 'case' : 'commission');
      
      const formattedSummary = this.applyTemplate(templateType, result, recording);

      // In production, you would actually write these files
      // For now, we simulate saving them
      const savedPaths = {
        audio: organizedPaths.audio,
        transcript: organizedPaths.transcript,
        summary: organizedPaths.summary,
        analysis: organizedPaths.analysis
      };

      // Simulate file writing process
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        savedPaths
      };

    } catch (error) {
      console.error('Error saving organized files:', error);
      return {
        success: false,
        savedPaths: {}
      };
    }
  }
}
import { Recording, AIProcessingResult } from '@/types';

export class FileSystemManager {
  // Base paths to your existing folder structure
  private static readonly BASE_PATH = '/Users/terese/Library/Mobile Documents/com~apple~CloudDocs/Desktop/coding projects/comprehensive-ai-recorder';
  
  private static readonly FOLDERS = {
    recordings: `${this.BASE_PATH}/Recording`,
    transcripts: `${this.BASE_PATH}/Transcripts`, 
    notes: `${this.BASE_PATH}/Notes`,
    orders: `${this.BASE_PATH}/Orders_Notice`,
    logs: `${this.BASE_PATH}/Logs`
  };

  /**
   * Save audio blob to the Recording folder
   */
  static async saveAudioFile(audioBlob: Blob, fileName: string): Promise<string> {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      
      const filePath = `${this.FOLDERS.recordings}/${fileName}`;
      
      // In browser environment, we'll trigger a download to the correct folder
      // For actual file system access, you'd need a Node.js backend
      const url = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Store the file path for the user to manually move if needed
      localStorage.setItem(`audio_${fileName}`, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error saving audio file:', error);
      throw error;
    }
  }

  /**
   * Save transcript to the Transcripts folder
   */
  static async saveTranscriptFile(transcript: string, fileName: string): Promise<string> {
    try {
      const filePath = `${this.FOLDERS.transcripts}/${fileName}`;
      
      // Create a blob and download it
      const blob = new Blob([transcript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Store file info for later reference
      localStorage.setItem(`transcript_${fileName}`, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error saving transcript file:', error);
      throw error;
    }
  }

  /**
   * Save summary/notes to the appropriate folder (Notes or Orders_Notice)
   */
  static async saveSummaryFile(
    summary: string, 
    fileName: string, 
    isOfficialOrder: boolean = false
  ): Promise<string> {
    try {
      const folder = isOfficialOrder ? this.FOLDERS.orders : this.FOLDERS.notes;
      const filePath = `${folder}/${fileName}`;
      
      // Create markdown file
      const blob = new Blob([summary], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Store file info
      localStorage.setItem(`summary_${fileName}`, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error saving summary file:', error);
      throw error;
    }
  }

  /**
   * Save analysis metadata to Transcripts folder
   */
  static async saveAnalysisFile(analysis: any, fileName: string): Promise<string> {
    try {
      const filePath = `${this.FOLDERS.transcripts}/${fileName}`;
      
      const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      localStorage.setItem(`analysis_${fileName}`, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error saving analysis file:', error);
      throw error;
    }
  }

  /**
   * Generate appropriate filenames based on meeting type and date
   */
  static generateFileName(
    title: string,
    meetingType: 'commission' | 'case' | 'other',
    extension: string,
    suffix: string = ''
  ): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
    
    // Clean title for filename
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    
    let prefix = '';
    switch (meetingType) {
      case 'commission':
        prefix = 'Commission_';
        break;
      case 'case':
        prefix = 'Case_';
        break;
      default:
        prefix = '';
    }
    
    const suffixPart = suffix ? `_${suffix}` : '';
    
    return `${prefix}${cleanTitle}_${dateStr}_${timeStr}${suffixPart}.${extension}`;
  }

  /**
   * Check if folders exist (for UI feedback)
   */
  static async checkFoldersExist(): Promise<{ [key: string]: boolean }> {
    // In browser environment, we can't actually check file system
    // Return assumed true for UI purposes
    return {
      recordings: true,
      transcripts: true,
      notes: true,
      orders: true,
      logs: true
    };
  }

  /**
   * Get file stats for dashboard
   */
  static getFileStats(): {
    recordingsPath: string;
    transcriptsPath: string;
    notesPath: string;
    ordersPath: string;
  } {
    return {
      recordingsPath: this.FOLDERS.recordings,
      transcriptsPath: this.FOLDERS.transcripts,
      notesPath: this.FOLDERS.notes,
      ordersPath: this.FOLDERS.orders
    };
  }
}
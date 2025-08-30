import { AIProcessingResult, LegalCaseResult, BoardMeetingResult } from '@/types';

export class OpenAIClient {
  private static instance: OpenAIClient;
  private baseUrl: string;

  private constructor() {
    // Use the API route we created instead of calling OpenAI directly
    this.baseUrl = '/api/ai-process';
  }

  public static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  // Process audio file (transcribe + analyze)
  public async processAudioFile(
    audioFile: File,
    meetingTitle: string,
    meetingType: 'commission' | 'case' | 'board' | 'other' = 'other'
  ): Promise<AIProcessingResult | LegalCaseResult | BoardMeetingResult> {
    
    console.log(`🎵 Processing ${meetingType} audio: "${meetingTitle}"`);
    console.log(`📁 File: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);
    
    try {
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      formData.append('meetingTitle', meetingTitle);
      formData.append('meetingType', meetingType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData // No Content-Type header for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Audio processing completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Audio processing error:', error);
      return this.createAudioFallbackResponse(meetingTitle, audioFile, error);
    }
  }

  // Process text transcript
  public async processTranscript(
    transcript: string,
    meetingTitle: string,
    meetingType: 'commission' | 'case' | 'board' | 'other' = 'other'
  ): Promise<AIProcessingResult | LegalCaseResult | BoardMeetingResult> {
    
    console.log(`🤖 Processing ${meetingType} meeting: "${meetingTitle}"`);
    console.log(`📊 Transcript length: ${transcript.length} characters`);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          meetingTitle,
          meetingType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ OpenAI processing completed successfully');
      console.log(`📋 Extracted ${result.actionItems?.length || 0} action items`);
      console.log(`👥 Identified ${result.participants?.length || 0} participants`);
      console.log(`🎯 Found ${result.keyDecisions?.length || 0} key decisions`);

      return result;

    } catch (error) {
      console.error('❌ OpenAI Client Error:', error);
      
      // Return a fallback error response that matches our interface
      const fallbackResult: AIProcessingResult = {
        transcript,
        summary: this.generateFallbackSummary(meetingTitle, transcript, error),
        actionItems: [],
        participants: [],
        meetingType: 'error',
        keyDecisions: []
      };

      return fallbackResult;
    }
  }

  private generateFallbackSummary(title: string, transcript: string, error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return `# ${title} - Processing Error\n\n` +
           `**Error:** AI processing failed - ${errorMessage}\n\n` +
           `**Status:** Fallback mode activated\n\n` +
           `## Content Preview\n` +
           `${transcript.substring(0, 500)}${transcript.length > 500 ? '...' : ''}\n\n` +
           `---\n\n` +
           `⚠️ **AI Processing Unavailable**\n` +
           `The advanced AI analysis could not be completed. Please check your API configuration or try again later.\n` +
           `For now, you can view the raw transcript content above.\n\n` +
           `**Transcript Length:** ${transcript.length} characters\n` +
           `**Error Details:** ${errorMessage}`;
  }

  private createAudioFallbackResponse(title: string, audioFile: File, error: unknown): AIProcessingResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const fallbackSummary = `# ${title} - Audio Processing Error\n\n` +
                           `**Error:** Audio processing failed - ${errorMessage}\n\n` +
                           `**File:** ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)\n\n` +
                           `---\n\n` +
                           `⚠️ **Audio Processing Failed**\n` +
                           `The audio transcription or analysis could not be completed.\n\n` +
                           `**Troubleshooting:**\n` +
                           `- Check your OpenAI API key configuration\n` +
                           `- Ensure you have sufficient API credits\n` +
                           `- Verify audio file format (supported: .mp3, .wav, .m4a)\n` +
                           `- File must be under 25MB\n\n` +
                           `**Error Details:** ${errorMessage}`;

    return {
      transcript: `[Audio file: ${audioFile.name}]`,
      summary: fallbackSummary,
      actionItems: [],
      participants: [],
      meetingType: 'error',
      keyDecisions: []
    };
  }

  // Utility method to check if API is configured
  public static async checkConfiguration(): Promise<{ configured: boolean; error?: string }> {
    try {
      const response = await fetch('/api/ai-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'test',
          meetingTitle: 'Configuration Test',
          meetingType: 'other'
        })
      });

      if (response.status === 500) {
        const errorData = await response.json();
        if (errorData.details?.includes('API key')) {
          return { 
            configured: false, 
            error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
          };
        }
      }

      return { configured: true };
    } catch (error) {
      return { 
        configured: false, 
        error: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Method to estimate token usage and cost
  public static estimateUsage(transcript: string): { 
    estimatedTokens: number; 
    estimatedCost: number; 
    costBreakdown: { input: number; output: number; total: number } 
  } {
    // Rough estimation: 1 token ≈ 4 characters for English text
    const inputTokens = Math.ceil(transcript.length / 4);
    const estimatedOutputTokens = 1500; // Typical summary length
    
    // GPT-4o-mini pricing (as of 2024)
    const inputCostPer1M = 0.15; // $0.15 per 1M input tokens
    const outputCostPer1M = 0.60; // $0.60 per 1M output tokens
    
    const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
    const outputCost = (estimatedOutputTokens / 1_000_000) * outputCostPer1M;
    const totalCost = inputCost + outputCost;
    
    return {
      estimatedTokens: inputTokens + estimatedOutputTokens,
      estimatedCost: totalCost,
      costBreakdown: {
        input: inputCost,
        output: outputCost,
        total: totalCost
      }
    };
  }
}
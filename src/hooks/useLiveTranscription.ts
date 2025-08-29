'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface LiveTranscriptionState {
  isTranscribing: boolean;
  transcript: string;
  segments: {
    text: string;
    timestamp: number;
    confidence?: number;
  }[];
  error: string | null;
}

export const useLiveTranscription = () => {
  const [state, setState] = useState<LiveTranscriptionState>({
    isTranscribing: false,
    transcript: '',
    segments: [],
    error: null
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const startTranscription = useCallback(async () => {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure speech recognition for live transcription
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setState(prev => ({ 
          ...prev, 
          isTranscribing: true, 
          error: null 
        }));
      };

      recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            
            // Add to segments for better tracking
            const segment = {
              text: transcript,
              timestamp: Date.now(),
              confidence: result[0].confidence || 0.9
            };

            setState(prev => ({
              ...prev,
              transcript: finalTranscript + interimTranscript,
              segments: [...prev.segments, segment]
            }));
          } else {
            interimTranscript += transcript;
          }
        }

        // Update with final + interim results
        setState(prev => ({
          ...prev,
          transcript: finalTranscript + interimTranscript
        }));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error occurred';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak louder.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Check microphone permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during transcription.';
            break;
        }

        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isTranscribing: false
        }));
        
        // Try to restart if it's a temporary error
        if (['no-speech', 'audio-capture'].includes(event.error) && isListeningRef.current) {
          setTimeout(() => {
            if (recognitionRef.current && isListeningRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Failed to restart recognition:', e);
              }
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          // Automatically restart if we're still supposed to be listening
          try {
            recognition.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
            setState(prev => ({ 
              ...prev, 
              isTranscribing: false,
              error: 'Transcription stopped unexpectedly'
            }));
          }
        }
      };

      recognition.start();

    } catch (error) {
      console.error('Error starting transcription:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start transcription',
        isTranscribing: false
      }));
    }
  }, []);

  const stopTranscription = useCallback(() => {
    isListeningRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isTranscribing: false 
    }));
  }, []);

  const pauseTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false 
      }));
    }
  }, []);

  const resumeTranscription = useCallback(() => {
    if (recognitionRef.current || isListeningRef.current) {
      startTranscription();
    }
  }, [startTranscription]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      segments: [],
      error: null
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      isListeningRef.current = false;
    };
  }, []);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return {
    ...state,
    isSupported,
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    clearTranscript
  };
};
'use client';

import { useState, useEffect } from 'react';
import { 
  StopIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';
import BeeIcon from './BeeIcon';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useLiveTranscription } from '@/hooks/useLiveTranscription';
import { AIProcessor } from '@/lib/ai-processor';
import { Recording } from '@/types';
import toast from 'react-hot-toast';

interface RecordingInterfaceProps {
  onRecordingComplete: (recording: Recording) => void;
}

export default function RecordingInterface({ onRecordingComplete }: RecordingInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const showLiveTranscript = true; // Always show live transcript
  const [showPostRecordingForm, setShowPostRecordingForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState<'commission' | 'case' | 'other'>('commission');
  const [liveTimer, setLiveTimer] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const {
    isTranscribing,
    transcript: liveTranscript,
    segments: transcriptSegments,
    isSupported: isTranscriptionSupported,
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    clearTranscript
  } = useLiveTranscription();

  // Live timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setLiveTimer(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused, startTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setStartTime(Date.now());
      setLiveTimer(0);
      await startRecording();
      
      // Start live transcription if supported
      if (isTranscriptionSupported && showLiveTranscript) {
        await startTranscription();
      }
      
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = () => {
    setLiveTimer(0);
    stopRecording();
    stopTranscription();
    setShowPostRecordingForm(true);
    toast.success('Recording stopped');
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
      if (isTranscriptionSupported && showLiveTranscript) {
        resumeTranscription();
      }
      toast.success('Recording resumed');
    } else {
      pauseRecording();
      pauseTranscription();
      toast.success('Recording paused');
    }
  };

  const handleProcessRecording = async () => {
    if (!audioBlob || !meetingTitle.trim()) {
      toast.error('Please provide a meeting title before processing');
      return;
    }

    setIsProcessing(true);
    setShowPostRecordingForm(false);
    const processingToast = toast.loading('Processing recording...');

    try {
      // Step 1: Transcribe audio
      toast.loading('Transcribing audio...', { id: processingToast });
      const transcriptionResult = await AIProcessor.transcribeAudio(audioBlob);

      // Step 2: Process transcript
      toast.loading('Generating meeting notes...', { id: processingToast });
      const processingResult = await AIProcessor.processTranscript(
        transcriptionResult.text,
        meetingTitle
      );

      // Step 3: Save files to local storage (not desktop downloads)
      toast.loading('Saving files locally...', { id: processingToast });
      
      // Convert audio blob to base64 for storage
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      // Create recording object with local data
      const recording: Recording = {
        id: Date.now().toString(),
        title: meetingTitle,
        date: new Date(),
        duration,
        status: 'completed',
        type: meetingType,
        audioUrl: audioBase64, // Store as base64 data URL
        transcriptUrl: transcriptionResult.text, // Store transcript text directly
        summaryUrl: JSON.stringify(processingResult), // Store processed result as JSON
        participants: processingResult.participants || []
      };

      // Save to localStorage (in production, save to database)
      const existingRecordings = JSON.parse(localStorage.getItem('recordings') || '[]');
      const updatedRecordings = [recording, ...existingRecordings];
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings));

      toast.success('Recording processed and saved locally!', { id: processingToast });
      onRecordingComplete(recording);
      
      // Reset form
      setMeetingTitle('');
      setMeetingType('commission');
      resetRecording();
      clearTranscript();

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process recording', { id: processingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscardRecording = () => {
    resetRecording();
    clearTranscript();
    setShowPostRecordingForm(false);
    setMeetingTitle('');
    setMeetingType('commission');
    toast.success('Recording discarded');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light zen-text mb-3 sm:mb-4 floating">BeeRec</h1>
        <p className="text-base sm:text-lg zen-text opacity-80">
          Start the Buzz
        </p>
      </div>

      {/* Post-Recording Form Modal */}
      {showPostRecordingForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 tropical-beach-bg">
          <div className="modern-card p-6 sm:p-8 w-full max-w-md backdrop-blur-xl">
            <h3 className="text-xl sm:text-2xl font-light zen-text mb-6 sm:mb-8 text-center">Meeting Details</h3>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="meeting-title" className="block text-sm font-medium zen-text mb-2 opacity-90">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  id="meeting-title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="modern-input zen-text placeholder-white placeholder-opacity-60"
                  placeholder="e.g., Regular Meeting"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="meeting-type" className="block text-sm font-medium zen-text mb-3 opacity-90">
                  Meeting Type
                </label>
                <select
                  id="meeting-type"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as 'commission' | 'case' | 'other')}
                  className="modern-input zen-text appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="commission" style={{ background: 'rgba(0,0,0,0.9)', color: 'white' }}>Commission Meeting</option>
                  <option value="case" style={{ background: 'rgba(0,0,0,0.9)', color: 'white' }}>Case Hearing</option>
                  <option value="other" style={{ background: 'rgba(0,0,0,0.9)', color: 'white' }}>Other</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleProcessRecording}
                disabled={!meetingTitle.trim() || isProcessing}
                className="flex-1 glass-button py-3 px-6 zen-text font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    </div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Save & Process
                  </>
                )}
              </button>
              <button
                onClick={handleDiscardRecording}
                disabled={isProcessing}
                className="glass-button py-3 px-6 zen-text font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 sm:w-auto"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Recording Interface */}
      <div className="flex flex-col items-center">
        {/* Duration Display */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="modern-card px-4 sm:px-6 md:px-8 py-3 sm:py-4 mb-4 sm:mb-6 inline-block floating">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-mono font-light zen-text">
              {formatDuration(liveTimer)}
            </div>
          </div>
          {isRecording && (
            <div className="flex items-center justify-center">
              <span className={`modern-card px-6 py-2 text-sm font-medium zen-text ${
                isPaused ? '' : ''
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 inline-block ${
                  isPaused ? 'bg-yellow-400' : 'bg-red-400 animate-pulse'
                }`}></span>
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          )}
        </div>

        {/* Main Recording Button */}
        <div className="mb-8 sm:mb-12">
          {!isRecording && !audioBlob && (
            <button
              onClick={handleStartRecording}
              className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 record-button-illuminated floating"
            >
              <img src="/busybee-yellow.svg" alt="BusyBee Record" className="w-24 h-24 mx-auto record-button-bee-icon" />
              <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30 animate-pulse"></div>
            </button>
          )}

          {isRecording && (
            <div className="flex flex-col items-center space-y-6 sm:space-y-8">
              <button
                onClick={handlePauseResume}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 record-control-button floating"
              >
                {isPaused ? (
                  <PlayIcon className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 zen-text mx-auto" />
                ) : (
                  <PauseIcon className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 zen-text mx-auto" />
                )}
              </button>

              <button
                onClick={handleStopRecording}
                className="modern-button px-6 py-3 sm:px-8 sm:py-4 floating"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <StopIcon className="h-5 w-5 sm:h-6 sm:w-6 zen-text" />
                  <span className="zen-text font-medium text-sm sm:text-base">Stop Recording</span>
                </div>
              </button>
            </div>
          )}

          {audioBlob && !isRecording && !showPostRecordingForm && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-32 h-32 md:w-40 md:h-40 modern-card mx-auto flex items-center justify-center floating">
                  <DocumentTextIcon className="h-16 w-16 md:h-20 md:w-20 zen-text" />
                </div>
              </div>
              <div className="modern-card px-6 py-4 inline-block">
                <p className="text-lg zen-text mb-2">Recording completed!</p>
                <p className="text-sm zen-text opacity-75">
                  Add meeting details to process and save your recording.
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Instructions */}
        {!isRecording && !audioBlob && (
          <div className="text-center modern-card px-6 py-4">
            <p className="zen-text mb-2">Click the bee to start recording.
        </p>
            <p className="text-sm zen-text opacity-75">Your meeting will be transcribed and processed automatically</p>
          </div>
        )}
      </div>

      {/* Live Transcript Panel - Always Visible */}
      {isTranscriptionSupported && (
        <div className="modern-card p-4 sm:p-6 mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 zen-text" />
              <h3 className="text-lg sm:text-xl font-medium zen-text">Live Transcript</h3>
              {isTranscribing && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm zen-text opacity-75">Listening...</span>
                </div>
              )}
            </div>
            {liveTranscript && (
              <button
                onClick={clearTranscript}
                className="text-sm zen-text opacity-75 hover:opacity-100 transition-opacity glass-button px-3 py-1 rounded-lg"
                disabled={isRecording}
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            {liveTranscript ? (
              <div className="max-h-64 overflow-y-auto modern-card bg-opacity-60 p-4">
                <div className="space-y-3">
                  {transcriptSegments.length > 0 ? (
                    // Show segmented transcript with timestamps
                    transcriptSegments.map((segment, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-xs zen-text opacity-60 font-mono min-w-[60px] mt-1">
                          {new Date(segment.timestamp).toLocaleTimeString('en-US', { 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                        <p className="zen-text flex-1 leading-relaxed">
                          {segment.text}
                        </p>
                        {segment.confidence && segment.confidence < 0.8 && (
                          <span className="text-xs text-yellow-300" title="Low confidence">⚠️</span>
                        )}
                      </div>
                    ))
                  ) : (
                    // Show current transcript as one block
                    <div className="zen-text leading-relaxed whitespace-pre-wrap">
                      {liveTranscript}
                      <span className="inline-block w-2 h-5 bg-white bg-opacity-60 ml-1 animate-pulse"></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-h-64 modern-card bg-opacity-60 p-8">
                <div className="text-center">
                  <SpeakerWaveIcon className="mx-auto h-12 w-12 zen-text opacity-60" />
                  <h4 className="mt-4 text-sm font-medium zen-text">
                    {isRecording 
                      ? "Listening for speech..." 
                      : "Start recording to see live transcript"
                    }
                  </h4>
                  <p className="mt-2 text-sm zen-text opacity-75">
                    {isTranscriptionSupported
                      ? "Speech will be transcribed in real-time as you speak"
                      : "Live transcription is not supported in this browser"
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Transcript Stats */}
            {liveTranscript && (
              <div className="flex items-center justify-between mt-3 text-xs zen-text opacity-60">
                <span>
                  {liveTranscript.split(' ').filter(word => word.length > 0).length} words
                </span>
                <span>
                  {transcriptSegments.length} segments
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
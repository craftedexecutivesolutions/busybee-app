'use client';

import { useState, useEffect } from 'react';
import { 
  MicrophoneIcon,
  StopIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';
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
  const [showLiveTranscript, setShowLiveTranscript] = useState(true);
  const [showPostRecordingForm, setShowPostRecordingForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState<'commission' | 'case' | 'other'>('commission');
  
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
    error: transcriptionError,
    isSupported: isTranscriptionSupported,
    startTranscription,
    stopTranscription,
    pauseTranscription,
    resumeTranscription,
    clearTranscript
  } = useLiveTranscription();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
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

      // Step 3: Save files to actual folders
      toast.loading('Saving files to folders...', { id: processingToast });
      const filePaths = await AIProcessor.saveMeetingFiles(
        processingResult,
        meetingTitle,
        audioBlob,
        duration
      );

      // Create recording object
      const recording: Recording = {
        id: Date.now().toString(),
        title: meetingTitle,
        date: new Date(),
        duration,
        status: 'completed',
        type: meetingType,
        audioUrl: filePaths.audioPath,
        transcriptUrl: filePaths.transcriptPath,
        summaryUrl: filePaths.summaryPath,
        participants: processingResult.participants
      };

      // Save to localStorage (in production, save to database)
      const existingRecordings = JSON.parse(localStorage.getItem('recordings') || '[]');
      const updatedRecordings = [recording, ...existingRecordings];
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings));

      toast.success('Recording processed and saved successfully!', { id: processingToast });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BusyBee</h1>
        <p className="text-gray-600">
          Click to start recording, then add meeting details when finished
        </p>
      </div>

      {/* Post-Recording Form Modal */}
      {showPostRecordingForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Details</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  id="meeting-title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Commission Meeting - August 2025"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="meeting-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type
                </label>
                <select
                  id="meeting-type"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as 'commission' | 'case' | 'other')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="commission">Commission Meeting</option>
                  <option value="case">Case Hearing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleProcessRecording}
                disabled={!meetingTitle.trim() || isProcessing}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    </div>
                    Processing...
                  </>
                ) : (
                  'Save & Process'
                )}
              </button>
              <button
                onClick={handleDiscardRecording}
                disabled={isProcessing}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="mb-8 text-center">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-2">
            {formatDuration(duration)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  isPaused ? 'bg-yellow-400' : 'bg-red-400 animate-pulse'
                }`}></span>
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          )}
        </div>

        {/* Main Recording Button */}
        <div className="mb-8">
          {!isRecording && !audioBlob && (
            <button
              onClick={handleStartRecording}
              className="relative w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <MicrophoneIcon className="h-16 w-16 text-white mx-auto" />
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-pulse"></div>
            </button>
          )}

          {isRecording && (
            <div className="flex items-center space-x-6">
              <button
                onClick={handlePauseResume}
                className="w-20 h-20 rounded-full bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all duration-200 shadow-lg"
              >
                {isPaused ? (
                  <PlayIcon className="h-10 w-10 text-white mx-auto" />
                ) : (
                  <PauseIcon className="h-10 w-10 text-white mx-auto" />
                )}
              </button>

              <button
                onClick={handleStopRecording}
                className="w-24 h-24 rounded-full bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 shadow-lg"
              >
                <StopIcon className="h-12 w-12 text-white mx-auto" />
              </button>
            </div>
          )}

          {audioBlob && !isRecording && !showPostRecordingForm && (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 rounded-full bg-green-500 mx-auto flex items-center justify-center">
                  <DocumentTextIcon className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-4">Recording completed!</p>
              <p className="text-sm text-gray-500">
                Add meeting details to process and save your recording.
              </p>
            </div>
          )}
        </div>

        {/* Live Transcription Toggle */}
        {isTranscriptionSupported && !isRecording && !audioBlob && (
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <SpeakerWaveIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Live Transcription</span>
              <button
                onClick={() => setShowLiveTranscript(!showLiveTranscript)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showLiveTranscript ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showLiveTranscript ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {transcriptionError && (
              <p className="text-xs text-red-600 mt-1 text-center">{transcriptionError}</p>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isRecording && !audioBlob && (
          <div className="text-center text-gray-500">
            <p className="mb-2">Click the microphone to start recording</p>
            <p className="text-sm">Your meeting will be transcribed and processed automatically</p>
          </div>
        )}
      </div>

      {/* Live Transcript Panel */}
      {showLiveTranscript && isTranscriptionSupported && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Live Transcript</h3>
              {isTranscribing && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Listening...</span>
                </div>
              )}
            </div>
            {liveTranscript && (
              <button
                onClick={clearTranscript}
                className="text-sm text-gray-500 hover:text-gray-700"
                disabled={isRecording}
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            {liveTranscript ? (
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="space-y-2">
                  {transcriptSegments.length > 0 ? (
                    // Show segmented transcript with timestamps
                    transcriptSegments.map((segment, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-xs text-gray-400 font-mono min-w-[60px] mt-1">
                          {new Date(segment.timestamp).toLocaleTimeString('en-US', { 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                        <p className="text-gray-800 flex-1 leading-relaxed">
                          {segment.text}
                        </p>
                        {segment.confidence && segment.confidence < 0.8 && (
                          <span className="text-xs text-yellow-500" title="Low confidence">⚠️</span>
                        )}
                      </div>
                    ))
                  ) : (
                    // Show current transcript as one block
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {liveTranscript}
                      <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-h-64 bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <SpeakerWaveIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">
                    {isRecording 
                      ? "Listening for speech..." 
                      : "Start recording to see live transcript"
                    }
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
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
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
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
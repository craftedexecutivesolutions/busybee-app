'use client';

import { useState, useRef } from 'react';
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import { OpenAIClient } from '@/lib/openai-client';
import { Recording } from '@/types';
import { toast } from 'react-hot-toast';

interface FileUploadInterfaceProps {
  onUploadComplete?: (recording: Recording) => void;
}

export default function FileUploadInterface({ onUploadComplete }: FileUploadInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'audio' | 'text' | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState<'general' | 'case' | 'board' | 'other'>('general');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedAudioFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4'];
  const acceptedTextFormats = ['.txt', '.doc', '.docx', '.pdf', '.rtf'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isAudio = acceptedAudioFormats.some(format => fileName.endsWith(format));
    const isText = acceptedTextFormats.some(format => fileName.endsWith(format));

    if (!isAudio && !isText) {
      toast.error('Please upload a valid audio or text file');
      return;
    }

    setUploadedFile(file);
    setFileType(isAudio ? 'audio' : 'text');
    toast.success(`File "${file.name}" uploaded successfully`);
  };

  const handleProcessFile = async () => {
    if (!uploadedFile || !meetingTitle.trim()) {
      toast.error('Please provide a meeting title');
      return;
    }

    setIsProcessing(true);
    const processingToast = toast.loading('Processing file...');

    try {
      let processingResult;
      const openAIClient = OpenAIClient.getInstance();

      if (fileType === 'audio') {
        // Process audio file (includes transcription + analysis)
        toast.loading('Transcribing and analyzing audio...', { id: processingToast });
        processingResult = await openAIClient.processAudioFile(
          uploadedFile,
          meetingTitle,
          meetingType
        );
      } else {
        // For text files, read the content and process with OpenAI
        toast.loading('Reading text file...', { id: processingToast });
        const text = await uploadedFile.text();
        toast.loading('Analyzing content...', { id: processingToast });
        
        processingResult = await openAIClient.processTranscript(
          text,
          meetingTitle,
          meetingType
        );
      }

      // Save to meeting-summaries folder via API
      toast.loading('Saving files...', { id: processingToast });
      
      const response = await fetch('/api/save-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingTitle,
          summary: processingResult.summary,
          transcript: processingResult.transcript,
          date: new Date().toISOString(),
          meetingType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save summary');
      }

      // Create recording object
      const recording: Recording = {
        id: Date.now().toString(),
        title: meetingTitle,
        date: new Date(),
        duration: 0, // Duration not applicable for uploaded files
        status: 'completed',
        type: meetingType,
        transcriptUrl: processingResult.transcript || '',
        summaryUrl: processingResult.summary || '',
        participants: processingResult.participants || []
      };

      // Save to localStorage
      const existingRecordings = JSON.parse(localStorage.getItem('recordings') || '[]');
      const updatedRecordings = [recording, ...existingRecordings];
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings));

      const agentMessage = meetingType === 'board' 
        ? 'File processed by Roberts Rules Agent and saved successfully!' 
        : meetingType === 'case'
        ? 'File processed by Legal Assistant Agent and saved successfully!'
        : 'File processed and saved successfully!';
      
      toast.success(agentMessage, { id: processingToast });
      
      if (onUploadComplete) {
        onUploadComplete(recording);
      }

      // Reset form
      setUploadedFile(null);
      setFileType(null);
      setMeetingTitle('');
      setMeetingType('general');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process file', { id: processingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('File removed');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-light zen-text mb-3 sm:mb-4 floating">Upload Files</h2>
        <p className="text-base sm:text-lg zen-text opacity-80">
          Upload audio recordings or text transcripts for processing
        </p>
      </div>

      {/* File Upload Area */}
      <div className="modern-card p-6 sm:p-8 mb-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-orange-400 bg-orange-400 bg-opacity-10' 
              : 'border-white border-opacity-30 hover:border-opacity-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept={[...acceptedAudioFormats, ...acceptedTextFormats].join(',')}
            disabled={isProcessing}
          />

          {!uploadedFile ? (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 zen-text opacity-60 mb-4" />
              <p className="zen-text text-lg mb-2">
                Drag and drop your file here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="glass-button px-6 py-2 zen-text font-medium"
                disabled={isProcessing}
              >
                Browse Files
              </button>
              <p className="zen-text text-sm opacity-75 mt-4">
                Accepted formats: Audio ({acceptedAudioFormats.join(', ')}), 
                Text ({acceptedTextFormats.join(', ')})
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {fileType === 'audio' ? (
                  <MusicalNoteIcon className="h-8 w-8 zen-text" />
                ) : (
                  <DocumentIcon className="h-8 w-8 zen-text" />
                )}
                <div className="text-left">
                  <p className="zen-text font-medium">{uploadedFile.name}</p>
                  <p className="zen-text text-sm opacity-75">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="glass-button p-2 rounded-full"
                disabled={isProcessing}
              >
                <XCircleIcon className="h-5 w-5 zen-text" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Details Form */}
      {uploadedFile && (
        <div className="modern-card p-6 sm:p-8 mb-8">
          <h3 className="text-xl sm:text-2xl font-light zen-text mb-6 text-center">Meeting Details</h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="upload-meeting-title" className="block text-sm font-medium zen-text mb-2 opacity-90">
                Meeting Title *
              </label>
              <input
                type="text"
                id="upload-meeting-title"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="modern-input zen-text"
                placeholder="e.g., Q3 Board Meeting"
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <label htmlFor="upload-meeting-type" className="block text-sm font-medium zen-text mb-3 opacity-90">
                Meeting Type
              </label>
              <select
                id="upload-meeting-type"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as 'general' | 'case' | 'board' | 'other')}
                className="modern-input zen-text appearance-none"
                disabled={isProcessing}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="general">General Meeting</option>
                <option value="case">Legal Case Hearing</option>
                <option value="board">Board Meeting</option>
                <option value="other">Lecture/Workshop</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleProcessFile}
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
                  Process File
                </>
              )}
            </button>
            <button
              onClick={removeFile}
              disabled={isProcessing}
              className="glass-button py-3 px-6 zen-text font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="modern-card p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <p className="zen-text font-medium">Expert AI Agent Processing</p>
        </div>
        <div className="zen-text text-sm opacity-75 space-y-2">
          {meetingType === 'board' && (
            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
              <p className="font-medium text-blue-200">⚖️ Roberts Rules Agent Active</p>
              <p>Specialized board meeting analysis with proper parliamentary procedure, motion tracking, quorum status, and voting records following Robert&apos;s Rules of Order.</p>
            </div>
          )}
          {meetingType === 'case' && (
            <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
              <p className="font-medium text-purple-200">👨‍⚖️ Legal Assistant Agent Active</p>
              <p>Expert legal case analysis extracting case numbers, parties present, court personnel, legal issues, procedural matters, evidence, and rulings.</p>
            </div>
          )}
          {meetingType === 'general' && (
            <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
              <p className="font-medium text-green-200">📝 Friendly Notes Assistant Active</p>
              <p>Creates useful, readable meeting notes perfect for team meetings, project discussions, and general business meetings. Conversational tone, practical takeaways.</p>
            </div>
          )}
          {meetingType === 'other' && (
            <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
              <p className="font-medium text-orange-200">🎓 Casual Notes Assistant Active</p>
              <p>Perfect for lectures, workshops, training sessions, and educational content. Captures key learnings and insights in an easy-to-review format.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
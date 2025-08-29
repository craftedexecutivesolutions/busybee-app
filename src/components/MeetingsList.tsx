'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import { Recording } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MeetingsList() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'commission' | 'case' | 'other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'error'>('all');
  const [showDownloadMenu, setShowDownloadMenu] = useState<string | null>(null);

  // Mock recordings data with transcripts and summaries
  const mockRecordings: Recording[] = [
    {
      id: '1',
      title: 'Commission Meeting - Budget Review',
      date: new Date('2025-08-25T14:00:00').toISOString(),
      duration: 3600, // 1 hour
      status: 'completed',
      type: 'commission',
      participants: ['John Smith', 'Sarah Johnson', 'Michael Brown'],
      audioUrl: '/recordings/commission-meeting-20250825.mp3',
      transcriptUrl: '/transcripts/commission-meeting-20250825.txt',
      summaryUrl: '/summaries/commission-meeting-20250825.pdf'
    },
    {
      id: '2',
      title: 'Case Hearing - Employee Appeal #2024-156',
      date: new Date('2025-08-24T10:30:00').toISOString(),
      duration: 2400, // 40 minutes
      status: 'completed',
      type: 'case',
      participants: ['Judge Wilson', 'Attorney Davis', 'Employee Roberts'],
      audioUrl: '/recordings/case-hearing-20250824.mp3',
      transcriptUrl: '/transcripts/case-hearing-20250824.txt',
      summaryUrl: '/summaries/case-hearing-20250824.pdf'
    },
    {
      id: '3',
      title: 'Staff Training Session - New Procedures',
      date: new Date('2025-08-23T09:00:00').toISOString(),
      duration: 5400, // 1.5 hours
      status: 'completed',
      type: 'other',
      participants: ['Training Coordinator', 'Staff Members'],
      audioUrl: '/recordings/training-session-20250823.mp3',
      transcriptUrl: '/transcripts/training-session-20250823.txt',
      summaryUrl: '/summaries/training-session-20250823.pdf'
    },
    {
      id: '4',
      title: 'Executive Meeting - Policy Updates',
      date: new Date('2025-08-22T15:30:00').toISOString(),
      duration: 1800, // 30 minutes
      status: 'processing',
      type: 'commission',
      participants: ['Director Thompson', 'Deputy Director Lee'],
      audioUrl: '/recordings/executive-meeting-20250822.mp3'
    }
  ];

  useEffect(() => {
    // Load recordings from localStorage or use mock data
    const stored = localStorage.getItem('recordings');
    if (stored) {
      const recordingsData = JSON.parse(stored);
      setRecordings([...mockRecordings, ...recordingsData]);
    } else {
      setRecordings(mockRecordings);
    }
  }, []);

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recording.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || recording.type === filterType;
    const matchesStatus = filterStatus === 'all' || recording.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: Recording['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'recording': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: Recording['type']) => {
    switch (type) {
      case 'commission': return 'text-blue-600 bg-blue-100';
      case 'case': return 'text-purple-600 bg-purple-100';
      case 'other': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewTranscript = (recording: Recording) => {
    if (recording.transcriptUrl) {
      toast.success('Opening transcript: ' + recording.title);
      // In a real app, this would open the transcript file
    } else {
      toast.error('Transcript not available');
    }
  };

  const handleViewSummary = (recording: Recording) => {
    if (recording.summaryUrl) {
      toast.success('Opening summary: ' + recording.title);
      // In a real app, this would open the summary file
    } else {
      toast.error('Summary not available');
    }
  };

  const handleDownload = (recording: Recording, type: 'audio' | 'transcript' | 'summary') => {
    const urls = {
      audio: recording.audioUrl,
      transcript: recording.transcriptUrl,
      summary: recording.summaryUrl
    };
    
    if (urls[type]) {
      toast.success(`Downloading ${type}: ${recording.title}`);
      // In a real app, this would download the selected file
    } else {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} not available`);
    }
    setShowDownloadMenu(null);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="modern-card p-6">
          <h1 className="text-xl sm:text-2xl font-bold modern-text">BeeLog</h1>
          <p className="mt-2 text-sm modern-text-muted">
            View and manage all your recorded meetings and generated notes
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="modern-card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 modern-text opacity-60" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10 pr-3 py-2 w-full"
                placeholder="Search meetings or participants..."
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="modern-input pl-3 pr-10 py-2"
            >
              <option value="all">All Types</option>
              <option value="commission">Commission Meetings</option>
              <option value="case">Case Hearings</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="modern-input pl-3 pr-10 py-2"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-sm modern-text-muted">
          Showing {filteredRecordings.length} of {recordings.length} recordings
        </p>
      </div>

      {/* Recordings List */}
      <div className="modern-card">
        {filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <MicrophoneIcon className="mx-auto h-12 w-12 modern-text opacity-60" />
            <h3 className="mt-2 text-sm font-medium modern-text">No recordings found</h3>
            <p className="mt-1 text-sm modern-text-muted">
              {recordings.length === 0 
                ? "Start your first recording to see it appear here."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            {filteredRecordings.map((recording) => (
              <div key={recording.id} className="modern-card bg-opacity-60 hover:bg-opacity-80 p-4 sm:p-6 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Type */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-lg font-medium modern-text">
                        {recording.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(recording.type)}`}>
                        {recording.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(recording.status)}`}>
                        {recording.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center text-sm modern-text-muted gap-2 sm:gap-4">
                      <span className="flex items-center">
                        {format(new Date(recording.date), 'MMM d, yyyy • h:mm a')}
                      </span>
                      <span>
                        Duration: {formatDuration(recording.duration)}
                      </span>
                      {recording.participants.length > 0 && (
                        <span className="line-clamp-1">
                          Participants: {recording.participants.slice(0, 2).join(', ')}
                          {recording.participants.length > 2 && ` +${recording.participants.length - 2} more`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {recording.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handleViewTranscript(recording)}
                          className="nav-button-circle w-10 h-10 flex items-center justify-center"
                          title="View Transcript"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewSummary(recording)}
                          className="nav-button-circle w-10 h-10 flex items-center justify-center"
                          title="View Summary"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowDownloadMenu(showDownloadMenu === recording.id ? null : recording.id)}
                            className="nav-button-circle w-10 h-10 flex items-center justify-center"
                            title="Download Options"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          
                          {showDownloadMenu === recording.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 modern-card shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDownload(recording, 'audio')}
                                  className="flex items-center w-full px-4 py-2 text-sm modern-text hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200"
                                >
                                  <SpeakerWaveIcon className="h-4 w-4 mr-3" />
                                  Download Audio
                                </button>
                                {recording.transcriptUrl && (
                                  <button
                                    onClick={() => handleDownload(recording, 'transcript')}
                                    className="flex items-center w-full px-4 py-2 text-sm modern-text hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200"
                                  >
                                    <DocumentTextIcon className="h-4 w-4 mr-3" />
                                    Download Transcript
                                  </button>
                                )}
                                {recording.summaryUrl && (
                                  <button
                                    onClick={() => handleDownload(recording, 'summary')}
                                    className="flex items-center w-full px-4 py-2 text-sm modern-text hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200"
                                  >
                                    <DocumentIcon className="h-4 w-4 mr-3" />
                                    Download Summary
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {recording.status === 'processing' && (
                      <div className="flex items-center space-x-2 text-sm modern-text-muted">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                      </div>
                    )}
                    {recording.status === 'error' && (
                      <span className="text-sm text-red-400">
                        Processing failed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close download menu */}
      {showDownloadMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDownloadMenu(null)}
        />
      )}
    </div>
  );
}
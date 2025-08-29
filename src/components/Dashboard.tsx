'use client';

import { useState, useEffect } from 'react';
import { 
  MicrophoneIcon,
  DocumentTextIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Recording } from '@/types';
import { format } from 'date-fns';

interface DashboardProps {
  onStartRecording: () => void;
}

export default function Dashboard({ onStartRecording }: DashboardProps) {
  const [recentRecordings, setRecentRecordings] = useState<Recording[]>([]);
  const [stats, setStats] = useState({
    totalRecordings: 0,
    todayRecordings: 0,
    totalDuration: 0,
    processingCount: 0
  });

  useEffect(() => {
    // Load recent recordings from localStorage or API
    const stored = localStorage.getItem('recordings');
    if (stored) {
      const recordings = JSON.parse(stored);
      setRecentRecordings(recordings.slice(0, 5));
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayCount = recordings.filter((r: Recording) => 
        new Date(r.date).toDateString() === today
      ).length;
      
      const totalDuration = recordings.reduce((acc: number, r: Recording) => acc + r.duration, 0);
      const processingCount = recordings.filter((r: Recording) => r.status === 'processing').length;
      
      setStats({
        totalRecordings: recordings.length,
        todayRecordings: todayCount,
        totalDuration: Math.floor(totalDuration / 60), // Convert to minutes
        processingCount
      });
    }
  }, []);

  const getStatusColor = (status: Recording['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'recording': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Recording['status']) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'processing': return ClockIcon;
      case 'recording': return MicrophoneIcon;
      case 'error': return ExclamationCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold zen-text">BusyBee Dashboard</h1>
        <p className="mt-1 text-sm zen-text opacity-80">
          Your all-in-one paradise workspace for executive productivity
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <div className="glass-panel-dark rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium zen-text mb-3 sm:mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onStartRecording}
              className="glass-button inline-flex items-center px-4 py-2 text-sm font-medium zen-text transition-all"
            >
              <MicrophoneIcon className="h-5 w-5 mr-2" />
              Start New Recording
            </button>
            <button className="glass-button inline-flex items-center px-4 py-2 text-sm font-medium zen-text transition-all">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Upload File
            </button>
            <button className="glass-button inline-flex items-center px-4 py-2 text-sm font-medium zen-text transition-all">
              <FolderIcon className="h-5 w-5 mr-2" />
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel-dark overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 zen-text opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium zen-text opacity-80 truncate">Total Recordings</dt>
                  <dd className="text-lg font-medium zen-text">{stats.totalRecordings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel-dark overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 zen-text opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium zen-text opacity-80 truncate">Today&apos;s Recordings</dt>
                  <dd className="text-lg font-medium zen-text">{stats.todayRecordings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel-dark overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MicrophoneIcon className="h-6 w-6 zen-text opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium zen-text opacity-80 truncate">Total Duration</dt>
                  <dd className="text-lg font-medium zen-text">{stats.totalDuration}m</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel-dark overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-6 w-6 zen-text opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium zen-text opacity-80 truncate">Processing</dt>
                  <dd className="text-lg font-medium zen-text">{stats.processingCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="glass-panel-dark shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium zen-text mb-4">Recent Recordings</h3>
          {recentRecordings.length === 0 ? (
            <div className="text-center py-6">
              <MicrophoneIcon className="mx-auto h-12 w-12 zen-text opacity-60" />
              <h4 className="mt-2 text-sm font-medium zen-text">No recordings yet</h4>
              <p className="mt-1 text-sm zen-text opacity-75">
                Start your first recording to see it appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRecordings.map((recording) => {
                const StatusIcon = getStatusIcon(recording.status);
                return (
                  <div key={recording.id} className="flex items-center justify-between p-4 glass-panel rounded-lg hover:glass-panel-rounded transition-all">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="h-5 w-5 zen-text opacity-70" />
                      <div>
                        <p className="text-sm font-medium zen-text">{recording.title}</p>
                        <p className="text-xs zen-text opacity-75">
                          {format(new Date(recording.date), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="glass-button inline-flex items-center px-2.5 py-0.5 text-xs font-medium zen-text">
                        {recording.status}
                      </span>
                      <span className="text-xs zen-text opacity-75">
                        {Math.floor(recording.duration / 60)}m {recording.duration % 60}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
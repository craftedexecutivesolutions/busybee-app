'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import RecordingInterface from '@/components/RecordingInterface';
import MeetingsList from '@/components/MeetingsList';
import EmailInterface from '@/components/EmailInterface';
import CalendarInterface from '@/components/CalendarInterface';
import FileUploadInterface from '@/components/FileUploadInterface';
import { Recording } from '@/types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleRecordingComplete = (recording: Recording) => {
    // Switch to meetings list to show the completed recording
    setCurrentPage('meetings');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onStartRecording={() => setCurrentPage('record')} />;
      case 'record':
        return <RecordingInterface onRecordingComplete={handleRecordingComplete} />;
      case 'upload':
        return <FileUploadInterface onUploadComplete={handleRecordingComplete} />;
      case 'meetings':
        return <MeetingsList />;
      case 'email':
        return <EmailInterface />;
      case 'calendar':
        return <CalendarInterface />;
      case 'files':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold zen-text">File Management</h1>
              <p className="mt-4 zen-text opacity-80">
                This feature will allow you to browse and manage all generated files,
                organized according to your template rules.
              </p>
              <div className="mt-8 glass-panel-dark rounded-lg p-6">
                <h3 className="text-lg font-medium zen-text mb-2">Folder Structure</h3>
                <div className="text-left text-sm zen-text opacity-90 space-y-1">
                  <div>📁 /Recordings/ - Audio/video files</div>
                  <div>📁 /Transcripts/ - Generated transcripts</div>
                  <div>📁 /Notes/ - AI-generated meeting summaries</div>
                  <div>📁 /Orders_Notice/ - Official orders and notices</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold zen-text">Settings</h1>
              <p className="mt-4 zen-text opacity-80">
                Configure AI processing options, templates, and system preferences.
              </p>
              <div className="mt-8 glass-panel-dark rounded-lg p-6">
                <h3 className="text-lg font-medium zen-text mb-2">Configuration Options</h3>
                <div className="text-left text-sm zen-text opacity-90 space-y-1">
                  <div>• Template customization</div>
                  <div>• Name recognition settings</div>
                  <div>• File organization rules</div>
                  <div>• AI processing preferences</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard onStartRecording={() => setCurrentPage('record')} />;
    }
  };

  return (
    <main className="h-screen">
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </Layout>
      <Toaster position="top-right" />
    </main>
  );
}

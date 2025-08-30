'use client';

import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  InboxIcon,
  PaperAirplaneIcon,
  TrashIcon,
  StarIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  read: boolean;
  starred: boolean;
  important: boolean;
}

export default function EmailInterface() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Mock email data for demonstration
  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'john.doe@company.com',
      subject: 'Q4 Budget Review Meeting',
      preview: 'Hi team, I wanted to schedule our quarterly budget review for next week. Please let me know your availability...',
      date: new Date('2025-08-28T10:30:00'),
      read: false,
      starred: true,
      important: true
    },
    {
      id: '2',
      from: 'sarah.johnson@client.com',
      subject: 'Project Status Update Required',
      preview: 'Could you please provide an update on the current project timeline? We need to present to stakeholders...',
      date: new Date('2025-08-28T09:15:00'),
      read: true,
      starred: false,
      important: false
    },
    {
      id: '3',
      from: 'notifications@workspace.google.com',
      subject: 'Calendar Event: Executive Team Meeting',
      preview: 'Reminder: Your meeting "Executive Team Meeting" is scheduled for tomorrow at 2:00 PM...',
      date: new Date('2025-08-27T16:45:00'),
      read: true,
      starred: false,
      important: false
    }
  ];

  useEffect(() => {
    // Load mock emails
    setEmails(mockEmails);
  }, []);

  const handleConnectGmail = () => {
    // This will be implemented with actual Google OAuth
    toast.loading('Connecting to Gmail...', { id: 'gmail-connect' });
    
    setTimeout(() => {
      setIsConnected(true);
      toast.success('Connected to Gmail successfully!', { id: 'gmail-connect' });
    }, 2000);
  };

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light zen-text mb-3 sm:mb-4 floating">Email Center</h1>
          <p className="text-base sm:text-lg zen-text opacity-80">
            Connect your Gmail to manage emails in paradise
          </p>
        </div>

        {/* Connection Card */}
        <div className="max-w-md mx-auto">
          <div className="glass-panel-dark p-8 rounded-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 glass-panel rounded-full flex items-center justify-center floating">
              <EnvelopeIcon className="h-10 w-10 zen-text" />
            </div>
            
            <h3 className="text-xl font-medium zen-text mb-4">Connect Your Gmail</h3>
            <p className="zen-text opacity-75 mb-6 text-sm">
              Securely connect your Gmail account to view and manage emails directly in your paradise workspace.
            </p>
            
            <button
              onClick={handleConnectGmail}
              className="glass-button px-6 py-3 zen-text font-medium transition-all w-full"
            >
              <div className="flex items-center justify-center gap-3">
                <EnvelopeIcon className="h-5 w-5" />
                Connect Gmail
              </div>
            </button>
            
            <p className="text-xs zen-text opacity-60 mt-4">
              We use secure OAuth 2.0 authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light zen-text">Inbox</h1>
            <p className="text-sm zen-text opacity-80">
              {emails.filter(e => !e.read).length} unread messages
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 zen-text opacity-60" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-panel-dark pl-10 pr-4 py-2 rounded-lg zen-text placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 w-full sm:w-64"
              />
            </div>
            <button className="glass-button p-2 rounded-lg">
              <PlusIcon className="h-5 w-5 zen-text" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="glass-panel-dark rounded-xl p-4 max-h-[600px] overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:glass-panel-rounded ${
                  selectedEmail?.id === email.id ? 'glass-panel-rounded' : ''
                } ${!email.read ? 'border-l-4 border-blue-400' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm zen-text font-medium truncate">{email.from}</p>
                    <p className={`text-sm truncate ${!email.read ? 'zen-text font-medium' : 'zen-text opacity-75'}`}>
                      {email.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {email.starred && <StarIconSolid className="h-4 w-4 text-orange-400" />}
                    <span className="text-xs zen-text opacity-60">{formatDate(email.date)}</span>
                  </div>
                </div>
                <p className="text-xs zen-text opacity-60 line-clamp-2">{email.preview}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <div className="glass-panel-dark rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-xl zen-text font-medium mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-4 text-sm zen-text opacity-75">
                    <span>From: {selectedEmail.from}</span>
                    <span>{selectedEmail.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="glass-button p-2 rounded-lg">
                    <StarIcon className="h-5 w-5 zen-text" />
                  </button>
                  <button className="glass-button p-2 rounded-lg">
                    <PaperAirplaneIcon className="h-5 w-5 zen-text" />
                  </button>
                  <button className="glass-button p-2 rounded-lg">
                    <TrashIcon className="h-5 w-5 zen-text" />
                  </button>
                </div>
              </div>
              
              <div className="glass-panel-extra-dark rounded-xl p-4 zen-text leading-relaxed">
                {selectedEmail.preview}
                <br /><br />
                This is a preview of the email content. In a full implementation, this would display the complete email body with rich formatting, attachments, and inline images.
                <br /><br />
                Best regards,<br />
                {selectedEmail.from.split('@')[0].replace('.', ' ')}
              </div>
              
              <div className="mt-6 flex items-center gap-3">
                <button className="glass-button px-4 py-2 zen-text font-medium">
                  <PaperAirplaneIcon className="h-4 w-4 mr-2 inline" />
                  Reply
                </button>
                <button className="glass-button px-4 py-2 zen-text font-medium">
                  Forward
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel-dark rounded-xl p-12 text-center">
              <InboxIcon className="h-16 w-16 zen-text opacity-40 mx-auto mb-4" />
              <p className="zen-text opacity-60">Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendees?: string[];
  location?: string;
  type: 'meeting' | 'call' | 'event' | 'reminder';
}

export default function CalendarInterface() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Mock events for demonstration
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Executive Team Meeting',
      start: new Date('2025-08-29T14:00:00'),
      end: new Date('2025-08-29T15:30:00'),
      description: 'Monthly executive team sync',
      attendees: ['john.doe@company.com', 'sarah.johnson@company.com'],
      location: 'Conference Room A',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Client Call - Project Review',
      start: new Date('2025-08-29T10:30:00'),
      end: new Date('2025-08-29T11:30:00'),
      description: 'Review project milestones with client',
      attendees: ['client@company.com'],
      type: 'call'
    },
    {
      id: '3',
      title: 'Budget Planning Session',
      start: new Date('2025-08-30T09:00:00'),
      end: new Date('2025-08-30T10:30:00'),
      description: 'Q4 budget review and planning',
      type: 'meeting'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const handleConnectCalendar = () => {
    toast.loading('Connecting to Google Calendar...', { id: 'calendar-connect' });
    
    setTimeout(() => {
      setIsConnected(true);
      toast.success('Connected to Google Calendar successfully!', { id: 'calendar-connect' });
    }, 2000);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.start.toDateString() === date.toDateString()
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'meeting':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-gray-500 bg-opacity-20 border-gray-400';
      case 'meeting':
        return 'bg-green-500 bg-opacity-20 border-green-400';
      case 'reminder':
        return 'bg-orange-500 bg-opacity-20 border-orange-400';
      default:
        return 'bg-purple-500 bg-opacity-20 border-purple-400';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light zen-text mb-3 sm:mb-4 floating">Calendar</h1>
          <p className="text-base sm:text-lg zen-text opacity-80">
            Connect your Google Calendar to manage schedules in paradise
          </p>
        </div>

        {/* Connection Card */}
        <div className="max-w-md mx-auto">
          <div className="glass-panel-dark p-8 rounded-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 glass-panel rounded-full flex items-center justify-center floating">
              <CalendarDaysIcon className="h-10 w-10 zen-text" />
            </div>
            
            <h3 className="text-xl font-medium zen-text mb-4">Connect Your Calendar</h3>
            <p className="zen-text opacity-75 mb-6 text-sm">
              Securely connect your Google Calendar to view, create, and manage events directly in your paradise workspace.
            </p>
            
            <button
              onClick={handleConnectCalendar}
              className="glass-button px-6 py-3 zen-text font-medium transition-all w-full"
            >
              <div className="flex items-center justify-center gap-3">
                <CalendarDaysIcon className="h-5 w-5" />
                Connect Google Calendar
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
            <h1 className="text-2xl sm:text-3xl font-light zen-text">Calendar</h1>
            <p className="text-sm zen-text opacity-80">
              {events.length} events this month
            </p>
          </div>
          
          <button
            onClick={() => setShowEventModal(true)}
            className="glass-button px-4 py-2 zen-text font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-2 inline" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="glass-panel-dark rounded-xl p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="glass-button p-2 rounded-lg"
              >
                <ChevronLeftIcon className="h-5 w-5 zen-text" />
              </button>
              
              <h2 className="text-xl zen-text font-medium">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="glass-button p-2 rounded-lg"
              >
                <ChevronRightIcon className="h-5 w-5 zen-text" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm zen-text opacity-60 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day && day.toDateString() === new Date().toDateString();
                const isSelected = day && day.toDateString() === selectedDate.toDateString();
                
                return (
                  <div key={index} className="relative min-h-[80px]">
                    {day ? (
                      <button
                        onClick={() => setSelectedDate(day)}
                        className={`w-full h-full p-2 rounded-lg text-left transition-all ${
                          isSelected ? 'glass-panel-rounded' : 'hover:glass-panel'
                        } ${isToday ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}
                      >
                        <span className={`text-sm font-medium ${
                          isToday ? 'zen-text text-orange-400' : 'zen-text'
                        }`}>
                          {day.getDate()}
                        </span>
                        
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} zen-text truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs zen-text opacity-60">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Events */}
        <div className="lg:col-span-1">
          <div className="glass-panel-dark rounded-xl p-6">
            <h3 className="text-lg zen-text font-medium mb-4">
              {selectedDate.toDateString() === new Date().toDateString() ? 
                "Today's Events" : 
                selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            </h3>
            
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="glass-panel p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="zen-text opacity-60 mt-1">
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="zen-text font-medium text-sm mb-1">{event.title}</h4>
                      <p className="zen-text opacity-75 text-xs mb-2">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </p>
                      {event.location && (
                        <p className="zen-text opacity-60 text-xs">{event.location}</p>
                      )}
                      {event.description && (
                        <p className="zen-text opacity-75 text-xs mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 zen-text opacity-40 mx-auto mb-2" />
                  <p className="zen-text opacity-60 text-sm">No events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
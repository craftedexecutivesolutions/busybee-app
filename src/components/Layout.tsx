'use client';

import { useState } from 'react';
import { 
  MicrophoneIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  Cog6ToothIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

// Cute Flying Bee SVG Component with dotted trail
const BeeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 24" className={className} fill="none" stroke="currentColor">
    {/* Dotted trail showing flight path */}
    <circle cx="2" cy="18" r="1" fill="currentColor" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0s"/>
    </circle>
    <circle cx="5" cy="16" r="1" fill="currentColor" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" begin="0.3s"/>
    </circle>
    <circle cx="8" cy="14" r="1" fill="currentColor" opacity="0.5">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.6s"/>
    </circle>
    
    {/* Bee body - oval shape */}
    <ellipse cx="18" cy="12" rx="3.5" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    
    {/* Bee stripes */}
    <line x1="15.5" y1="12" x2="20.5" y2="12" stroke="currentColor" strokeWidth="1"/>
    <line x1="16" y1="10.5" x2="20" y2="10.5" stroke="currentColor" strokeWidth="0.8"/>
    <line x1="16" y1="13.5" x2="20" y2="13.5" stroke="currentColor" strokeWidth="0.8"/>
    
    {/* Left wing - simple curved line */}
    <path d="M14.5 10 C12 8, 10 9, 12 11" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <animateTransform 
        attributeName="transform" 
        type="rotate" 
        values="0 14.5 10; -8 14.5 10; 0 14.5 10" 
        dur="0.3s" 
        repeatCount="indefinite"/>
    </path>
    
    {/* Right wing - simple curved line */}
    <path d="M21.5 10 C24 8, 26 9, 24 11" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <animateTransform 
        attributeName="transform" 
        type="rotate" 
        values="0 21.5 10; 8 21.5 10; 0 21.5 10" 
        dur="0.3s" 
        repeatCount="indefinite"/>
    </path>
    
    {/* Antennae */}
    <line x1="16.5" y1="9.5" x2="16" y2="8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <line x1="19.5" y1="9.5" x2="20" y2="8" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
    <circle cx="16" cy="8" r="0.8" fill="currentColor"/>
    <circle cx="20" cy="8" r="0.8" fill="currentColor"/>
    
    {/* Eyes - small dots */}
    <circle cx="16.5" cy="11" r="0.5" fill="currentColor"/>
    <circle cx="19.5" cy="11" r="0.5" fill="currentColor"/>
  </svg>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: HomeIcon },
  { name: 'Record', id: 'record', icon: MicrophoneIcon },
  { name: 'Upload', id: 'upload', icon: CloudArrowUpIcon },
  { name: 'Meetings', id: 'meetings', icon: DocumentTextIcon },
  { name: 'Email', id: 'email', icon: EnvelopeIcon },
  { name: 'Calendar', id: 'calendar', icon: CalendarDaysIcon },
  { name: 'Files', id: 'files', icon: FolderIcon },
  { name: 'Settings', id: 'settings', icon: Cog6ToothIcon },
];

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  return (
    <div className={`paradise-bg min-h-screen ${isMobileView ? 'max-w-sm mx-auto' : ''}`}>
      {/* Mobile Navigation Toggle */}
      <div className={`${isMobileView ? '' : 'md:hidden'} fixed top-4 left-4 z-50`}>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="modern-nav-button p-3"
        >
          {mobileNavOpen ? (
            <XMarkIcon className="h-6 w-6 modern-text" />
          ) : (
            <Bars3Icon className="h-6 w-6 modern-text" />
          )}
        </button>
      </div>

      {/* Desktop Navigation Toggle */}
      <div className={`${isMobileView ? 'hidden' : 'hidden md:block'} fixed top-4 left-4 z-50`}>
        <button
          onClick={() => setNavCollapsed(!navCollapsed)}
          className="glass-button p-3 rounded-full shadow-lg floating"
        >
          <Bars3Icon className="h-6 w-6 zen-text" />
        </button>
      </div>

      {/* Responsive View Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileView(!isMobileView)}
          className="glass-button p-3 rounded-full shadow-lg floating"
          title={isMobileView ? "Switch to Desktop View" : "Switch to Mobile View"}
        >
          {isMobileView ? (
            <ComputerDesktopIcon className="h-6 w-6 zen-text" />
          ) : (
            <DevicePhoneMobileIcon className="h-6 w-6 zen-text" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileNavOpen && (
        <div className={`${isMobileView ? '' : 'md:hidden'} fixed inset-0 z-40`}>
          <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-72 sm:w-80 bg-transparent p-4 sm:p-6">
            <div className="mt-16">
              <div className="flex items-center mb-8">
                <img src="/busybee-yellow.svg" alt="BusyBee" className="h-8 w-8" />
                <h1 className="ml-3 text-xl font-bold zen-text">BusyBee</h1>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xs sm:max-w-sm mx-auto">
                {navigation.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <div key={item.name} className="flex flex-col items-center gap-2 group">
                      <button
                        onClick={() => {
                          onPageChange(item.id);
                          setMobileNavOpen(false);
                        }}
                        className={`
                          w-14 h-14 sm:w-16 sm:h-16 nav-button-circle flex items-center justify-center
                          ${isActive ? 'active' : ''}
                        `}
                        title={item.name}
                      >
                        <item.icon className="h-6 w-6 sm:h-7 sm:w-7 zen-text" />
                      </button>
                      <span className="text-xs zen-text text-center font-medium opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 modern-card p-4">
                <p className="text-sm font-medium zen-text">Civil Service Commission</p>
                <p className="text-xs zen-text opacity-75">BusyBee AI Assistant</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`${isMobileView ? 'hidden' : 'hidden md:block'} fixed top-0 left-0 h-full z-30 transition-all duration-300 ${
        navCollapsed ? 'w-20' : 'w-80'
      }`}>
        <div className="h-full bg-transparent p-6">
          <div className="mt-16">
            <div className="flex items-center mb-8">
              <img src="/busybee-yellow.svg" alt="BusyBee" className={`h-8 w-8 transition-all ${navCollapsed ? '' : 'mr-3'}`} />
              {!navCollapsed && (
                <h1 className="text-xl font-bold zen-text">BusyBee</h1>
              )}
            </div>
            
            {navCollapsed ? (
              <div className="flex flex-col gap-6 items-center">
                {navigation.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.name}
                      onClick={() => onPageChange(item.id)}
                      className={`
                        w-12 h-12 nav-button-circle flex items-center justify-center
                        ${isActive ? 'active' : ''}
                      `}
                      title={item.name}
                    >
                      <item.icon className="h-5 w-5 zen-text" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {navigation.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <div key={item.name} className="flex flex-col items-center gap-2 group">
                      <button
                        onClick={() => onPageChange(item.id)}
                        className={`
                          w-16 h-16 nav-button-circle flex items-center justify-center
                          ${isActive ? 'active' : ''}
                        `}
                      >
                        <item.icon className="h-6 w-6 zen-text" />
                      </button>
                      <span className="text-xs zen-text text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {!navCollapsed && (
              <div className="mt-8 modern-card p-4">
                <p className="text-sm font-medium zen-text">Civil Service Commission</p>
                <p className="text-xs zen-text opacity-75">BusyBee AI Assistant</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isMobileView ? '' : navCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
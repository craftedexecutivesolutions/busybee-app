import React from 'react';

interface BeeIconProps {
  className?: string;
  size?: number;
}

export default function BeeIcon({ className = '', size = 24 }: BeeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wing - simple oval */}
      <ellipse cx="30" cy="40" rx="12" ry="20" fill="currentColor" fillOpacity="0.8" />
      
      {/* Body - simple oval */}
      <ellipse cx="50" cy="50" rx="25" ry="15" fill="currentColor" />
      
      {/* Head - simple circle */}
      <circle cx="25" cy="50" r="12" fill="currentColor" />
      
      {/* Simple stripes */}
      <rect x="35" y="42" width="4" height="16" fill="white" fillOpacity="0.3" />
      <rect x="45" y="42" width="4" height="16" fill="white" fillOpacity="0.3" />
      <rect x="55" y="42" width="4" height="16" fill="white" fillOpacity="0.3" />
      
      {/* Simple eye */}
      <circle cx="22" cy="47" r="2" fill="white" />
      
      {/* Simple antenna */}
      <line x1="20" y1="42" x2="18" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="35" r="2" fill="currentColor" />
      
      {/* Simple stinger */}
      <path d="M 74 50 L 78 48 L 78 52 Z" fill="currentColor" />
    </svg>
  );
}
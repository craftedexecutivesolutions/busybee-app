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
      {/* Wing (side view) */}
      <ellipse cx="35" cy="40" rx="18" ry="25" fill="white" fillOpacity="0.9" transform="rotate(-10 35 40)" />
      
      {/* Body - side view */}
      <ellipse cx="55" cy="50" rx="28" ry="20" fill="white" />
      
      {/* Head */}
      <ellipse cx="25" cy="50" rx="15" ry="13" fill="white" />
      
      {/* Stripes on body */}
      <rect x="35" y="40" width="8" height="20" fill="currentColor" fillOpacity="0.2" />
      <rect x="48" y="40" width="8" height="20" fill="currentColor" fillOpacity="0.2" />
      <rect x="61" y="40" width="8" height="20" fill="currentColor" fillOpacity="0.2" />
      
      {/* Eye (side view shows one eye) */}
      <circle cx="22" cy="48" r="3" fill="currentColor" />
      
      {/* Antenna */}
      <path d="M 20 42 Q 18 35 20 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="30" r="3" fill="white" />
      
      {/* Stinger */}
      <path d="M 82 50 L 88 50 L 85 53 Z" fill="white" />
      
      {/* Small legs (simplified) */}
      <line x1="40" y1="65" x2="38" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="65" x2="48" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="65" x2="58" y2="70" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
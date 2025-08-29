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
      {/* Wings */}
      <ellipse cx="30" cy="35" rx="15" ry="20" fill="white" fillOpacity="0.8" />
      <ellipse cx="70" cy="35" rx="15" ry="20" fill="white" fillOpacity="0.8" />
      
      {/* Body */}
      <ellipse cx="50" cy="55" rx="25" ry="30" fill="white" />
      
      {/* Stripes */}
      <rect x="25" y="45" width="50" height="8" fill="currentColor" fillOpacity="0.3" />
      <rect x="25" y="57" width="50" height="8" fill="currentColor" fillOpacity="0.3" />
      <rect x="25" y="69" width="50" height="8" fill="currentColor" fillOpacity="0.3" />
      
      {/* Head */}
      <circle cx="50" cy="35" r="15" fill="white" />
      
      {/* Eyes */}
      <circle cx="44" cy="35" r="3" fill="currentColor" />
      <circle cx="56" cy="35" r="3" fill="currentColor" />
      
      {/* Antennae */}
      <line x1="45" y1="25" x2="42" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="25" x2="58" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="42" cy="18" r="3" fill="white" />
      <circle cx="58" cy="18" r="3" fill="white" />
      
      {/* Smile */}
      <path d="M 44 38 Q 50 42 56 38" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      
      {/* Stinger */}
      <polygon points="50,85 47,80 53,80" fill="white" />
    </svg>
  );
}
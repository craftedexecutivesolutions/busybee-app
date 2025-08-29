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
      {/* Wings - behind body, facing right */}
      <ellipse cx="35" cy="45" rx="8" ry="18" fill="currentColor" fillOpacity="0.6" transform="rotate(-15 35 45)" />
      <ellipse cx="42" cy="40" rx="6" ry="15" fill="currentColor" fillOpacity="0.4" transform="rotate(-25 42 40)" />
      
      {/* Body - elongated oval facing right */}
      <ellipse cx="50" cy="50" rx="22" ry="12" fill="currentColor" />
      
      {/* Head - positioned to the right */}
      <circle cx="70" cy="50" r="10" fill="currentColor" />
      
      {/* Bee stripes - vertical on body */}
      <rect x="38" y="44" width="3" height="12" fill="white" fillOpacity="0.4" />
      <rect x="46" y="44" width="3" height="12" fill="white" fillOpacity="0.4" />
      <rect x="54" y="44" width="3" height="12" fill="white" fillOpacity="0.4" />
      
      {/* Eye facing right */}
      <circle cx="73" cy="48" r="2" fill="white" />
      
      {/* Antennae */}
      <line x1="75" y1="44" x2="78" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="72" y1="43" x2="75" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="78" cy="38" r="1.5" fill="currentColor" />
      <circle cx="75" cy="37" r="1.5" fill="currentColor" />
      
      {/* Stinger - pointing left from rear of body */}
      <path d="M 28 50 L 22 48 L 22 52 Z" fill="currentColor" />
      
      {/* Simple legs */}
      <line x1="42" y1="58" x2="40" y2="65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="58" x2="48" y2="65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="58" y1="58" x2="56" y2="65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
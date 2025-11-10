import React from 'react';

export default function Logo({ className = "", size = 40 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse-slow"
      >
        {/* Outer circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="60" cy="60" r="55" fill="url(#logoGradient)" opacity="0.2" />
        
        {/* Main portfolio icon - document with sparkle */}
        <rect x="35" y="25" width="50" height="65" rx="4" fill="url(#logoGradient)" />
        <rect x="40" y="35" width="40" height="4" rx="2" fill="white" opacity="0.9" />
        <rect x="40" y="45" width="35" height="4" rx="2" fill="white" opacity="0.7" />
        <rect x="40" y="55" width="30" height="4" rx="2" fill="white" opacity="0.7" />
        
        {/* Sparkle/star effect */}
        <path
          d="M75 35 L77 40 L82 40 L78 43 L80 48 L75 45 L70 48 L72 43 L68 40 L73 40 Z"
          fill="white"
          className="animate-sparkle"
        />
        
        {/* Badge/checkmark */}
        <circle cx="85" cy="75" r="12" fill="url(#logoGradient2)" />
        <path
          d="M80 75 L83 78 L90 70"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        PortfolioPro
      </span>
    </div>
  );
}


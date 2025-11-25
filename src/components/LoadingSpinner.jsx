import React from "react";

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full border-2 border-current border-t-transparent"></div>
    </div>
  );
}


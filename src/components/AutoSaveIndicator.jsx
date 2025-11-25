import React from "react";

export default function AutoSaveIndicator({ status = "saved" }) {
  if (status === "saving") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
        Saving...
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Saved
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="text-xs text-destructive flex items-center gap-1">
        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
        Save failed
      </span>
    );
  }

  return null;
}


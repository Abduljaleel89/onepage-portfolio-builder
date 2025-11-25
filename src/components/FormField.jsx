import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  multiline = false,
  rows = 3,
  ...props
}) {
  const Component = multiline ? Textarea : Input;
  
  return (
    <div>
      {label && (
        <label className="font-medium mb-1 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Component
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        className={error ? "border-destructive" : ""}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}


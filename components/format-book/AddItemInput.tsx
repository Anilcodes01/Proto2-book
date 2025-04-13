"use client";
import React from "react";

interface AddItemInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  placeholder: string;
  autoFocus?: boolean;
}

export default function AddItemInput({
  value,
  onChange,
  onConfirm,
  placeholder,
  autoFocus = false,
}: AddItemInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onConfirm();
    }
  };

  return (
    <div className="mt-2 flex pl-2 pr-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2 py-1 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      <button
        onClick={onConfirm}
        className="bg-blue-500 text-white text-sm px-3 rounded-r hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
}
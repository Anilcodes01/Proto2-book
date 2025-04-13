// components/format-book/OtherOptionItem.tsx
"use client";
import { Trash2 } from "lucide-react";
import { OtherOptionItemProps } from "@/app/lib/types";

export default function OtherOptionItem({
  optionId,
  optionName,
  sectionTitle,
  isSelected,
  isDefault, // <-- Receive the prop
  onSelect,
  onDelete,
}: OtherOptionItemProps) {

  const handleSelectClick = () => {
    onSelect(optionId, optionName, sectionTitle);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Confirmation should ideally happen before calling onDelete if needed
    // if (window.confirm(`Are you sure you want to delete "${optionName}"?`)) {
       onDelete(sectionTitle, optionId);
    // }
  };

  return (
    <div
      className={`py-1.5 px-2 my-0.5 rounded flex justify-between items-center group cursor-pointer transition-colors duration-100 ${
        isSelected ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-sky-100'
      }`}
      onClick={handleSelectClick}
    >
      <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-800'}`}>
        {optionName}
      </span>
      {/* --- Conditionally render delete button --- */}
      {!isDefault && (
        <button
          onClick={handleDeleteClick}
          className="text-red-500 opacity-0 group-hover:opacity-80 hover:!opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full ml-2"
          title={`Delete ${optionName}`}
        >
          <Trash2 size={14} />
        </button>
      )}
      {/* --- End Conditional Render --- */}
    </div>
  );
}
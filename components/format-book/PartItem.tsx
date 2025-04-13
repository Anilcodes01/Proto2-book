// src/app/components/PartItem.tsx

import React from 'react';
import { Trash2 } from 'lucide-react';
import { PartItemProps } from '@/app/lib/types'; // Use type from central file

export default function PartItem({
    part,           // Receive the whole part object
    chapterId,
    isSelected,
    onSelect,
    onDelete
}: PartItemProps) {

  // Inside PartItem.tsx
const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('PartItem clicked:', part.id, part.name, chapterId); // DEBUG
    onSelect(part.id, part.name, chapterId);
};

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete part "${part.name}"?`)) {
            onDelete(chapterId, part.id);
        }
    };

    return (
        <div
            className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer ${isSelected ? 'bg-blue-100' : 'hover:bg-sky-100'}`}
            onClick={handleSelectClick}
        >
            <span className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : ''}`}>
                {part.name} {/* Use name from part object */}
            </span>
            <button
                onClick={handleDeleteClick}
                className="p-0.5 hover:bg-red-200 rounded-full text-red-500 opacity-60 hover:opacity-100"
                title="Delete Part"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}
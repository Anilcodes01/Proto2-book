// src/components/format-book/ChapterActionsDropdown.tsx
"use client";
import React from 'react';
import { Plus, BookPlus } from 'lucide-react';
import { ChapterActionsDropdownProps } from '@/app/lib/types';

export default function ChapterActionsDropdown({
    isChapterSelected,
    onAddChapterClick,
    onAddPartClick
}: ChapterActionsDropdownProps) {

    return (
        <div className="flex space-x-1">
            <button
                onClick={onAddChapterClick}
                className="p-1 w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-sky-600 cursor-pointer rounded-full transition-colors duration-150"
                title="Add New Chapter"
                aria-label="Add New Chapter"
            >
                <BookPlus size={18} />
            </button>
            <button
                onClick={onAddPartClick}
                disabled={!isChapterSelected}
                className={`p-1 w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-sky-600 cursor-pointer rounded-full transition-colors duration-150 ${!isChapterSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isChapterSelected ? "Add Part to Selected Chapter" : "Select a chapter to add a part"}
                aria-label={isChapterSelected ? "Add Part to Selected Chapter" : "Select a chapter first to enable adding a part"}
            >
                <Plus size={18} />
            </button>
        </div>
    );
}
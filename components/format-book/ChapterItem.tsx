// src/components/format-book/ChapterItem.tsx
"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';
import PartItem from './PartItem';
import AddItemInput from './AddItemInput';
import { ChapterItemProps } from '@/app/lib/types';

export default function ChapterItem({
    chapter,
    isSelected,
    selectedPartId,
    showAddPartInput,
    newPartName,
    onSelect,
    onSelectPart,
    onDelete,
    onDeletePart,
    onShowAddPartInput,
    onNewPartNameChange,
    onConfirmAddPart,
}: ChapterItemProps) {

    const handleSelect = () => {
        onSelect(chapter.id, chapter.name);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete chapter "${chapter.name}" and all its parts?`)) {
            onDelete(chapter.id);
        }
    };

    const handleConfirm = () => {
        onConfirmAddPart(chapter.id);
    }

    const isChapterActive = isSelected && !selectedPartId;

    return (
        <div className={`py-1 pl-4 pr-2 rounded transition-colors duration-100 ${isChapterActive ? 'bg-blue-100' : 'hover:bg-sky-100'}`}>
            <div className="flex items-center justify-between cursor-pointer group" onClick={handleSelect}>
                <span className={`flex-grow truncate pr-2 ${isChapterActive ? 'text-blue-800 font-semibold' : 'text-gray-700 group-hover:text-sky-800'}`}>
                    {chapter.name}
                </span>
                <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                     {/* Keep delete visible if chapter is active for clarity */}
                    <button
                        onClick={handleDeleteClick}
                        className={`p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 ${isChapterActive ? 'opacity-100' : ''}`}
                        title="Delete Chapter"
                        aria-label={`Delete chapter ${chapter.name}`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {chapter.parts && chapter.parts.length > 0 && (
                <div className="pl-4 mt-1 border-l border-gray-300">
                    {chapter.parts.map(part => (
                        <PartItem
                            key={part.id}
                            partId={part.id}
                            partName={part.name}
                            chapterName={chapter.name}
                            isSelected={selectedPartId === part.id && isSelected} // Part selected only if parent chapter is also selected
                            onSelect={onSelectPart}
                            chapterId={chapter.id}
                            onDelete={onDeletePart}
                            part={part}
                        />
                    ))}
                </div>
            )}

            {showAddPartInput && isSelected && ( // Only show input if this chapter is selected
                <div className="pl-4 mt-2">
                    <AddItemInput
                        value={newPartName}
                        onChange={onNewPartNameChange}
                        onConfirm={handleConfirm}
                        placeholder="New part name..."
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}
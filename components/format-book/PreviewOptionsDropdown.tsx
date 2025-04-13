// src/components/format-book/PreviewOptionsDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Eye, Settings } from 'lucide-react'; // Added Settings icon

interface PreviewOptionsDropdownProps {
    isPreviewLoading: boolean;
    isStructureLoading: boolean;
    previewUrl: string | null;
    previewError: string | null;
    selectedStyle?: string; // Optional: To manage select value if needed externally
    onGeneratePreview: (style: string) => void;
    onTogglePreview: () => void;
    // onStyleChange?: (newStyle: string) => void; // Optional: If style needs to be managed outside
}

export default function PreviewOptionsDropdown({
    isPreviewLoading,
    isStructureLoading,
    previewUrl,
    previewError,
    selectedStyle = 'classic', // Default value
    onGeneratePreview,
    onTogglePreview,
    // onStyleChange
}: PreviewOptionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null); // Ref for the select element

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleGenerateClick = () => {
        const style = selectRef.current?.value || 'classic';
        onGeneratePreview(style);
        // Optionally close dropdown after generating?
        // setIsOpen(false);
    };

     const handleToggleClick = () => {
        onTogglePreview();
         // Close dropdown when toggling view
         setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                isOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Determine button text/state based on preview status
    const getTriggerButtonText = () => {
        if (isPreviewLoading) return "Generating...";
        if (previewUrl && !previewError) return "Preview Ready";
        return "Preview Options";
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                disabled={isPreviewLoading}
                className="flex items-center gap-2 border rounded-lg bg-sky-100 px-4 py-1 cursor-pointer hover:bg-sky-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors duration-150"
                title="Open Preview Options"
            >
                <Settings size={16} />
                {getTriggerButtonText()}
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl p-4 z-20 border border-gray-200" // Positioned to the right
                >
                    <h4 className="text-sm font-medium text-gray-600 mb-3 text-center border-b pb-2">Preview Settings</h4>
                    <div className="space-y-4">
                        {/* Style Selection */}
                        <div className="flex items-center justify-between gap-2">
                            <label htmlFor="style-select-dropdown" className="text-sm font-medium text-gray-700 flex-shrink-0">Style:</label>
                            <select
                                id="style-select-dropdown"
                                ref={selectRef} // Use ref
                                className="p-2 border border-gray-300 rounded bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                                defaultValue={selectedStyle}
                                disabled={isPreviewLoading}
                                // onChange={(e) => onStyleChange?.(e.target.value)} // Optional external handler
                            >
                                <option value="classic">Classic Style</option>
                                <option value="modern">Modern Style</option>
                                <option value="minimalist">Minimalist Style</option>
                            </select>
                        </div>

                         {/* Generate Button */}
                        <button
                            onClick={handleGenerateClick} // Use specific handler
                            disabled={isPreviewLoading || isStructureLoading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            {isPreviewLoading ? 'Generating...' : 'Generate Preview'}
                        </button>

                        {/* Toggle Button */}
                         {previewUrl && ( // Only show toggle if preview exists
                            <button
                                onClick={handleToggleClick} // Use specific handler
                                disabled={isPreviewLoading} // Disable only during loading
                                className={`w-full px-4 py-2 border border-gray-300 rounded flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-150`}
                                // Title changes based on showPreview state (which is managed in parent)
                                // We can't directly know showPreview here, so provide a generic title or pass showPreview as prop if needed for more specific title
                                title={!previewUrl ? "Generate a preview first" : "Toggle Editor/Preview"}
                            >
                                {/* We need showPreview state from parent to dynamically change icon/text accurately */}
                                {/* For now, a generic toggle: */}
                                <Eye size={16} /> / <Edit3 size={16} /> Toggle View
                            </button>
                         )}


                        {/* Status Messages */}
                        <div className="text-center min-h-[1.5rem]"> {/* Reserve space */}
                            {previewError && <span className="text-red-600 text-xs break-words">{previewError}</span>}
                            {previewUrl && !previewError && !isPreviewLoading && (
                                <span className="text-green-600 text-xs">Preview generated successfully.</span>
                            )}
                            {isPreviewLoading && (
                                <span className="text-blue-600 text-xs">Processing preview...</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
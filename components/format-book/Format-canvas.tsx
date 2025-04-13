// src/components/format-book/Format-canvas.tsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import LayoutOptions from './Layout-options';
import { FormatCanvasProps } from '@/app/lib/types'; // Ensure this path is correct

// ... (debounce function, prefixes, DEBOUNCE_SAVE_MS) ...
const LOCAL_STORAGE_CHAPTER_PREFIX = 'tinymce-chapter-';
const LOCAL_STORAGE_PART_PREFIX = 'tinymce-part-';
const LOCAL_STORAGE_OTHER_PREFIX = 'tinymce-other-';
const DEBOUNCE_SAVE_MS = 1000;

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    // ... (debounce implementation) ...
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeoutId !== null) { clearTimeout(timeoutId); }
        timeoutId = setTimeout(() => func(...args), waitFor);
    };
}


export default function FormatCanvas({
    selectedChapterId,
    selectedChapterName,
    selectedPartId,
    selectedPartName,
    selectedOtherOptionId,
    selectedOtherOptionName,
    selectedOtherOptionSectionTitle // <-- Crucial for distinguishing Front/End Matter
}: FormatCanvasProps) {
    const editorRef = useRef<any>(null);
    const [currentContent, setCurrentContent] = useState<string>("");
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
    const [editorKey, setEditorKey] = useState<string>('initial-key'); // State for editor key

    // --- Determine the active item ---
    const activeItem = (() => {
        if (selectedOtherOptionId && selectedOtherOptionSectionTitle) { // Ensure section title exists
            // --- UPDATED Title Logic ---
            let contextTitle = 'Other'; // Default context
            if (selectedOtherOptionSectionTitle === "Front Matter") {
                contextTitle = 'Front Matter';
            } else if (selectedOtherOptionSectionTitle === "End Matter") {
                contextTitle = 'End Matter'; // <-- Set context for End Matter
            }
            return {
                id: selectedOtherOptionId,
                type: 'other' as const,
                name: selectedOtherOptionName,
                prefix: LOCAL_STORAGE_OTHER_PREFIX,
                title: `${selectedOtherOptionName || 'Item'} (${contextTitle})` // Use dynamic context
            };
            // --- END UPDATED Title Logic ---
        }
        if (selectedPartId && selectedChapterId) {
            // Try to get chapter name for better context if needed (optional)
            // const chapterName = selectedChapterName || 'Chapter'; // Use passed name or default
            return {
                id: selectedPartId,
                type: 'part' as const,
                name: selectedPartName,
                prefix: LOCAL_STORAGE_PART_PREFIX,
                title: `${selectedPartName || 'Part'} (Part)` // Simple context
            };
        }
        if (selectedChapterId) {
            return {
                id: selectedChapterId,
                type: 'chapter' as const,
                name: selectedChapterName,
                prefix: LOCAL_STORAGE_CHAPTER_PREFIX,
                title: selectedChapterName || 'Chapter' // Just chapter name
            };
        }
        return null; // Nothing selected
    })();

    const activeId = activeItem?.id;
    const activeType = activeItem?.type;
    const storagePrefix = activeItem?.prefix;

    // Update editor key whenever the active item *identity* changes
    useEffect(() => {
        const newKey = activeId ? `${activeType}-${activeId}` : 'no-item-selected';
        if (newKey !== editorKey) {
             console.log(`[FormatCanvas] Updating Editor Key from '${editorKey}' to '${newKey}'`);
             setEditorKey(newKey);
        }
    }, [activeId, activeType, editorKey]); // Dependencies for key change

    // --- Load content effect ---
    useEffect(() => {
        // This effect runs when the *key* changes OR when storagePrefix changes (redundant but safe)
        if (typeof window === 'undefined') return;

        console.log(`[FormatCanvas] Load Effect Triggered for key: ${editorKey}, activeItem:`, activeItem);

        if (activeId && storagePrefix) {
            setIsLoadingContent(true); // Set loading true *before* accessing storage
            const storageKey = `${storagePrefix}${activeId}`;
            let savedContent = "";
            try {
                savedContent = localStorage.getItem(storageKey) || "";
                console.log(`[FormatCanvas] Loading content for ${activeType} ${activeId} (key ${storageKey}): ${savedContent ? 'Found' : 'Not found'}`);
            } catch (error) {
                console.error("[FormatCanvas] Error reading from localStorage:", error);
            }
            // Set content AFTER potential async operations or error handling
            setCurrentContent(savedContent);
            // Use a minimal timeout to ensure state update completes before hiding loader
            const timer = setTimeout(() => setIsLoadingContent(false), 10); // Reduced delay
            return () => clearTimeout(timer);
        } else {
            console.log("[FormatCanvas] No item selected or missing info, clearing content.");
            setCurrentContent("");
            setIsLoadingContent(false); // Ensure loader is hidden if no item selected
        }

    }, [editorKey, storagePrefix, activeId, activeType]); // Depend on key and item details

    // --- Debounced save function --- (No changes needed)
    const debouncedSaveContent = useCallback(debounce((id: string, prefix: string, type: string, content: string) => {
        if (typeof window === 'undefined' || !id || !prefix) return;
        const storageKey = `${prefix}${id}`;
        try {
            console.log(`[FormatCanvas] Saving content for ${type} ${id} to key ${storageKey}`);
            localStorage.setItem(storageKey, content);
        } catch (error) {
            console.error("[FormatCanvas] Error writing to localStorage:", error);
        }
    }, DEBOUNCE_SAVE_MS), []); // Correct empty dependency array

    // --- Editor change handler --- (No changes needed)
    const handleEditorChange = (content: string, editor: any) => {
        setCurrentContent(content);
        if (activeId && activeType && storagePrefix) {
            debouncedSaveContent(activeId, storagePrefix, activeType, content);
        }
    };

    // --- Render logic ---
    return (
        <div className="flex flex-col w-full bg-gray-100"> {/* Outer container */}
          

            {/* Editor Area Wrapper */}
            <div className="flex-grow w-full flex justify-center text-start pt-6 pb-10 px-4 sm:px-6 lg:px-8"> {/* Padding for spacing */}
                {activeItem ? (
                    <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-lg shadow-md flex flex-col"> {/* Card styling */}
                        {/* Dynamic Title */}
                        <h1 className='text-2xl sm:text-3xl text-center font-bold text-gray-800 mb-6 sm:mb-8 border-b pb-3'>
                           {activeItem.title || 'Loading...'} {/* Use the title generated in activeItem */}
                        </h1>

                        {/* Loading State or Editor */}
                        {isLoadingContent ? (
                             <div className="text-gray-500 p-10 text-center">Loading content...</div>
                        ) : (
                             // The key prop on Editor forces re-initialization when the selected item changes
                            <Editor
                                key={editorKey}
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "5i2hotlss6fkqwz88af3yqq578kzp22a9u3pwamqrgm94cwy"} // Use env variable
                                onInit={(evt, editor) => (editorRef.current = editor)}
                                value={currentContent} // Controlled component uses state
                                onEditorChange={handleEditorChange}
                                init={{
                                    height: 'calc(100vh - 20rem)', // Adjust height dynamically
                                    min_height: 500,
                                    menubar: true,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample' // Removed duplicate 'image', 'media'
                                    ],
                                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media codesample | removeformat | fullscreen preview code help',
                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height: 1.6; }', // Slightly larger base font
                                    image_advtab: true, // Enable advanced image tab
                                    image_title: true, // Allow titles for images
                                    automatic_uploads: true, // Enable automatic uploads if backend is configured
                                    // file_picker_types: 'image media', // Specify file picker types
                                    // file_picker_callback: (cb, value, meta) => { /* ... your file picker logic ... */ }, // Add custom file picker if needed
                                    codesample_languages: [ // Common languages for code samples
                                        { text: 'HTML/XML', value: 'markup' },
                                        { text: 'JavaScript', value: 'javascript' },
                                        { text: 'CSS', value: 'css' },
                                        { text: 'PHP', value: 'php' },
                                        { text: 'Ruby', value: 'ruby' },
                                        { text: 'Python', value: 'python' },
                                        { text: 'Java', value: 'java' },
                                        { text: 'C', value: 'c' },
                                        { text: 'C#', value: 'csharp' },
                                        { text: 'C++', value: 'cpp' }
                                    ],
                                }}
                            />
                        )}
                    </div>
                ) : (
                    // Placeholder when nothing is selected
                    <div className="text-center text-gray-500 mt-10 w-full max-w-2xl p-8 bg-white rounded-lg shadow">
                        Select an item from the sidebar (like Front Matter, a Chapter, or a Part) to start editing its content.
                    </div>
                )}
            </div>
        </div>
    );
}
// app/context/BookStructureContext.tsx
"use client";
import React, { createContext, useState, useEffect, useCallback, useContext, useMemo, ReactNode } from 'react';
import { SectionData, ChapterOption, PartData, FetchedChapter, FetchedPart, IBookStructureContext } from '@/app/lib/types'; // Adjust path
import * as api from '@/app/lib/apiService'; // Adjust path
import { initialSections } from '@/app/lib/constants'; // Adjust path
import axios from 'axios'; // For error checking

// Create Context with a default value (can be null or a placeholder)
const BookStructureContext = createContext<IBookStructureContext | null>(null);

interface BookStructureProviderProps {
  children: ReactNode;
  bookProjectId: string | null; // Pass the ID to the provider
}

export const BookStructureProvider: React.FC<BookStructureProviderProps> = ({ children, bookProjectId }) => {
    const [sections, setSections] = useState<SectionData[]>(initialSections);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial structure
    useEffect(() => {
        if (!bookProjectId) {
            setError("Could not identify the book project.");
            setIsLoading(false);
            setSections(initialSections);
            return;
        }

        const fetchStructure = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // ... (Fetch logic using api.fetchChaptersAPI and api.fetchPartsAPI - same as in useBookStructure hook) ...
                 const [fetchedChapters, fetchedParts] = await Promise.all([
                    api.fetchChaptersAPI(bookProjectId),
                    api.fetchPartsAPI(bookProjectId)
                ]);

                const partsByChapterId: { [chapterId: string]: PartData[] } = {};
                 fetchedParts.forEach(part => {
                    if (!partsByChapterId[part.chapterId]) partsByChapterId[part.chapterId] = [];
                     if (!partsByChapterId[part.chapterId].some(p => p.id === part.id)) {
                         partsByChapterId[part.chapterId].push({ id: part.id, name: part.partName });
                    }
                });

                const chapterOptions: ChapterOption[] = fetchedChapters.map(ch => ({
                    id: ch.id,
                    name: ch.chapterName,
                    parts: partsByChapterId[ch.id] || [],
                }));

                setSections(prevSections =>
                    prevSections.map(section =>
                        section.title === "Chapters"
                            ? { ...section, options: chapterOptions }
                            : section
                    )
                );
            } catch (err) {
                 console.error("BookStructureProvider: Error fetching structure:", err);
                 let msg = "Failed to load book structure.";
                 if (axios.isAxiosError(err)) msg = err.response?.data?.message || `Server error: ${err.response?.status || 'Unknown'}`;
                 else if (err instanceof Error) msg = err.message;
                 setError(msg);
                 setSections(initialSections);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStructure();
    }, [bookProjectId]); // Re-fetch if bookProjectId changes


    // --- Data Modification Actions ---
    // Wrap actions in useCallback to maintain stable references
    const addChapter = useCallback(async (chapterName: string): Promise<ChapterOption> => {
        if (!bookProjectId) throw new Error("Missing bookProjectId");
        // API call is already inside api.addChapterAPI
        const addedChapterData = await api.addChapterAPI(bookProjectId, chapterName);
        const newChapter: ChapterOption = { id: addedChapterData.id, name: addedChapterData.chapterName, parts: [] };
        setSections(prev => prev.map(sec => sec.title === "Chapters" ? { ...sec, options: [...sec.options, newChapter] } : sec));
        return newChapter; // Return data for potential use by caller
    }, [bookProjectId]);

    const addPart = useCallback(async (chapterId: string, partName: string): Promise<PartData> => {
        if (!bookProjectId) throw new Error("Missing bookProjectId");
        const addedPartData = await api.addPartAPI(bookProjectId, chapterId, partName);
        const newPart: PartData = { id: addedPartData.id, name: addedPartData.partName };
        setSections(prev => prev.map(sec => {
            if (sec.title === "Chapters") {
                return { ...sec, options: sec.options.map(opt => (typeof opt !== 'string' && opt.id === chapterId) ? { ...opt, parts: [...opt.parts, newPart] } : opt) };
            } return sec;
        }));
        return newPart;
    }, [bookProjectId]);

     const deleteChapter = useCallback(async (chapterId: string): Promise<void> => {
        await api.deleteChapterAPI(chapterId);
        setSections(prev => prev.map(sec => sec.title === "Chapters" ? { ...sec, options: sec.options.filter(opt => typeof opt === 'string' || opt.id !== chapterId) } : sec));
    }, []);

     const deletePart = useCallback(async (chapterId: string, partId: string): Promise<void> => {
        await api.deletePartAPI(partId);
        setSections(prev => prev.map(sec => {
            if (sec.title === "Chapters") {
                return { ...sec, options: sec.options.map(opt => (typeof opt !== 'string' && opt.id === chapterId) ? { ...opt, parts: opt.parts.filter(p => p.id !== partId) } : opt) };
            } return sec;
        }));
    }, []);

    // --- Local State Actions ---
     const addOtherOption = useCallback((sectionTitle: string, optionName: string) => {
         setSections(prev => prev.map(sec => sec.title === sectionTitle ? { ...sec, options: [...sec.options, optionName] } : sec));
    }, []);

     const deleteOtherOption = useCallback((sectionTitle: string, optionName: string) => {
         setSections(prev => prev.map(sec => sec.title === sectionTitle ? { ...sec, options: sec.options.filter(opt => opt !== optionName) } : sec));
    }, []);


    // Memoize the context value
    const contextValue = useMemo(() => ({
        sections,
        isLoading,
        error,
        actions: {
            addChapter,
            addPart,
            deleteChapter,
            deletePart,
            addOtherOption,
            deleteOtherOption,
        }
    }), [sections, isLoading, error, addChapter, addPart, deleteChapter, deletePart, addOtherOption, deleteOtherOption]);


    return (
        <BookStructureContext.Provider value={contextValue}>
            {children}
        </BookStructureContext.Provider>
    );
};

// Custom hook to consume the context
export const useBookStructureContext = (): IBookStructureContext => {
    const context = useContext(BookStructureContext);
    if (!context) {
        throw new Error('useBookStructureContext must be used within a BookStructureProvider');
    }
    return context;
};
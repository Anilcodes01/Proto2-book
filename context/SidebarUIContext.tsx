// app/context/SidebarUIContext.tsx
"use client";
import React, { createContext, useState, useCallback, useContext, useMemo, ReactNode } from 'react';
import { ISidebarUIContext } from '@/app/lib/types'; // Adjust path

const SidebarUIContext = createContext<ISidebarUIContext | null>(null);

interface SidebarUIProviderProps {
  children: ReactNode;
  initialSelectedChapter?: string | null;
}

export const SidebarUIProvider: React.FC<SidebarUIProviderProps> = ({ children, initialSelectedChapter }) => {
    // State managed by this provider (same as in useSidebarUI hook)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedChapterName, setSelectedChapterName] = useState<string | null>(initialSelectedChapter || null);
    const [showAddInputForSection, setShowAddInputForSection] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [showAddPartInputForChapter, setShowAddPartInputForChapter] = useState<string | null>(null);
    const [newPartName, setNewPartName] = useState("");

    // Actions managed by this provider (same as in useSidebarUI hook)
     const toggleDropdown = useCallback((sectionTitle: string) => { /* ... */ setOpenDropdown(prev => prev === sectionTitle ? null : sectionTitle); /* reset inputs */ }, []);
     const selectChapter = useCallback((chapterName: string | null) => { /* ... */ setSelectedChapterName(chapterName); /* reset part input */ }, []);
     const showAddInput = useCallback((sectionTitle: string) => { /* ... */ setOpenDropdown(sectionTitle); setShowAddInputForSection(sectionTitle); /* reset inputs */ }, []);
     const showAddPartInput = useCallback((chapterName: string) => { /* ... */ setOpenDropdown("Chapters"); setShowAddPartInputForChapter(chapterName); /* reset inputs */ }, []);
     const resetInputs = useCallback(() => { /* ... */ setNewItemName(''); setNewPartName(''); setShowAddInputForSection(null); setShowAddPartInputForChapter(null); }, []);

    // Memoize context value
    const contextValue = useMemo(() => ({
        openDropdown,
        selectedChapterName,
        showAddInputForSection,
        newItemName,
        showAddPartInputForChapter,
        newPartName,
        actions: {
            toggleDropdown,
            selectChapter,
            showAddInput,
            showAddPartInput,
            setNewItemName,
            setNewPartName,
            resetInputs,
        }
    }), [
        openDropdown, selectedChapterName, showAddInputForSection, newItemName,
        showAddPartInputForChapter, newPartName, toggleDropdown, selectChapter,
        showAddInput, showAddPartInput, resetInputs
    ]);

    return (
        <SidebarUIContext.Provider value={contextValue}>
            {children}
        </SidebarUIContext.Provider>
    );
};

// Custom hook to consume the context
export const useSidebarUIContext = (): ISidebarUIContext => {
    const context = useContext(SidebarUIContext);
    if (!context) {
        throw new Error('useSidebarUIContext must be used within a SidebarUIProvider');
    }
    return context;
};
// app/hooks/useSidebarUI.ts
import { useState, useCallback } from 'react';

export function useSidebarUI(initialSelectedChapter?: string | null) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedChapterName, setSelectedChapterName] = useState<string | null>(initialSelectedChapter || null);
    const [showAddInputForSection, setShowAddInputForSection] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [showAddPartInputForChapter, setShowAddPartInputForChapter] = useState<string | null>(null);
    const [newPartName, setNewPartName] = useState("");

    const toggleDropdown = useCallback((sectionTitle: string) => {
        setOpenDropdown(prev => (prev === sectionTitle ? null : sectionTitle));
        // Close inputs when toggling sections
        setShowAddInputForSection(null);
        setShowAddPartInputForChapter(null);
        setNewItemName("");
        setNewPartName("");
    }, []);

    const selectChapter = useCallback((chapterName: string | null) => {
        setSelectedChapterName(chapterName);
        setShowAddPartInputForChapter(null); // Close part input if selecting diff chapter
        setNewPartName("");
    }, []);

     const showAddInput = useCallback((sectionTitle: string) => {
        if (openDropdown !== sectionTitle) {
           setOpenDropdown(sectionTitle);
        }
        setShowAddInputForSection(sectionTitle);
        setShowAddPartInputForChapter(null); // Close part input
        setNewItemName("");
     }, [openDropdown]);

     const showAddPartInput = useCallback((chapterName: string) => {
         if (openDropdown !== "Chapters") {
             setOpenDropdown("Chapters");
         }
         setShowAddPartInputForChapter(chapterName);
         setShowAddInputForSection(null); // Close generic input
         setNewPartName("");
     }, [openDropdown]);

     const resetInputs = useCallback(() => {
        setNewItemName("");
        setNewPartName("");
        setShowAddInputForSection(null);
        setShowAddPartInputForChapter(null);
     }, []);

    return {
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
    };
}
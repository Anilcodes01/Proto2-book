import { useState, useEffect, useCallback } from "react";
import { SectionData, ChapterOption, PartData, FetchedChapter, FetchedPart, OtherOptionData, FetchedFrontMatter, FetchedEndMatter } from "@/app/lib/types";
import { initialSections, } from "@/app/lib/constants";
import { fetchBookStructure, fetchFrontMatterAPI, addFrontMatterAPI, addChapterAPI , addPartAPI, deleteChapterAPI, deletePartAPI, deleteFrontMatterAPI, addEndMatterAPI, deleteEndMatterAPI, fetchEndMatterAPI} from "@/app/lib/api/bookStructureService";

// --- Constants and Type Guards (Keep as they are) ---
const defaultFrontMatterItems: ReadonlyArray<OtherOptionData> = [
  { id: 'default-dedication', name: 'Dedication', isDefault: true },
  { id: 'default-foreword', name: 'Foreword', isDefault: true },
  { id: 'default-prologue', name: 'Prologue', isDefault: true },
];
const defaultFrontMatterNames = new Set(defaultFrontMatterItems.map(item => item.name));

 export function isOtherOptionData(option: any): option is OtherOptionData {
  return typeof option === 'object' && option !== null && 'id' in option && 'name' in option && !('parts' in option);
}

export function isChapterOption(option: any): option is ChapterOption {
    return typeof option === 'object' && option !== null && 'id' in option && 'name' in option && 'parts' in option && Array.isArray(option.parts);
}
// --- End Constants and Type Guards ---

export const useBookStructureManager = (bookProjectId: string | null) => {
  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- loadStructure and useEffect (Keep as they are) ---
  const loadStructure = useCallback(async () => {
    const currentBookProjectId = typeof window !== 'undefined' ? localStorage.getItem("bookProjectId") : bookProjectId;

    if (!currentBookProjectId) {
        console.error("useBookStructureManager: No bookProjectId available.");
        setError("Could not identify the book project.");
        setIsLoading(false);
        setSections(initialSections);
        return;
      }

    setIsLoading(true);
    setError(null);
    try {
      const [structure, frontMatter, endMatter] = await Promise.all([
        fetchBookStructure(currentBookProjectId),
        fetchFrontMatterAPI(currentBookProjectId),
        fetchEndMatterAPI(currentBookProjectId),
    ]);

    const { chapters: fetchedChapters, parts: fetchedParts } = structure;
    const fetchedFrontMatter = frontMatter || []; // Ensure array even if API returns null/undefined
    const fetchedEndMatter = endMatter || [];     // Ensure array

    const partsByChapterId: { [chapterId: string]: PartData[] } = {};
    fetchedParts.forEach(part => {
      if (!partsByChapterId[part.chapterId]) {
        partsByChapterId[part.chapterId] = [];
      }
      if (!partsByChapterId[part.chapterId].some(p => p.id === part.id)) {
        partsByChapterId[part.chapterId].push({ id: part.id, name: part.partName });
      }
    });

    const chapterOptions: ChapterOption[] = fetchedChapters.map(ch => ({
      id: ch.id,
      name: ch.chapterName,
      parts: partsByChapterId[ch.id] || [],
    }));

    const fetchedFrontMatterOptions: OtherOptionData[] = fetchedFrontMatter.map(fm => ({
      id: fm.id,
      name: fm.fronteMatterName
    }));

    const fetchedFrontMatterNames = new Set(fetchedFrontMatterOptions.map(item => item.name));
    const finalFrontMatterOptions: OtherOptionData[] = [...fetchedFrontMatterOptions];
    defaultFrontMatterItems.forEach(defaultItem => {
      if (!fetchedFrontMatterNames.has(defaultItem.name)) {
          finalFrontMatterOptions.push(defaultItem);
      }
    });

    finalFrontMatterOptions.sort((a, b) => {
      const aIndex = defaultFrontMatterItems.findIndex(d => d.name === a.name);
      const bIndex = defaultFrontMatterItems.findIndex(d => d.name === b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    const finalEndMatterOptions: OtherOptionData[] = fetchedEndMatter.map(em => ({
      id: em.id,
      name: em.endMatterName
    }));

    finalEndMatterOptions.sort((a, b) => a.name.localeCompare(b.name));

    setSections(prevSections =>
      prevSections.map(section => {
        if (section.title === "Chapters") {
          return { ...section, options: chapterOptions };
        }
        if (section.title === "Front Matter") {
          return { ...section, options: finalFrontMatterOptions };
        }
        if (section.title === "End Matter") {
          return { ...section, options: finalEndMatterOptions };
        }
        return section;
      })
    );
    } catch (err: any) {
      console.error("useBookStructureManager: Error loading structure:", err);
      setError(err.message || "Failed to load book structure.");
      setSections(initialSections);
    } finally {
      setIsLoading(false);
    }
  }, [bookProjectId]);

  useEffect(() => {
    loadStructure();
  }, [loadStructure]);
  // --- End loadStructure and useEffect ---


  // --- Getters (Keep as they are) ---
  const getChapterById = useCallback((chapterId: string): ChapterOption | undefined => {
    const chapterSection = sections.find(s => s.title === "Chapters");
    return chapterSection?.options.find((opt): opt is ChapterOption =>
        isChapterOption(opt) && opt.id === chapterId
    );
  }, [sections]);

  const getChapterByName = useCallback((chapterName: string): ChapterOption | undefined => {
   const chapterSection = sections.find(s => s.title === "Chapters");
   return chapterSection?.options.find((opt): opt is ChapterOption =>
       isChapterOption(opt) && opt.name === chapterName
   );
  }, [sections]);

  const getOtherOptionById = useCallback((sectionTitle: string, optionId: string): OtherOptionData | undefined => {
     const section = sections.find(s => s.title === sectionTitle);
     return section?.options.find((opt): opt is OtherOptionData =>
         isOtherOptionData(opt) && opt.id === optionId
     );
  }, [sections]);
  // --- End Getters ---


  // --- Mutation Functions (Refactored) ---
  const addChapter = async (chapterName: string): Promise<ChapterOption> => {
    const currentBookProjectId = localStorage.getItem("bookProjectId");
    if (!currentBookProjectId) throw new Error("Book project ID is not available.");
    const existing = getChapterByName(chapterName);
    if (existing) throw new Error(`Chapter "${chapterName}" already exists.`);

    try {
      const addedChapterData = await addChapterAPI(currentBookProjectId, chapterName);
      const newChapter: ChapterOption = {
          id: addedChapterData.id,
          name: addedChapterData.chapterName,
          parts: [],
      };

      // Update state directly here
      setSections(prevSections =>
        prevSections.map(section =>
          section.title === "Chapters"
            ? { ...section, options: [...section.options, newChapter] }
            : section
        )
      );

      return newChapter;
    } catch (error) {
        console.error("API Error adding chapter:", error);
        // Re-throw the error so the calling component knows it failed
        throw error instanceof Error ? error : new Error('Failed to add chapter via API');
    }
  };

  const addPart = async (chapterId: string, partName: string): Promise<PartData> => {
    const currentBookProjectId = localStorage.getItem("bookProjectId");
    if (!currentBookProjectId) throw new Error("Book project ID is not available.");
    const chapter = getChapterById(chapterId);
    if (!chapter) throw new Error(`Chapter with ID ${chapterId} not found.`);
    if (chapter.parts.some(p => p.name === partName)) {
        throw new Error(`Part "${partName}" already exists in chapter "${chapter.name}".`);
    }

    try {
        const addedPartData = await addPartAPI(currentBookProjectId, chapterId, partName);
        const newPart: PartData = { id: addedPartData.id, name: addedPartData.partName };

        // Update state directly here
        setSections(prevSections =>
          prevSections.map(section => {
            if (section.title === "Chapters") {
              return {
                ...section,
                options: section.options.map(opt =>
                  isChapterOption(opt) && opt.id === chapterId
                    ? { ...opt, parts: [...opt.parts, newPart] } // Add new part immutably
                    : opt
                ),
              };
            }
            return section;
          })
        );

        return newPart;
    } catch (error) {
        console.error("API Error adding part:", error);
        throw error instanceof Error ? error : new Error('Failed to add part via API');
    }
  };

  const deleteChapter = async (chapterId: string): Promise<void> => {
    const chapter = getChapterById(chapterId);
    if (!chapter) throw new Error(`Chapter with ID ${chapterId} not found.`);

    try {
        await deleteChapterAPI(chapterId);

        // Update state directly here
        setSections(prevSections =>
            prevSections.map(section =>
            section.title === "Chapters"
            ? {
                ...section,
                options: section.options.filter(
                    (opt) => !isChapterOption(opt) || opt.id !== chapterId // Filter out the chapter
                ),
                }
            : section
            )
        );
    } catch (error) {
        console.error("API Error deleting chapter:", error);
        throw error instanceof Error ? error : new Error('Failed to delete chapter via API');
    }
  };

  const deletePart = async (chapterId: string, partId: string): Promise<void> => {
   const chapter = getChapterById(chapterId);
   if (!chapter?.parts.some(p => p.id === partId)) {
       throw new Error(`Part with ID ${partId} not found in chapter ${chapterId}.`);
   }

   try {
        await deletePartAPI(partId);

        // Update state directly here
        setSections(prevSections =>
            prevSections.map(section => {
                if (section.title === "Chapters") {
                return {
                    ...section,
                    options: section.options.map(opt =>
                        isChapterOption(opt) && opt.id === chapterId
                            ? { ...opt, parts: opt.parts.filter(p => p.id !== partId) } // Filter out the part
                            : opt
                        ),
                    };
                }
                return section;
            })
        );
   } catch (error) {
       console.error("API Error deleting part:", error);
       throw error instanceof Error ? error : new Error('Failed to delete part via API');
   }
  };

  const addOtherOption = async (sectionTitle: string, optionName: string): Promise<OtherOptionData> => {
    const currentBookProjectId = localStorage.getItem("bookProjectId");
    if (!currentBookProjectId) throw new Error("Book project ID is not available.");

    const isDefaultForFrontMatter = sectionTitle === "Front Matter" && defaultFrontMatterNames.has(optionName);
    if (isDefaultForFrontMatter) {
        throw new Error(`Cannot add "${optionName}" as it's a default item for Front Matter.`);
    }

    const section = sections.find(s => s.title === sectionTitle);
    if (section?.options.some(opt => isOtherOptionData(opt) && opt.name === optionName)) {
        throw new Error(`Option "${optionName}" already exists in ${sectionTitle}.`);
    }

    try {
        let addedOptionData: { id: string; fronteMatterName?: string; endMatterName?: string; };

        if (sectionTitle === "Front Matter") {
            addedOptionData = await addFrontMatterAPI(currentBookProjectId, optionName);
        } else if (sectionTitle === "End Matter") {
            addedOptionData = await addEndMatterAPI(currentBookProjectId, optionName);
        } else {
            throw new Error(`Cannot add options via API to section "${sectionTitle}".`);
        }

        const newOption: OtherOptionData = {
            id: addedOptionData.id,
            name: addedOptionData.fronteMatterName || addedOptionData.endMatterName || optionName
        };

        // Update state directly here
        setSections(prevSections =>
            prevSections.map(sec =>
                sec.title === sectionTitle
                    ? { ...sec, options: [...sec.options, newOption] } // Add new option immutably
                    : sec
            )
        );
        // TODO: Consider re-sorting the options array here if needed

        return newOption;
    } catch (error) {
        console.error(`API Error adding other option to ${sectionTitle}:`, error);
        throw error instanceof Error ? error : new Error(`Failed to add option to ${sectionTitle} via API`);
    }
  };


  const deleteOtherOption = async (sectionTitle: string, optionId: string): Promise<void> => {
    const section = sections.find(s => s.title === sectionTitle);
    const itemToDelete = section?.options.find((opt): opt is OtherOptionData => isOtherOptionData(opt) && opt.id === optionId);

    const isDefault = sectionTitle === "Front Matter" && defaultFrontMatterItems.some(d => d.id === optionId);

    if (isDefault || optionId.startsWith('default-')) {
         throw new Error(`Default Front Matter item "${itemToDelete?.name || 'Item'}" cannot be deleted.`);
    }

    if (!itemToDelete) {
      throw new Error(`Option with ID ${optionId} not found in ${sectionTitle}.`);
    }

    try {
        if (sectionTitle === "Front Matter") {
            await deleteFrontMatterAPI(optionId);
        } else if (sectionTitle === "End Matter") {
            await deleteEndMatterAPI(optionId);
        } else {
             throw new Error(`Cannot delete options via API from section "${sectionTitle}".`);
        }

        // Update state directly here
        setSections(prevSections =>
            prevSections.map(sec => {
                if (sec.title === sectionTitle) {
                    return {
                        ...sec,
                        options: sec.options.filter(opt => !isOtherOptionData(opt) || opt.id !== optionId), // Filter out the option
                    };
                }
                return sec;
            })
        );
    } catch (error) {
        console.error(`API Error deleting other option from ${sectionTitle}:`, error);
        throw error instanceof Error ? error : new Error(`Failed to delete option from ${sectionTitle} via API`);
    }
  };
  // --- End Mutation Functions ---


  return {
    sections,
    isLoading,
    error,
    addChapter,
    addPart,
    deleteChapter,
    deletePart,
    addOtherOption,
    deleteOtherOption,
    // Removed the specific local functions from the return, they are now internal
    getChapterById,
    getChapterByName,
    getOtherOptionById,
  };
}
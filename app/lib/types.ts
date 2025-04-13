export interface ChapterOption {
  id: string;
  name: string;
  parts: PartData[];
}

export interface FetchedChapter {
  id: string;
  bookProjectId: string;
  chapterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartData {
  id: string;
  name: string;
}

export interface FetchedPart {
  id: string;
  chapterId: string;
  partName: string;
}

export interface SidebarSectionProps {
  section: SectionData;
  isOpen: boolean;
  selectedChapterId: string | null;
  selectedPartId: string | null;
  selectedOtherOptionId: string | null; 
  showAddInput: boolean;
  showAddPartInputForChapterId: string | null;
  onSelectOtherOption: (optionId: string | null, optionName: string | null, sectionTitle: string | null) => void;
  newItemName: string;
  newPartName: string;
  onToggle: (sectionTitle: string) => void;
  onSelectChapter: (chapterId: string | null, chapterName: string | null) => void;
  onSelectPart: (partId: string | null, partName: string | null, chapterId: string | null) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDeletePart: (chapterId: string, partId: string) => void;
  onDeleteOtherOption: (sectionTitle: string, optionId: string) => void; 
  onShowAddInput: (sectionTitle: string) => void;
  onShowAddPartInput: (chapterId: string) => void;
  onNewItemNameChange: (value: string) => void;
  onNewPartNameChange: (value: string) => void;
  onConfirmAddItem: (sectionTitle: string) => void;
  onConfirmAddPart: (chapterId: string) => void;
}

export interface FormatSidebarProps {
  onSelectChapter: (chapterInfo: { id: string; name: string } | null) => void;
  onAddChapter: (chapterName: string) => void;
  selectedChapterId: string | null; // Add this property
  selectedChapterName: string | null; // Add this property
  selectedOtherOptionId: string | null; // <-- Add this
  selectedOtherOptionName: string | null; 
  onSelectOtherOption: (optionInfo: { id: string; name: string; sectionTitle: string } | null) => void; // <-- Add this
  onAddOtherOption: (sectionTitle: string, optionName: string) => void;
  selectedPartId: string | null;
  onDeleteChapter: (chapterName: string) => void;
  onAddPart: (chapterName: string, partName: string) => void;
  onDeletePart: (chapterId: string, partId: string) => void;
  selectedChapter: string | null;
  onDeleteOtherOption: (sectionTitle: string, optionId: string) => void;
  onSelectPart: (partInfo: { id: string; name: string; chapterId: string } | null) => void;
}
export function isChapterOption(option: ChapterOption | OtherOptionData): option is ChapterOption {
  return (option as ChapterOption).parts !== undefined;
}

export function isOtherOptionData(option: ChapterOption | OtherOptionData): option is OtherOptionData {
  return (option as ChapterOption).parts === undefined;
}

export interface SectionData {
  title: string;
  options: (ChapterOption | OtherOptionData)[];
}

export interface ChapterActionsDropdownProps {
  isChapterSelected: boolean;
  onAddChapterClick: () => void;
  onAddPartClick: () => void;
}

export interface OtherOptionData {
  id: string; 
  name: string; 
  isDefault?: boolean;
}

export interface FetchedFrontMatter {
  id: string;
  bookProjectId: string;
  fronteMatterName: string; 
  createdAt: string;
  updatedAt: string;
}

export interface FetchedEndMatter {
  id: string;
  endMatterName: string; // Define field name for End Matter
  bookProjectId: string;
}

export interface IBookStructureContext {
  sections: SectionData[];
  isLoading: boolean;
  error: string | null;
  actions: {
    addChapter: (chapterName: string) => Promise<ChapterOption>;
    addPart: (chapterId: string, partName: string) => Promise<PartData>;
    deleteChapter: (chapterId: string) => Promise<void>;
    deletePart: (chapterId: string, partId: string) => Promise<void>;
    addOtherOption: (sectionTitle: string, optionName: string) => void;
    deleteOtherOption: (sectionTitle: string, optionName: string) => void;
  };
}

export interface ISidebarUIContext {
  openDropdown: string | null;
  selectedChapterName: string | null;
  showAddInputForSection: string | null;
  newItemName: string;
  showAddPartInputForChapter: string | null;
  newPartName: string;
  actions: {
    toggleDropdown: (sectionTitle: string) => void;
    selectChapter: (chapterName: string | null) => void;
    showAddInput: (sectionTitle: string) => void;
    showAddPartInput: (chapterName: string) => void;
    setNewItemName: (name: string) => void;
    setNewPartName: (name: string) => void;
    resetInputs: () => void;
  };
}

export interface ChapterItemProps {
  chapter: ChapterOption;
  isSelected: boolean;
  showAddPartInput: boolean; 
  newPartName: string;
  onSelect: (chapterId: string, chapterName: string) => void;
  selectedPartId: string | null;
  onSelectPart: (partId: string, partName: string, chapterId: string) => void;
  onDelete: (chapterId: string) => void; 
  onDeletePart: (chapterId: string, partId: string) => void;
  onShowAddPartInput: (chapterId: string) => void; 
  onNewPartNameChange: (value: string) => void;
  onConfirmAddPart: (chapterId: string) => void; 
}

export interface OtherOptionItemProps {
  optionId: string; // <-- Use ID
  optionName: string;
  sectionTitle: string;
  isDefault?: boolean;
  isSelected: boolean; // <-- Add this
  onSelect: (optionId: string, optionName: string, sectionTitle: string) => void; // <-- Add this
  onDelete: (sectionTitle: string, optionId: string) => void; // <-- Modify to use ID
}

export interface PartItemProps {
  partId: string;
  partName: string;
  chapterId: string;
  isSelected: boolean;
  onSelect: (partId: string, partName: string, chapterId: string) => void;
  part: PartData;
  chapterName: string;
  onDelete: (chapterId: string, partId: string) => void;
}

export type FormatCanvasProps = {
  selectedChapterId: string | null;
  selectedChapterName: string | null;
  selectedPartId: string | null;
  selectedPartName: string | null;
  selectedOtherOptionId: string | null;    // <-- Add this
  selectedOtherOptionName: string | null; // <-- Add this
  selectedOtherOptionSectionTitle: string | null; // <-- Add this (for context/title)
};

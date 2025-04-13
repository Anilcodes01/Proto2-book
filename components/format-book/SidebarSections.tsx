// src/components/format-book/SidebarSections.tsx
"use client";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  ChapterOption,
  OtherOptionData,
  SidebarSectionProps,
  isChapterOption,
  isOtherOptionData,
} from "@/app/lib/types";
import ChapterItem from "./ChapterItem";
import OtherOptionItem from "./OtherOptionItem";
import AddItemInput from "./AddItemInput";
import ChapterActionsDropdown from "./ChapterActionDropdowns";

export default function SidebarSection({
  section,
  isOpen,
  selectedChapterId,
  selectedPartId,
  selectedOtherOptionId,
  showAddInput,
  showAddPartInputForChapterId,
  newItemName,
  newPartName,
  onToggle,
  onSelectChapter,
  onSelectPart,
  onSelectOtherOption,
  onDeleteChapter,
  onDeletePart,
  onDeleteOtherOption,
  onShowAddInput,
  onShowAddPartInput,
  onNewItemNameChange,
  onNewPartNameChange,
  onConfirmAddItem,
  onConfirmAddPart,
}: SidebarSectionProps) {

  const handleHeaderClick = () => {
    onToggle(section.title);
  };

  const handleShowGenericAddInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowAddInput(section.title);
  };

  const handleShowChapterAddInput = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent toggling the section when clicking add chapter
      onShowAddInput(section.title);
  };

  const handlePrepareAddPart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling the section when clicking add part
    if (selectedChapterId) {
      onShowAddPartInput(selectedChapterId);
    } else {
      console.warn("Attempted to add part without selecting a chapter.");
      alert("Please select a chapter first before adding a part.");
    }
  };

  const renderOptions = () => {
     if (!section.options || section.options.length === 0) {
        if (!showAddInput) {
             return (
                 <div className="px-2 py-1 text-sm text-gray-500 italic">
                     No items added yet.
                 </div>
             );
         }
         return null;
     }

    return section.options.map((option, index) => {
      if (isChapterOption(option)) {
        return (
          <ChapterItem
            key={option.id ?? `chapter-${index}`}
            chapter={option}
            isSelected={selectedChapterId === option.id}
            selectedPartId={selectedChapterId === option.id ? selectedPartId : null}
            showAddPartInput={showAddPartInputForChapterId === option.id}
            newPartName={newPartName}
            onSelect={onSelectChapter}
            onSelectPart={onSelectPart}
            onDelete={onDeleteChapter}
            onDeletePart={onDeletePart}
            onShowAddPartInput={onShowAddPartInput}
            onNewPartNameChange={onNewPartNameChange}
            onConfirmAddPart={onConfirmAddPart}
          />
        );
      } else if (isOtherOptionData(option)) {
        return (
          <OtherOptionItem
            key={option.id ?? `other-${index}`}
            optionId={option.id}
            optionName={option.name}
            sectionTitle={section.title}
            isSelected={selectedOtherOptionId === option.id}
            onSelect={onSelectOtherOption}
            onDelete={onDeleteOtherOption}
            isDefault={option.isDefault ?? option.id?.startsWith('default-')}
          />
        );
      } else if (typeof option === 'string') {
          return (
              <div key={`string-${index}`} className="px-2 py-1 text-sm text-gray-400">(Legacy: {option})</div>
          );
      }
      console.warn("SidebarSection: Encountered unknown option type:", option);
      return <div key={`unknown-${index}`} className="px-2 py-1 text-xs text-red-500">Unknown Item Type</div>;
    });
  };

  return (
    <div className="border-b border-sky-200 last:border-b-0">
      <div className="flex justify-between items-center px-4 py-3 hover:bg-sky-100 transition-colors duration-150 cursor-pointer" onClick={handleHeaderClick}>
          <div className="flex items-center flex-grow mr-2 group">
              {isOpen ? (
                  <ChevronUp size={18} className="mr-2 text-gray-600 group-hover:text-sky-700 flex-shrink-0" />
              ) : (
                  <ChevronDown size={18} className="mr-2 text-gray-500 group-hover:text-sky-600 flex-shrink-0" />
              )}
              <span className="font-medium text-gray-800 group-hover:text-sky-800">{section.title}</span>
          </div>

          <div className="flex-shrink-0">
              {section.title === "Chapters" ? (
                  <ChapterActionsDropdown
                      isChapterSelected={!!selectedChapterId}
                      onAddChapterClick={handleShowChapterAddInput}
                      onAddPartClick={handlePrepareAddPart}
                  />
              ) : (section.title === "Front Matter" || section.title === "End Matter") ? (
                  <button
                      className="p-1 w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-sky-600 cursor-pointer rounded-full transition-colors duration-150"
                      onClick={handleShowGenericAddInput}
                      title={`Add ${section.title} Item`}
                      aria-label={`Add ${section.title} Item`}
                  >
                      <Plus size={18} />
                  </button>
              ) : null}
          </div>
      </div>

      {isOpen && (
        <div className="pl-5 pr-2 py-2 bg-white border-t border-sky-200">
           {renderOptions()}
           {showAddInput && (
             <AddItemInput
               value={newItemName}
               onChange={onNewItemNameChange}
               onConfirm={() => onConfirmAddItem(section.title)}
               placeholder={
                 section.title === "Chapters"
                   ? "New chapter name..."
                   : `New ${section.title.toLowerCase()} name...`
               }
               autoFocus
             />
           )}
        </div>
      )}
    </div>
  );
}
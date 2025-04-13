// src/components/format-book/FormatSidebar.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FormatSidebarProps, ChapterOption, PartData, OtherOptionData } from "@/app/lib/types";
import SidebarSection from "./SidebarSections";
import { useBookStructureManager } from "@/app/hooks/useBookStructureManager";

export default function FormatSidebar({
  onSelectChapter: parentOnSelectChapter,
  onSelectPart: parentOnSelectPart,
  onSelectOtherOption: parentOnSelectOtherOption,
  onAddChapter: parentOnAddChapter,
  onDeleteChapter: parentOnDeleteChapter,
  onAddPart: parentOnAddPart,
  onAddOtherOption: parentOnAddOtherOption,
  onDeleteOtherOption: parentOnDeleteOtherOption,
  onDeletePart: parentOnDeletePart,
  selectedChapterId: parentSelectedChapterId,
  selectedOtherOptionId: parentSelectedOtherOptionId,
  selectedOtherOptionName: parentSelectedOtherOptionName,
  selectedChapterName: parentSelectedChapterName,
  selectedPartId: parentSelectedPartId,
}: FormatSidebarProps) {

  const router = useRouter();
  const bookProjectId =
    typeof window !== "undefined"
      ? localStorage.getItem("bookProjectId")
      : null;

  const {
    sections,
    isLoading,
    error: structureError,
    addChapter,
    addPart,
    deleteChapter,
    deletePart,
    addOtherOption,
    deleteOtherOption,
    getChapterById,
    getChapterByName,
    getOtherOptionById,
  } = useBookStructureManager(bookProjectId);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [localSelectedChapterId, setLocalSelectedChapterId] = useState<
    string | null
  >(parentSelectedChapterId);
  const [localSelectedChapterName, setLocalSelectedChapterName] = useState<
    string | null
  >(parentSelectedChapterName);
  const [localSelectedPartId, setLocalSelectedPartId] = useState<string | null>(
    parentSelectedPartId
  );
  const [showAddInputForSection, setShowAddInputForSection] = useState<
    string | null
  >(null);
  const [newItemName, setNewItemName] = useState("");
  const [showAddPartInputForChapter, setShowAddPartInputForChapter] = useState<
    string | null
  >(null);
  const [newPartName, setNewPartName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSelectedChapterId(parentSelectedChapterId);
    setLocalSelectedChapterName(parentSelectedChapterName);
    setLocalSelectedPartId(parentSelectedPartId);
  }, [
    parentSelectedChapterId,
    parentSelectedChapterName,
    parentSelectedPartId,
  ]);

  const toggleDropdown = (sectionTitle: string) => {
    const isOpening = openDropdown !== sectionTitle;
    setOpenDropdown(isOpening ? sectionTitle : null);
    // Reset input states when toggling
    setShowAddInputForSection(null);
    setShowAddPartInputForChapter(null);
    setNewItemName("");
    setNewPartName("");
    setActionError(null);
  };

  const handleShowAddInput = (sectionTitle: string) => {
    if (openDropdown !== sectionTitle) {
      setOpenDropdown(sectionTitle);
    }
    setShowAddInputForSection(sectionTitle);
    setShowAddPartInputForChapter(null); // Hide part input if shown
    setNewItemName("");
    setActionError(null);
  };

  const handleShowAddPartInput = (chapterId: string) => {
    const chapter = getChapterById(chapterId);
    if (!chapter) return;

    if (openDropdown !== "Chapters") {
      setOpenDropdown("Chapters");
    }
    setShowAddPartInputForChapter(chapterId);
    setShowAddInputForSection(null); // Hide chapter/other input if shown
    setNewPartName("");
    setActionError(null);
  };

  const handleSelectChapter = (
    chapterId: string | null,
    chapterName: string | null
  ) => {
    parentOnSelectChapter(
      chapterId && chapterName ? { id: chapterId, name: chapterName } : null
    );
    setShowAddPartInputForChapter(null);
    setNewPartName("");
    setActionError(null);
  };

const handleSelectPart = (
  partId: string | null,
  partName: string | null,
  chapterId: string | null
) => {
  parentOnSelectPart(
      partId && partName && chapterId
          ? { id: partId, name: partName, chapterId: chapterId }
          : null
  );
  setActionError(null);
};

  const handleSelectOtherOption = (
    optionId: string | null,
    optionName: string | null,
    sectionTitle: string | null
) => {
    parentOnSelectOtherOption(
        optionId && optionName && sectionTitle
        ? { id: optionId, name: optionName, sectionTitle: sectionTitle }
        : null
    );
    setActionError(null);
};

const handleConfirmAddItem = async (sectionTitle: string) => {
  setActionError(null);
  const itemName = newItemName.trim();
  if (!itemName) {
     setShowAddInputForSection(null); // Hide input if empty
     return;
  }

  try {
      if (sectionTitle === "Chapters") {
          const newChapter = await addChapter(itemName);
          parentOnAddChapter(newChapter.name);
      } else if (sectionTitle === "Front Matter" || sectionTitle === "End Matter") {
          const newOption = await addOtherOption(sectionTitle, itemName);
          parentOnAddOtherOption(sectionTitle, newOption.name);
      } else {
          console.warn(`Add item called for unhandled section: ${sectionTitle}`);
           setActionError(`Adding items to "${sectionTitle}" is not supported.`);
           return;
      }
      setNewItemName("");
      setShowAddInputForSection(null);
  } catch (err: any) {
      console.error(`Error adding item to ${sectionTitle}:`, err);
      setActionError(err.message || `Failed to add item to ${sectionTitle}.`);
      // Keep input visible on error? Optional.
      // setNewItemName("");
      // setShowAddInputForSection(null);
  }
};

const handleConfirmAddPart = async (chapterId: string) => {
  setActionError(null);
  const partName = newPartName.trim();
  if (!partName) {
      setShowAddPartInputForChapter(null); // Hide input if empty
      return;
  }

  try {
      const newPart = await addPart(chapterId, partName);
      parentOnAddPart(chapterId, newPart.id);
      setNewPartName("");
      setShowAddPartInputForChapter(null);
  } catch (err: any) {
      console.error(`Error adding part to chapter ${chapterId}:`, err);
      setActionError(err.message || `Failed to add part.`);
      // Keep input visible on error? Optional.
      // setNewPartName("");
      // setShowAddPartInputForChapter(null);
  }
};


const handleDeleteChapterWrapper = async (chapterIdToDelete: string) => {
  setActionError(null);
  try {
      await deleteChapter(chapterIdToDelete);
      parentOnDeleteChapter(chapterIdToDelete);
  } catch (err: any) {
      console.error(`Error deleting chapter ${chapterIdToDelete}:`, err);
      setActionError(err.message || "Failed to delete chapter.");
  }
};
const handleDeletePartWrapper = async (chapterId: string, partId: string) => {
  setActionError(null);
  try {
      await deletePart(chapterId, partId);
      parentOnDeletePart(chapterId, partId);
  } catch (err: any) {
      console.error(`Error deleting part ${partId}:`, err);
      setActionError(err.message || "Failed to delete part.");
  }
};

const handleDeleteOtherOptionWrapper = async (sectionTitle: string, optionId: string) => {
  setActionError(null);
  try {
      await deleteOtherOption(sectionTitle, optionId);
      parentOnDeleteOtherOption(sectionTitle, optionId);
  } catch (err: any) {
      console.error(`Error deleting option ${optionId} from ${sectionTitle}:`, err);
      setActionError(err.message || `Failed to delete ${sectionTitle} item.`);
  }
};

  return (
    <div className="bg-sky-50 flex flex-col w-full min-h-screen text-black mt-16 border-r border-sky-200">
      <div className="flex flex-col gap-5 p-4 border-b border-sky-200">
        <button
          onClick={() => router.push("/step2")}
          className="hover:underline cursor-pointer text-left text-sm text-sky-700 hover:text-sky-900"
        >
          ← Back to Dashboard
        </button>
        <p className="text-center text-lg font-semibold text-gray-800">Book Structure</p>
      </div>
      {isLoading && (
        <div className="p-4 text-center text-gray-500">
          Loading structure...
        </div>
      )}
      {structureError && !isLoading && (
        <div className="p-4 text-center text-red-600 bg-red-100 border-b border-red-300">
          Error loading structure: {structureError}
        </div>
      )}
      {actionError && (
        <div className="p-2 mx-4 mb-2 text-center text-sm text-red-700 bg-red-100 border border-red-300 rounded">
          {actionError}
        </div>
      )}

      {!isLoading &&
        sections.map((section) => (
          <SidebarSection
          key={section.title}
          section={section}
          isOpen={openDropdown === section.title}
          selectedChapterId={parentSelectedChapterId}
          selectedPartId={parentSelectedPartId}
          selectedOtherOptionId={parentSelectedOtherOptionId}
          showAddInput={showAddInputForSection === section.title}
          showAddPartInputForChapterId={showAddPartInputForChapter}
          newItemName={newItemName}
          newPartName={newPartName}
          onToggle={toggleDropdown}
          onSelectChapter={handleSelectChapter}
          onSelectPart={handleSelectPart}
          onSelectOtherOption={handleSelectOtherOption}
          onDeleteChapter={handleDeleteChapterWrapper}
          onDeletePart={handleDeletePartWrapper}
          onDeleteOtherOption={handleDeleteOtherOptionWrapper}
          onShowAddInput={handleShowAddInput}
          onShowAddPartInput={handleShowAddPartInput}
          onNewItemNameChange={setNewItemName}
          onNewPartNameChange={setNewPartName}
          onConfirmAddItem={handleConfirmAddItem}
          onConfirmAddPart={handleConfirmAddPart}
        />
        ))}
    </div>
  );
}
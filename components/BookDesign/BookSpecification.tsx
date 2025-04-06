"use client";
import { sizes, bindingType, covers, papers, interiors } from "@/app/lib/constants";

interface BookSpecificationProps {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  selectedBindingType: string | null;
  setSelectedBindingType: (binding: string | null) => void;
  selectedInterior: string | null;
  setSelectedInterior: (interior: string | null) => void;
  selectedPaper: string | null;
  setSelectedPaper: (paper: string | null) => void;
  selectCover: string | null;
  setSelectCover: (cover: string | null) => void;
}

export function BookSpecification({
  selectedSize,
  setSelectedSize,
  selectedBindingType,
  setSelectedBindingType,
  selectedInterior,
  setSelectedInterior,
  selectedPaper,
  setSelectedPaper,
  selectCover,
  setSelectCover,
}: BookSpecificationProps) {
  const handleSizeSelect = (size: string) => {
    setSelectedSize(selectedSize === size ? null : size);
  };

  const handleBindingSelect = (binding: string) => {
    setSelectedBindingType(selectedBindingType === binding ? null : binding);
  };

  const handleInteriorSelect = (interior: string) => {
    setSelectedInterior(selectedInterior === interior ? null : interior);
  };

  const handlePaperSelect = (paper: string) => {
    setSelectedPaper((selectedPaper === paper ? null : paper));
  };

  const handleCoverSelect = (cover: string) => {
    setSelectCover((selectCover === cover ? null : cover));
  };

  return (
    <>
      <div className="mt-8">
        <h2 className="font-medium mb-2">Book Size*</h2>
        <div className="grid grid-cols-3 justify-between gap-4 mb-5">
          {sizes.map((size) => (
            <button
              key={size.dimensions}
              type="button"
              className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full ${
                selectedSize === size.dimensions
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
              onClick={() => handleSizeSelect(size.dimensions)}
            >
              <div className="font-medium text-lg sm:text-xl">
                {size.dimensions}
              </div>
              <div className="text-xs mt-1">{size.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium mb-2">Binding Type*</h2>
        <div className="grid grid-cols-3 justify-between gap-4 mb-5">
          {bindingType.map((binding) => (
            <button
              type="button"
              onClick={() => handleBindingSelect(binding)}
              className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full ${
                selectedBindingType === binding
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
              key={binding}
            >
              {binding}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium mb-2">Book Interior*</h2>
        <div className="grid grid-cols-3 justify-between gap-4 mb-5">
          {interiors.map((interior) => (
            <button
              key={interior.type}
              type="button"
              onClick={() => handleInteriorSelect(interior.type)}
              className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full text-left ${
                selectedInterior === interior.type
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-base sm:text-lg font-medium">
                  {interior.type}
                </h1>
                <p className="text-xs sm:text-sm">{interior.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium mb-2">Paper Type*</h2>
        <div className="grid grid-cols-3 justify-between gap-4 mb-5">
          {papers.map((paper) => (
            <button
              key={paper.type}
              type="button"
              onClick={() => handlePaperSelect(paper.type)}
              className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full text-left ${
                selectedPaper === paper.type
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-base sm:text-lg font-medium">
                  {paper.type}
                </h1>
                <p className="text-xs sm:text-sm">{paper.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-medium mb-2">Book cover lamination*</h2>
        <div className="grid grid-cols-3 justify-between gap-4 mb-5">
          {covers.map((cover) => (
            <button
              key={cover.type}
              type="button"
              onClick={() => handleCoverSelect(cover.type)}
              className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full text-left ${
                selectCover === cover.type
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <div className="flex flex-col gap-1">
                <h1 className="text-base sm:text-lg font-medium">
                  {cover.type}
                </h1>
                <p className="text-xs sm:text-sm">{cover.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
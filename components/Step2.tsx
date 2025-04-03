"use client";

import { useState } from "react";

export default function Step2() {
  const [selectedSize, setSelectedSize] = useState<string | null>("");
  const [selectedBindingType, setSelectedBindingType] = useState<string | null>(
    ""
  );
  const [selectedInterior, setSelectedInterior] = useState<string | null>("");
  const [selectedPaper, setSelectedPaper] = useState<string | null>("");
  const [selectCover, setSelectCover] = useState<string | null>("");
  const [selectedDesignOption, setSelectedDesignOption] = useState<string>("");

  const covers = [
    {
      type: "Gloss Finish",
      description:
        "Recommended for darker colored covers and designs with spatial detailing",
    },
    {
      type: "Matte Finish",
      description:
        "Recommended for lighter colored covers, especially with graphic designs",
    },
  ];

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDesignOption(event.target.value);
  };

  const interiors = [
    {
      type: "Black & White",
      description: "All Fiction and Non-Fiction books",
    },
    {
      type: "Colors",
      description: "Only for Cookbooks, Coffee table and Children's books",
    },
  ];

  const papers = [
    {
      type: "Cream paper",
      description: "Recommended for Fiction and Non-Fiction Books",
    },
    {
      type: "White paper",
      description: "Recommended for academic books with pictures and tables",
    },
    {
      type: "Art paper Matte",
      description:
        "Recommended for Cookbooks, coffee table and children's books",
    },
  ];

  const bindingType = ["Paperback & Hardcase"];

  const sizes = [
    {
      dimensions: "5 x 8",
      description: "Fiction, Poetry, and Non-Fiction Less than 50,000 words",
    },
    {
      dimensions: "5.5 x 8.5",
      description: "Fiction, Poetry, and Non-Fiction Less than 50,000 words",
    },
    {
      dimensions: "6 x 9",
      description:
        "Self-help, Biographies, Business and Academic Less than 75,000 words",
    },
    {
      dimensions: "8.5 x 8.5",
      description:
        "Coffee table books, Illustrated Children's books and Cookbooks",
    },
    {
      dimensions: "8.5 x 11",
      description: "Academic Books More than 75,000 words",
    },
  ];

  const handleSizeSelect = (size: string) => {
    setSelectedSize((prev) => (prev === size ? null : size));
  };

  const handleBindingSelect = (binding: string) => {
    setSelectedBindingType((prev) => (prev === binding ? null : binding));
  };

  const handleInteriorSelect = (interior: string) => {
    setSelectedInterior((prev) => (prev === interior ? null : interior));
  };

  const handlePaperSelect = (paper: string) => {
    setSelectedPaper((prev) => (prev === paper ? null : paper));
  };

  const handleCoverSelect = (cover: string) => {
    setSelectCover((prev) => (prev === cover ? null : cover));
  };

  return (
    <div className="flex items-center pl-64 w-full min-h-screen text-black justify-center p-8 bg-white">
      <div className="border w-4xl rounded-2xl  p-5">
        <div className="flex flex-col items-center ">
          <h1 className="text-2xl font-bold">Book Content & Design</h1>
          <p>
            Select your book's specifications, add content and design your cover
            and interior.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-medium mb-2">Book Size*</h2>
          <div className="grid grid-cols-3 justify-between w-3xl gap-4 mb-5">
            {sizes.map((size) => (
              <button
                key={size.dimensions}
                type="button"
                className={`px-4 py-2 rounded border cursor-pointer transition-colors w-full sm:w-auto ${
                  selectedSize === size.dimensions
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => handleSizeSelect(size.dimensions)}
              >
                <div className="font-medium text-xl">{size.dimensions}</div>
                <div className="text-xs mt-1">{size.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-medium mb-2">Binding Type*</h2>
          <div className="grid grid-cols-3 justify-between w-3xl gap-4 mb-5">
            {bindingType.map((binding) => (
              <button
                type="button"
                onClick={() => handleBindingSelect(binding)}
                className={`px-4 py-1 rounded border cursor-pointer transition-colors w-full sm:w-auto ${
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
          <div className="grid grid-cols-3 justify-between w-3xl gap-4 mb-5">
            {interiors.map((interior) => (
              <button
                key={interior.type}
                onClick={() => handleInteriorSelect(interior.type)}
                className={`px-4 py-1 rounded border cursor-pointer transition-colors w-full sm:w-auto ${
                  selectedInterior === interior.type
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl ">{interior.type}</h1>
                  <p className="text-sm">{interior.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-medium mb-2">Paper Type*</h2>
          <div className="grid grid-cols-3 justify-between w-3xl gap-4 mb-5">
            {papers.map((paper) => (
              <button
                key={paper.type}
                onClick={() => handlePaperSelect(paper.type)}
                className={`px-4 py-1 rounded border cursor-pointer transition-colors w-full sm:w-auto ${
                  selectedPaper === paper.type
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl">{paper.type}</h1>
                  <p className="text-sm">{paper.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-medium mb-2">Book cover lamination*</h2>
          <div className="grid grid-cols-3 justify-between w-3xl gap-4 mb-5">
            {covers.map((cover) => (
              <button
                key={cover.type}
                onClick={() => handleCoverSelect(cover.type)}
                className={`px-4 py-1 rounded border cursor-pointer transition-colors w-full sm:w-auto ${
                  selectCover === cover.type
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl">{cover.type}</h1>
                  <p className="text-sm">{cover.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1>Interior Design*</h1>

          <div className="space-y-4">
            <div className="flex flex-col mt-2 ">
              <div className="flex ">
                <input
                  id="formatting-tool"
                  type="radio"
                  value="formatting-tool"
                  checked={selectedDesignOption === "formatting-tool"}
                  onChange={handleOptionChange}
                  className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="formatting-tool"
                  className="ml-3 block text-gray-700"
                >
                  Use our interior formatting tool
                </label>
              </div>
              <div className="ml-8">
                <p className="text-sm text-gray-500 mt-1">
                  Works best for books with text and limited images.
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-sm text-blue-600">
                    Get Published in 2 days
                  </p>
                  <p className="text-sm text-blue-600">Publish Print & eBook</p>
                  <p className="text-sm text-blue-600">
                    Publish in India & sell in 150+ countries
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-2 ">
              <div className="flex ">
                <input
                  id="pdf-file"
                  type="radio"
                  value="pdf-file"
                  checked={selectedDesignOption === "pdf-file"}
                  onChange={handleOptionChange}
                  className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="formatting-tool"
                  className="ml-3 block text-gray-700"
                >
                  Upload your professionally formatted .docx file
                </label>
              </div>
              <div className="ml-8">
                <p className="text-sm text-gray-500 mt-1">
                  Works best for books that contain a lot of images, tables or
                  if the book requires a customized layout.
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-sm text-blue-600">
                    Get Published in 7 days
                  </p>
                  <p className="text-sm text-blue-600">Publish Print book</p>
                  <p className="text-sm text-blue-600">
                    Publish in India & sell in 150+ countries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 mt-8">
            <button className="border rounded-lg px-4 py-1 hover:bg-sky-200 cursor-pointer">Save as Draft</button>
            <button className="border rounded-lg px-4 py-1 hover:bg-sky-200 cursor-pointer">Save and Continue</button>
        </div>
      </div>
    </div>
  );
}

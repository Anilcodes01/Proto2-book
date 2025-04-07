"use client";
import { useContext, useEffect } from "react";
import { BookSpecification } from "./BookDesign/BookSpecification";
import { InteriorDesignOption } from "./BookDesign/InteriorDesign";
import { ActionButtons } from "./BookDesign/ActionButtons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeContext from "@/context/ThemeContext";

export default function Step2() {
  const {
    setSelectCover,
    selectCover,
    selectedBindingType,
    setSelectedBindingType,
    selectedInterior,
    setSelectedInterior,
    selectedPaper,
    setSelectedPaper,
    handleDocumentUpdate,
    selectedSize,
    setSelectedSize,
    handleDesignOptionUpdate,
    submitError,
    coverPreview,
    handleSaveContinue,
    handleSaveDraft,
    loading,
    fetchCoverPreview,
  } = useContext(ThemeContext);
  console.log(coverPreview)

  const router = useRouter();

   useEffect(() => {
    fetchCoverPreview();
   }, [coverPreview])
 

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 md:ml-44 bg-white text-black">
      <div className="w-full max-w-4xl rounded-lg p-4 sm:p-6 mx-auto md:ml-20 lg:ml-44">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            Book Content & Design
          </h1>
          <p className="text-center text-gray-600 text-sm sm:text-base">
            Select your book's specifications, add content and design your cover
            and interior.
          </p>
        </div>

        <BookSpecification
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedBindingType={selectedBindingType}
          setSelectedBindingType={setSelectedBindingType}
          selectedInterior={selectedInterior}
          setSelectedInterior={setSelectedInterior}
          selectedPaper={selectedPaper}
          setSelectedPaper={setSelectedPaper}
          selectCover={selectCover}
          setSelectCover={setSelectCover}
        />

<div className="mt-6 sm:mt-8">
          <h1 className="font-medium mb-2 text-base sm:text-lg">
            Cover Design*
          </h1>
          <div className="flex flex-col mb-4">
            {coverPreview ? (
              <div className="flex justify-center sm:justify-start">
                <Image
                  src={coverPreview}
                  width={400}
                  height={300}
                  alt="Cover preview"
                  className="w-44 h-32 object-cover"
                />
              </div>
            ) : (
              <div className="w-full sm:w-44 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm border">
                No cover preview
              </div>
            )}
            <p className="font-medium mt-4 mb-2 text-sm sm:text-base">
              Use our Cover Creator
            </p>
            <p className="text-xs sm:text-sm">
              Start with pre-existing templates, add images and text to create a
              professional-looking cover for your book without design knowledge.
            </p>
          </div>
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={() => router.push("/cover-design")}
              className="cursor-pointer px-4 py-2 rounded-lg bg-sky-200 hover:bg-sky-300 text-sm sm:text-base"
            >
              Launch Cover Creator
            </button>
          </div>
        </div>

        <InteriorDesignOption
          onDesignOptionChange={handleDesignOptionUpdate}
          onDocumentUpdate={handleDocumentUpdate}
        />

        {submitError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
            Error: {submitError}
          </div>
        )}

       

        <ActionButtons
          onSaveDraft={handleSaveDraft}
          onSaveContinue={handleSaveContinue}
          loading={loading}
        />
      </div>
    </div>
  );
}

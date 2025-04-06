"use client";
import { useEffect, useState } from "react";
import { BookSpecification } from "./BookDesign/BookSpecification";
import { InteriorDesignOption, UploadedDoc } from "./BookDesign/InteriorDesign";
import { ActionButtons } from "./BookDesign/ActionButtons";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export default function Step2() {
  const [selectedSize, setSelectedSize] = useState<string | null>("");
  const [selectedBindingType, setSelectedBindingType] = useState<string | null>("");
  const [selectedInterior, setSelectedInterior] = useState<string | null>("");
  const [selectedPaper, setSelectedPaper] = useState<string | null>("");
  const [selectCover, setSelectCover] = useState<string | null>("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
  const [finalDesignOption, setFinalDesignOption] = useState<string>("formatting-tool");
  const [finalUploadedDoc, setFinalUploadedDoc] = useState<UploadedDoc | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  console.log(isSubmitting)

  const router = useRouter();

  useEffect(() => {
    const fetchCoverPreview = async () => {
      try {
        const bookProjectId = localStorage.getItem("bookProjectId");
        if (!bookProjectId) return;

        const res = await axios.post("/api/get-info", { bookProjectId });

        if (res.status === 200) {
          toast.success("Cover preview fetched successfully");
         
        }
        const data = res.data?.data;

        if (data) {
          setCoverPreview(data.coverPreview || null);
          setSelectCover(data.coverLamination || "");
          setSelectedSize(data.size || "");
          setSelectedInterior(data.bookInteriorColour || "" )
          setSelectedPaper(data.paperType || "")
          setSelectedBindingType(data.bindingType || "");
        }
      } catch (error) {
        toast.error("Error fetching cover preview");
      }
    };

    fetchCoverPreview();
  }, []);

  const handleDesignOptionUpdate = (option: string) => {
    setFinalDesignOption(option);
  };

  const handleDocumentUpdate = (doc: UploadedDoc | null) => {
    setFinalUploadedDoc(doc);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitError(null);

    if (
      !selectedSize ||
      !selectedBindingType ||
      !selectedInterior ||
      !selectedPaper ||
      !selectCover
    ) {
      setSubmitError("Please fill all Book Specification fields.");
      alert("Please fill all Book Specification fields.");
      return;
    }

    if (finalDesignOption === "pdf-file" && !finalUploadedDoc) {
      setSubmitError("Please upload a DOCX file or select the formatting tool option.");
      toast.error("Please upload a DOCX file or select the formatting tool option.");
      return;
    }

    const bookProjectId = localStorage.getItem("bookProjectId");
    if (!bookProjectId) {
      setSubmitError("Book Project ID not found. Please go back to Step 1.");
      alert("Book Project ID not found. Please go back to Step 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      setLoading(true);
      const response = await axios.post("/api/bookDesign", {
        bookProjectId,
        size: selectedSize,
        bindingType: selectedBindingType,
        bookInteriorColour: selectedInterior,
        paperType: selectedPaper,
        coverLamination: selectCover,
        interiorDesign: finalDesignOption,
        bookPdfUrl: finalUploadedDoc?.cloudinaryUrl ?? null,
      });

      if (response.status === 200) {
        toast.success("Book information saved successfully!");
        setLoading(false);
        router.push("/step3");
      } else {
        const errorMessage = response.data?.message || "Failed to save book information";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error saving book information";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Save Draft clicked (implement logic)");
    toast.success("Save draft functionality not completed yet.")
  };

  const handleSaveContinue = () => {
    handleSubmit();
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-8 bg-white text-black">
      <div className="w-full max-w-4xl rounded-lg p-6 ml-44">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Content & Design</h1>
          <p className="text-center text-gray-600">
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

        <InteriorDesignOption
          onDesignOptionChange={handleDesignOptionUpdate}
          onDocumentUpdate={handleDocumentUpdate}
        />

        {submitError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
            Error: {submitError}
          </div>
        )}

        <div className="mt-8">
          <h1 className="font-medium mb-2">Cover Design*</h1>
          <div className="flex flex-col mb-4">
            {coverPreview ? (
              <Image
                src={coverPreview}
                width={400}
                height={300}
                alt="Cover preview"
                className="w-44 h-32 object-cover"
              />
            ) : (
              <div className="w-44 h-32 bg-gray-100 flex items-center justify-center text-gray-500 text-sm border">
                No cover preview
              </div>
            )}
            <p className="font-medium  mt-4 mb-2">Use our Cover Creator</p>
            <p className="text-sm">
              Start with pre-existing templates, add images and text to create a professional-looking
              cover for your book without design knowledge.
            </p>
          </div>
          <button
            onClick={() => router.push("cover-design")}
            className="cursor-pointer px-4 py-1 rounded-lg bg-sky-200 hover:bg-sky-300"
          >
            Launch Cover Creator
          </button>
        </div>

        <ActionButtons 
        onSaveDraft={handleSaveDraft} 
        onSaveContinue={handleSaveContinue}
        loading={loading}
      />
      </div>
    </div>
  );
}

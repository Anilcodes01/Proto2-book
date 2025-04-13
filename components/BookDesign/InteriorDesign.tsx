
"use client";
import { useState, useEffect } from "react"; // Import useEffect
import { FormattingToolOption } from "./FormattingToolOptions";
import { UploadDocxOption } from "./UploadDocxOption";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export interface UploadedDoc { // Export this interface if Step2 needs it
  id: string;
  title: string;
  cloudinaryUrl: string;
}

// Define props for the container
interface InteriorDesignOptionContainerProps {
  initialDesignOption?: string; // Optional: To set initial state from Step2 (e.g., loading draft)
  initialDocument?: UploadedDoc | null; // Optional: To set initial state from Step2
  onDesignOptionChange: (option: string) => void; // Callback for selection change
  onDocumentUpdate: (doc: UploadedDoc | null) => void; // Callback for upload/clear
}

export function InteriorDesignOption({
  initialDesignOption = "formatting-tool", // Default if not provided
  initialDocument = null,
  onDesignOptionChange,
  onDocumentUpdate,
}: InteriorDesignOptionContainerProps) {
  // Internal State
  const [selectedDesignOption, setSelectedDesignOption] = useState<string>(initialDesignOption);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<UploadedDoc | null>(initialDocument);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialDocument?.cloudinaryUrl ?? null); // Initial preview if doc exists

  // Effect to call callbacks when state changes
  useEffect(() => {
    onDesignOptionChange(selectedDesignOption);
  }, [selectedDesignOption, onDesignOptionChange]);

  useEffect(() => {
    onDocumentUpdate(currentDoc);
    // Update preview URL when currentDoc changes (covers initial load and upload)
    setPreviewUrl(currentDoc?.cloudinaryUrl ?? null);
  }, [currentDoc, onDocumentUpdate]);


  // --- Handlers ---

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOption = event.target.value;
    setSelectedDesignOption(newOption); // Internal state update triggers useEffect

    // Reset states specific to the upload option when switching away or to it
    setFile(null);
    setError(null);
    setCurrentDoc(null); // Reset doc triggers useEffect for onDocumentUpdate(null)
    setPreviewUrl(null);
    setLoading(false);
    const fileInput = document.getElementById("file-input") as HTMLInputElement | null;
     if (fileInput) fileInput.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setPreviewUrl(null);
    setCurrentDoc(null); // Clear previous doc info when new file selected triggers useEffect
    setLoading(false);
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url); // Only manages internal preview state
  };

   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
     console.log(`Preview Document loaded successfully with ${numPages} pages.`);
  };

  const handleUpload = async () => {
    if (!file) return;
    const originalFileName = file.name;
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setCurrentDoc(null); // Clear previous doc info triggers useEffect

    try {
      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      const responseData = await res.json();

      if (!res.ok) {
        const errorPayload = responseData as { error?: string; details?: string };
        throw new Error(errorPayload?.error || `Upload failed: ${res.statusText}`);
      }
      if (typeof responseData !== "string" || !responseData.startsWith('http')) {
        console.error("API Response:", responseData);
        throw new Error("Received invalid URL data from the server.");
      }

      const cloudinaryUrl = responseData;
      const title = originalFileName.replace(/\.docx$/i, "") || "Uploaded Document";

      const newDoc = { id: cloudinaryUrl, title: title, cloudinaryUrl: cloudinaryUrl };
      setCurrentDoc(newDoc); // Update internal state triggers useEffect for onDocumentUpdate
      setFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
      setCurrentDoc(null); // Clear doc info on error triggers useEffect
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  return (
    // No change needed in the JSX structure itself
    <div className="mt-8 w-full">
      <h1 className="font-medium w-full mb-2">Interior Design*</h1>
      <div className="space-y-4 w-full">
      <FormattingToolOption
    isSelected={selectedDesignOption === "formatting-tool"}
    onChange={handleOptionChange}
    value="formatting-tool"
    // onDocumentUpdate={setCurrentDoc} // <--- REMOVE THIS LINE
    currentDocument={currentDoc}
  />
        <UploadDocxOption
          isSelected={selectedDesignOption === "pdf-file"}
          onChange={handleOptionChange}
          value="pdf-file"
          file={file} // Pass internal state down
          loading={loading} // Pass internal state down
          error={error} // Pass internal state down
          currentDoc={currentDoc} // Pass internal state down
          previewUrl={previewUrl} // Pass internal state down
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onPreview={handlePreview} // Keep internal preview handler
          onDocumentLoadSuccess={onDocumentLoadSuccess}
        />
      </div>
    </div>
  );
}
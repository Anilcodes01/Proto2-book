"use client";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure worker (can be done once at a higher level, but including here for completeness)
// Ensure the path is correct relative to your public directory
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PdfPreviewProps {
  previewUrl: string | null;
  currentDocTitle?: string | null; // Optional title for placeholder text
  isLoading?: boolean; // Optional: To show specific loading inside preview if needed
}

const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
  console.log(`Document loaded with ${numPages} pages`);
  // Handle document load if needed (e.g., track numPages)
};

export function PdfPreview({
  previewUrl,
  currentDocTitle,
  isLoading = false, // Default to false
}: PdfPreviewProps) {
  return (
    <div className="aspect-[3/4] w-full max-w-[150px] mx-auto md:mx-0 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden relative shadow-inner">
      {previewUrl ? (
        <Document
          file={previewUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="p-2 text-center text-xs text-gray-500">
              Loading Preview...
            </div>
          }
          error={
            <div className="p-2 text-center text-xs text-red-600">
              Preview Error
            </div>
          }
          className="flex justify-center items-center w-full h-full"
        >
          {/* Only render Page if document loaded */}
          <Page
            pageNumber={1} // Always show the first page for preview
            width={150} // Fixed width for the container
            renderTextLayer={false} // Disable text layer for performance/simplicity
            renderAnnotationLayer={false} // Disable annotation layer
            className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:max-h-full"
          />
        </Document>
      ) : isLoading ? (
         <div className="p-2 text-center text-xs text-gray-500">
           Loading...
         </div>
      ) : (
        <div className="text-center text-xs text-gray-500 p-2">
          {currentDocTitle ? "Click Preview" : "Upload a file"}
        </div>
      )}
    </div>
  );
}
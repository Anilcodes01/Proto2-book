"use client";
import { useState, useEffect, useRef, useCallback } from "react"; // Added useRef, useCallback
import { Modal } from "./Modal";
import { UploadedDoc } from "./InteriorDesign";

// Import react-pdf components (still used for small preview)
import { Document as SmallPreviewDocument, Page as SmallPreviewPage } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Import pdfjs-dist directly for the modal
import * as pdfjsLib from "pdfjs-dist"; // Use pdfjs-dist directly
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api'; // Import types

// Ensure PDF worker is configured (ensure path is correct relative to public folder)
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`; // Use worker from pdfjs-dist

// Interface and constants remain the same
interface FormattingToolOptionProps {
  isSelected: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onDocumentUpdate: (doc: UploadedDoc | null) => void;
  currentDocument: UploadedDoc | null;
}

const FORMATTING_STYLES = [
  { id: "classic", label: "Classic" },
  { id: "minimalist", label: "Minimalist" },
  { id: "modern", label: "Modern" },
];

const isFormattedDoc = (doc: UploadedDoc | null): boolean => {
  if (!doc) return false;
  return FORMATTING_STYLES.some(style => doc.title.includes(`(${style.id})`));
};


// --- Helper Function to Extract Text ---
// (Similar logic to the HTML example)
async function extractTextContentFromPage(pdfPage: any): Promise<string> { // Use 'any' for pdfPage temporarily if type inference is tricky
  const textContent = await pdfPage.getTextContent();
  const items = textContent.items as TextItem[]; // Type assertion
  let lastY: number | null = null;
  let line = '';
  let htmlLines: string[] = [];
  const Y_THRESHOLD = 2; // Tolerance for items being on the same line

  for (const item of items) {
    const thisY = item.transform[5];
    const str = item.str.trim(); // Trim whitespace from individual items

    if (!str) continue; // Skip empty items

    if (lastY === null || Math.abs(lastY - thisY) < Y_THRESHOLD) {
      // Append to the current line, adding space if needed
      line += (line.endsWith(' ') || str.startsWith(' ') ? '' : ' ') + str;
    } else {
      // Push the completed line and start a new one
      if (line.trim()) htmlLines.push(line.trim());
      line = str;
    }
    lastY = thisY;
  }
  // Push the last line if it has content
  if (line.trim()) htmlLines.push(line.trim());

  // Wrap each line in a div for basic structure
  return htmlLines.map(line => `<div class="line">${line}</div>`).join('');
}
// --- End Helper Function ---


export function FormattingToolOption({
  isSelected,
  onChange,
  value,
  onDocumentUpdate,
  currentDocument,
}: FormattingToolOptionProps) {
  const radioId = "formatting-tool";
  // --- States for main component ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(FORMATTING_STYLES[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // --- States for Full Screen Book Preview Modal ---
  const [isFullPreviewModalOpen, setIsFullPreviewModalOpen] = useState(false);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null); // Use ref for the PDFDocumentProxy
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0); // Index of the first page in the spread (0, 2, 4...)
  const [leftPageContent, setLeftPageContent] = useState<string>("");
  const [rightPageContent, setRightPageContent] = useState<string>("");
  const [isBookPreviewLoading, setIsBookPreviewLoading] = useState<boolean>(false);
  const [bookPreviewError, setBookPreviewError] = useState<string | null>(null);
  // -----------------------------------------------

  // Effect for small preview URL
  useEffect(() => {
    if (isSelected && currentDocument && isFormattedDoc(currentDocument)) {
      setPreviewDocUrl(currentDocument.cloudinaryUrl);
    } else if (!isSelected) {
      setPreviewDocUrl(null);
    }
  }, [isSelected, currentDocument?.cloudinaryUrl, currentDocument?.title]);


  // --- PDF Loading and Processing Logic for Book Preview Modal ---
  const loadPageContent = useCallback(async (pageIndex: number) => {
    if (!pdfDocRef.current || pageIndex < 0 || pageIndex >= numPages) {
        return ""; // Return empty string if page index is out of bounds or PDF not loaded
    }
    try {
        const page = await pdfDocRef.current.getPage(pageIndex + 1); // pdf.js pages are 1-based
        const htmlContent = await extractTextContentFromPage(page);
        // Clean up page resources (important for memory)
        // Note: pdf.js documentation is a bit sparse on explicit cleanup needs per page after getTextContent
        // If memory issues arise, investigate page.cleanup() or similar if available/needed.
        return htmlContent;
    } catch (error) {
        console.error(`Error loading text content for page ${pageIndex + 1}:`, error);
        return `<p class="text-red-500">Error loading page ${pageIndex + 1}</p>`;
    }
  }, [numPages]); // Dependency on numPages ensures check is correct

  // Effect to load PDF document when modal opens
  useEffect(() => {
    if (isFullPreviewModalOpen && previewDocUrl) {
      const loadPdf = async () => {
        setIsBookPreviewLoading(true);
        setBookPreviewError(null);
        setLeftPageContent("");
        setRightPageContent("");
        setCurrentPageIndex(0); // Reset to first page
        pdfDocRef.current = null; // Clear previous ref

        try {
          const loadingTask = pdfjsLib.getDocument(previewDocUrl);
          const pdf = await loadingTask.promise;
          pdfDocRef.current = pdf;
          setNumPages(pdf.numPages);
          // Initial page content load will be triggered by the next effect
        } catch (error: any) {
          console.error("Error loading PDF:", error);
          setBookPreviewError(error?.message || "Failed to load PDF document.");
          setNumPages(0);
        } finally {
            // Loading of the *document* is done, but page content loading is separate
            // setIsBookPreviewLoading(false); // We'll set this false after initial pages load
        }
      };
      loadPdf();

      // Cleanup function when modal closes or URL changes
      return () => {
          pdfDocRef.current?.destroy(); // Clean up the PDF document object
          pdfDocRef.current = null;
          setNumPages(0);
          setCurrentPageIndex(0);
          setLeftPageContent("");
          setRightPageContent("");
          setIsBookPreviewLoading(false); // Ensure loading is reset on close
          setBookPreviewError(null);
      };
    }
  }, [isFullPreviewModalOpen, previewDocUrl]);


  // Effect to load content for the *current* pages whenever index or pdfDoc changes
  useEffect(() => {
      if (pdfDocRef.current && numPages > 0 && isFullPreviewModalOpen) {
          setIsBookPreviewLoading(true); // Show loading for page turns too
          const loadCurrentSpread = async () => {
              const leftContent = await loadPageContent(currentPageIndex);
              const rightContent = await loadPageContent(currentPageIndex + 1);
              setLeftPageContent(leftContent);
              setRightPageContent(rightContent);
              setIsBookPreviewLoading(false); // Hide loading after content is set
          };
          loadCurrentSpread();
      } else if (!isFullPreviewModalOpen) {
          // Reset content if modal is closed (though cleanup effect also handles this)
          setLeftPageContent("");
          setRightPageContent("");
      }
  }, [currentPageIndex, numPages, loadPageContent, isFullPreviewModalOpen]); // Add loadPageContent & isFullPreviewModalOpen

  // --- End PDF Logic ---


  // Handlers for main component remain the same
  const handleLaunchClick = () => {
    setIsModalOpen(true);
    setModalFile(null);
    setSelectedStyle(FORMATTING_STYLES[0].id);
    setModalError(null);
    setIsProcessing(false);
  };

  const handleModalClose = () => {
    if (isProcessing) return;
    setIsModalOpen(false);
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalFile(e.target.files?.[0] || null);
    setModalError(null);
  };

  const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStyle(event.target.value);
  };

  const handleApplyFormat = async () => {
     if (!modalFile || !selectedStyle) {
      setModalError("Please select a DOCX file and choose a formatting style.");
      return;
    }
    if (isProcessing) return;

    setModalError(null);
    setIsProcessing(true);
    setPreviewDocUrl(null); // Clear previous preview URL state

    const formData = new FormData();
    formData.append("file", modalFile);
    formData.append("style", selectedStyle);

    try {
      const res = await fetch("/api/upload-with-template", {
        method: "POST",
        body: formData,
      });
      const responseData = await res.json();

      if (!res.ok) {
        const errorPayload = responseData as { error?: string; details?: string };
        throw new Error(errorPayload?.error || `Formatting failed: ${res.statusText}`);
      }
      // Assuming the API returns the *PDF* URL directly now
      if (typeof responseData !== "string" || !responseData.startsWith('http')) {
        console.error("API Response (expected PDF URL):", responseData);
        throw new Error("Received invalid PDF URL data from the server after formatting.");
      }

      const pdfCloudinaryUrl = responseData; // Expecting PDF URL
      const title = modalFile.name.replace(/\.docx$/i, "") || "Formatted Document";

      const formattedDoc: UploadedDoc = {
        id: pdfCloudinaryUrl, // Use URL as ID? Or generate one?
        title: `${title} (${selectedStyle})`,
        cloudinaryUrl: pdfCloudinaryUrl, // Store the PDF URL
      };

      setPreviewDocUrl(formattedDoc.cloudinaryUrl); // Update state with the PDF URL
      onDocumentUpdate(formattedDoc); // Notify parent

      setIsProcessing(false);
      setIsModalOpen(false); // Close the formatting modal

    } catch (err: any) {
      console.error("Error during formatting:", err);
      setModalError(err.message || "An unexpected error occurred during formatting.");
      setPreviewDocUrl(null); // Clear preview on error
      onDocumentUpdate(null); // Notify parent of error/no doc
      setIsProcessing(false);
    }
  };


  // Handler for small react-pdf preview load success
  const onSmallPreviewLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`Small PDF preview loaded with ${numPages} pages.`);
  };

  // --- Handlers for Book Preview Modal Navigation ---
  const handleOpenFullPreview = () => {
    if (previewDocUrl) {
      setIsFullPreviewModalOpen(true);
    }
  };

  const handleCloseFullPreview = () => {
    setIsFullPreviewModalOpen(false); // State reset happens in useEffect cleanup
  };

  const handleNextPage = () => {
    if (currentPageIndex + 2 < numPages) {
      setCurrentPageIndex(prev => prev + 2);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex - 2 >= 0) {
      setCurrentPageIndex(prev => prev - 2);
    }
  };
  // --------------------------------------------

  return (
    <>
      {/* Main Option Card - Uses react-pdf for small preview */}
      <div
        className={`border rounded-lg p-4 transition-all duration-300 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center">
           {/* Radio button and label */}
           <input
            id={radioId}
            type="radio"
            value={value}
            checked={isSelected}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label
            htmlFor={radioId}
            className="ml-3 block text-gray-900 font-medium cursor-pointer"
          >
            Use our interior formatting tool
          </label>
        </div>
        {isSelected && (
          <div className="flex flex-col md:flex-row gap-6 mt-4 pl-7">
            {/* Small Preview Area (react-pdf) - Made Clickable */}
            <div
              className="md:w-1/4 flex-shrink-0"
              onClick={handleOpenFullPreview}
            >
              <div
                 className={`aspect-[3/4] w-full max-w-[150px] mx-auto md:mx-0 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden relative shadow-inner ${previewDocUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
              >
                {previewDocUrl ? (
                   <SmallPreviewDocument
                    file={previewDocUrl}
                    onLoadSuccess={onSmallPreviewLoadSuccess}
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
                    <SmallPreviewPage
                      pageNumber={1}
                      width={150}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:max-h-full"
                    />
                  </SmallPreviewDocument>
                ) : (
                  <span className="text-gray-500 text-sm text-center px-2">
                    Formatted Book Preview
                  </span>
                )}
              </div>
              {/* Title below preview */}
              {previewDocUrl && currentDocument && isFormattedDoc(currentDocument) && (
                 <p
                   className="mt-1.5 text-xs text-center text-gray-700 truncate md:text-left"
                   title={currentDocument.title}
                 >
                   {currentDocument.title}
                 </p>
              )}
               {/* Hint text */}
              {previewDocUrl && (
                  <p className="mt-1 text-xs text-center text-gray-500 md:text-left">
                    Click to enlarge
                  </p>
              )}
            </div>
            {/* Info and Button Area */}
            <div className="md:w-3/4">
              <p className="text-sm text-gray-600 mt-1">
                Works best for books with text and limited images. Provides PDF output.
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm text-blue-600">✓ Get Published in 2 days</p>
                <p className="text-sm text-blue-600">✓ Publish Print & eBook</p>
                <p className="text-sm text-blue-600">
                  ✓ Publish in India & sell in 150+ countries
                </p>
              </div>
              <button
                type="button"
                onClick={handleLaunchClick}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Launch Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Formatting Modal (Existing) */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Format Your Manuscript"
      >
         {/* ... Content is unchanged ... */}
         <div className="space-y-4">
          <div>
            <label htmlFor="modal-file-input" className="block text-sm font-medium text-gray-700 mb-1">
              Upload .docx Manuscript
            </label>
            <input
              id="modal-file-input"
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleModalFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isProcessing}
            />
            {modalFile && <p className="text-xs text-gray-600 mt-1 truncate">Selected: {modalFile.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Formatting Style
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {FORMATTING_STYLES.map((style) => (
                <div key={style.id} className="flex items-center">
                  <input
                    id={`style-${style.id}`}
                    name="formatting-style"
                    type="radio"
                    value={style.id}
                    checked={selectedStyle === style.id}
                    onChange={handleStyleChange}
                    disabled={isProcessing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`style-${style.id}`} className="ml-2 block text-sm text-gray-700">
                    {style.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {modalError && (
             <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
               <span className="font-medium">Error:</span> {modalError}
             </p>
           )}
          <div className="flex justify-end pt-4 border-t mt-4">
            <button
              type="button"
              onClick={handleApplyFormat}
              disabled={!modalFile || !selectedStyle || isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? ( /* Add spinner */ "Processing...") : ("Apply Format & Upload")}
            </button>
          </div>
        </div>
      </Modal>

      {/* ---- Book Style Preview Modal (Using pdfjs-dist for text) ---- */}
      <Modal
        isOpen={isFullPreviewModalOpen}
        onClose={handleCloseFullPreview}
        title={currentDocument?.title || "Document Preview"}
        // Allow modal to be large, content inside will manage layout
        // Add classes to your Modal component's overlay/container if needed for sizing
        // e.g., ensure it allows content with `w-[90vw] h-[90vh]`
      >
        <div className="w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px] flex flex-col items-center justify-center bg-gray-200 p-4 relative">
          {/* Loading State */}
          {isBookPreviewLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <p className="text-white text-xl">Loading Book...</p>
              {/* Add spinner here if desired */}
            </div>
          )}

           {/* Error State */}
          {bookPreviewError && !isBookPreviewLoading && (
             <div className="absolute inset-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-center z-20" role="alert">
              <strong className="font-bold mr-2">Error:</strong>
              <span className="block sm:inline">{bookPreviewError}</span>
            </div>
          )}

          {/* Book Wrapper - Only show when not loading/error and URL exists */}
          {previewDocUrl && !isBookPreviewLoading && !bookPreviewError && (
            <>
              <div
                className="relative w-full h-[calc(100%-60px)] bg-no-repeat bg-center bg-cover shadow-lg rounded-md overflow-hidden"
                // Make sure book-mockup.jpg is in your /public folder
                style={{ backgroundImage: "url('/book-mockup.jpg')" }}
              >
                {/* Left Page Content */}
                <div
                   className="text-page left-page absolute w-[38%] h-[76%] top-[6%] left-[12%] p-3 md:p-5 overflow-y-auto bg-transparent text-[#2d2d2d] font-serif text-[10px] md:text-xs leading-snug md:leading-normal"
                   // Use dangerouslySetInnerHTML for the extracted HTML
                   dangerouslySetInnerHTML={{ __html: leftPageContent }}
                />
                {/* Right Page Content */}
                 <div
                   className="text-page right-page absolute w-[38%] h-[76%] top-[6%] right-[12%] p-3 md:p-5 overflow-y-auto bg-transparent text-[#2d2d2d] font-serif text-[10px] md:text-xs leading-snug md:leading-normal"
                   dangerouslySetInnerHTML={{ __html: rightPageContent }}
                />
              </div>

              {/* Controls */}
              <div className="controls flex justify-center items-center mt-4 h-[60px] w-full">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0 || isBookPreviewLoading}
                  className="px-4 py-2 mx-2 text-sm md:text-base bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  ⬅ Prev
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPageIndex + 1} - {Math.min(currentPageIndex + 2, numPages)} of {numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex + 2 >= numPages || isBookPreviewLoading}
                   className="px-4 py-2 mx-2 text-sm md:text-base bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                >
                  Next ➡
                </button>
              </div>
            </>
          )}

           {/* Fallback if no URL */}
            {!previewDocUrl && !isBookPreviewLoading && !bookPreviewError && (
                 <p className="text-center text-gray-600">No document selected for preview.</p>
            )}
        </div>
      </Modal>
      {/* -------------------------------- */}
    </>
  );
}
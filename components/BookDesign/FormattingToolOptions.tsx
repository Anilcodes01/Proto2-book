"use client";
import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { UploadedDoc } from "./InteriorDesign";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useRouter } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

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
  return FORMATTING_STYLES.some((style) =>
    doc.title?.includes(`(${style.id})`)
  );
};

export function FormattingToolOption({
  isSelected,
  onChange,
  value,
  onDocumentUpdate,
  currentDocument,
}: FormattingToolOptionProps) {
  const radioId = "formatting-tool";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(
    FORMATTING_STYLES[0].id
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [previewPageNumber, setPreviewPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageTextContent, setPageTextContent] = useState<{[key: number]: string}>({});
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [textExtractionInProgress, setTextExtractionInProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
  }, []);

  useEffect(() => {
    if (isSelected && currentDocument && isFormattedDoc(currentDocument)) {
      setPreviewDocUrl(currentDocument.cloudinaryUrl);
      setPreviewPageNumber(1);
      setNumPages(null);
      setPdfError(null);
      setPageTextContent({});
    } else if (!isSelected) {
      setPreviewDocUrl(null);
      setNumPages(null);
      setPreviewPageNumber(1);
      setPdfError(null);
      setPageTextContent({});
    }
  }, [isSelected, currentDocument?.cloudinaryUrl, currentDocument?.title]);

  // Effect to extract text when preview modal is opened
  useEffect(() => {
    if (isPreviewModalOpen && previewDocUrl && !textExtractionInProgress) {
      extractTextContent(previewDocUrl, previewPageNumber);
      if (numPages && previewPageNumber + 1 <= numPages) {
        extractTextContent(previewDocUrl, previewPageNumber + 1);
      }
    }
  }, [isPreviewModalOpen, previewDocUrl, previewPageNumber, numPages, textExtractionInProgress]);

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

  const extractTextContent = async (pdfUrl: string, pageNum: number) => {
    if (pageTextContent[pageNum] || textExtractionInProgress) return;
    
    try {
      setTextExtractionInProgress(true);
      console.log(`Extracting text for page ${pageNum}...`);
      
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      console.log(`Extracted text for page ${pageNum}:`, textItems.substring(0, 50) + "...");
      
      setPageTextContent(prev => ({...prev, [pageNum]: textItems}));
    } catch (error) {
      console.error(`Error extracting text from page ${pageNum}:`, error);
    } finally {
      setTextExtractionInProgress(false);
    }
  };

  const handleApplyFormat = async () => {
    if (!modalFile || !selectedStyle) {
      setModalError("Please select a DOCX file and choose a formatting style.");
      return;
    }
    if (isProcessing) return;

    setModalError(null);
    setIsProcessing(true);
    setPreviewDocUrl(null);
    setNumPages(null);
    setPreviewPageNumber(1);
    setPdfError(null);
    setPageTextContent({});

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
        const errorPayload = responseData as {
          error?: string;
          details?: string;
        };
        throw new Error(
          errorPayload?.error || `Formatting failed: ${res.statusText}`
        );
      }
      if (
        typeof responseData !== "string" ||
        !responseData.startsWith("http")
      ) {
        console.error("API Response:", responseData);
        throw new Error(
          "Received invalid URL data from the server after formatting."
        );
      }

      const cloudinaryUrl = responseData;
      const title =
        modalFile.name.replace(/\.docx$/i, "") || "Formatted Document";

      const formattedDoc: UploadedDoc = {
        id: cloudinaryUrl,
        title: `${title} (${selectedStyle})`,
        cloudinaryUrl: cloudinaryUrl,
      };

      setPreviewDocUrl(formattedDoc.cloudinaryUrl);
      onDocumentUpdate(formattedDoc);

      setIsProcessing(false);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error during formatting:", err);
      setModalError(
        err.message || "An unexpected error occurred during formatting."
      );
      setPreviewDocUrl(null);
      setIsProcessing(false);
    }
  };

  const onDocumentLoadSuccessSmall = () => {};

  const onDocumentLoadSuccessLarge = ({
    numPages: loadedNumPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(loadedNumPages);
    if (previewPageNumber > loadedNumPages) {
      setPreviewPageNumber(
        Math.max(1, loadedNumPages - (loadedNumPages % 2 === 0 ? 1 : 0))
      );
    } else if (previewPageNumber % 2 === 0) {
      setPreviewPageNumber(previewPageNumber - 1);
    }
    setPdfLoading(false);
    setPdfError(null);
    
    // Extract text for current spread after PDF loads
    if (previewDocUrl) {
      extractTextContent(previewDocUrl, previewPageNumber);
      if (previewPageNumber + 1 <= loadedNumPages) {
        extractTextContent(previewDocUrl, previewPageNumber + 1);
      }
    }
  };

  const onDocumentLoadErrorLarge = (error: Error) => {
    console.error("Error loading large PDF preview:", error);
    setPdfError(
      `Failed to load PDF: ${error.message}. Please check the file or try again.`
    );
    setPdfLoading(false);
    setNumPages(null);
  };

  const handleOpenPreviewModal = () => {
    if (previewDocUrl) {
      setIsPreviewModalOpen(true);
      setPdfLoading(true);
      // Clear text content when opening modal to refresh
      setPageTextContent({});
    }
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const goToPreviousPage = () => {
    const newPageNum = Math.max(previewPageNumber - 2, 1);
    setPreviewPageNumber(newPageNum);
    
    // Clear text content for these pages to refresh
    setPageTextContent(prev => {
      const newContent = {...prev};
      delete newContent[newPageNum];
      delete newContent[newPageNum + 1];
      return newContent;
    });
    
    if (previewDocUrl) {
      extractTextContent(previewDocUrl, newPageNum);
      if (newPageNum + 1 <= (numPages || 0)) {
        extractTextContent(previewDocUrl, newPageNum + 1);
      }
    }
  };

  const goToNextPage = () => {
    const newPageNum = Math.min(previewPageNumber + 2, numPages || 1);
    setPreviewPageNumber(newPageNum);
    
    // Clear text content for these pages to refresh
    setPageTextContent(prev => {
      const newContent = {...prev};
      delete newContent[newPageNum];
      delete newContent[newPageNum + 1];
      return newContent;
    });
    
    if (previewDocUrl) {
      extractTextContent(previewDocUrl, newPageNum);
      if (newPageNum + 1 <= (numPages || 0)) {
        extractTextContent(previewDocUrl, newPageNum + 1);
      }
    }
  };

  const getPageSpreadLabel = () => {
    if (!numPages) return "";
    const left = previewPageNumber;
    const right = previewPageNumber + 1;
    if (right <= numPages) {
      return `Pages ${left}-${right} of ${numPages}`;
    }
    if (left === numPages) {
      return `Page ${left} of ${numPages}`;
    }
    return "";
  };

  const canGoPrev = previewPageNumber > 1;
  const canGoNext = numPages !== null && previewPageNumber + 1 < numPages;

  return (
    <>
      <div
        className={`border rounded-lg p-4 transition-all duration-300 ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="flex items-center">
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
            <div className="md:w-1/4 flex-shrink-0">
              <div
                onClick={handleOpenPreviewModal}
                className={`aspect-[3/4] w-full max-w-[150px] mx-auto md:mx-0 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden relative shadow-inner ${
                  previewDocUrl
                    ? "cursor-pointer hover:opacity-80 transition-opacity"
                    : "cursor-default"
                }`}
                role={previewDocUrl ? "button" : undefined}
                tabIndex={previewDocUrl ? 0 : -1}
                aria-label={
                  previewDocUrl
                    ? "Open document preview"
                    : "Document preview area"
                }
              >
                {previewDocUrl ? (
                  <Document
                    file={previewDocUrl}
                    onLoadSuccess={onDocumentLoadSuccessSmall}
                    loading={
                      <div className="p-2 text-center text-xs text-gray-500">
                        Loading...
                      </div>
                    }
                    error={
                      <div className="p-2 text-center text-xs text-red-600">
                        Error
                      </div>
                    }
                    className="flex justify-center items-center w-full h-full"
                  >
                    <Page
                      pageNumber={1}
                      width={150}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:max-h-full"
                    />
                  </Document>
                ) : (
                  <span className="text-gray-500 text-sm text-center px-2">
                    Formatted Book Preview
                  </span>
                )}
              </div>
              {previewDocUrl &&
                currentDocument &&
                isFormattedDoc(currentDocument) && (
                  <p
                    className="mt-1.5 text-xs text-center text-gray-700 truncate md:text-left"
                    title={currentDocument.title}
                  >
                    {currentDocument.title}
                  </p>
                )}
            </div>
            <div className="md:w-3/4">
              <p className="text-sm text-gray-600 mt-1">
                Works best for books with text and limited images.
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-sm text-blue-600">
                  ✓ Get Published in 2 days
                </p>
                <p className="text-sm text-blue-600">✓ Publish Print & eBook</p>
                <p className="text-sm text-blue-600">
                  ✓ Publish in India & sell in 150+ countries
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/format-book')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Launch Template
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Format Your Manuscript"
      >
        <div className="space-y-4 p-4">
          <div>
            <label
              htmlFor="modal-file-input"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
            {modalFile && (
              <p className="text-xs text-gray-600 mt-1 truncate">
                Selected: {modalFile.name}
              </p>
            )}
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
                  <label
                    htmlFor={`style-${style.id}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
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
              {isProcessing ? "Processing..." : "Apply Format & Upload"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Full screen preview modal */}
      <div 
        className={`fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center transition-opacity duration-300 ${
          isPreviewModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Header with title and close button */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
          <h2 className="text-xl font-semibold">
            {currentDocument?.title
              ? `Preview: ${currentDocument.title}`
              : "Document Preview"}
          </h2>
          <button 
            onClick={handleClosePreviewModal}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Main book preview area - takes full height with larger mockup */}
        <div className="w-full h-full flex items-center justify-center px-4 pb-16 pt-20">
          <div
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: "url('/book-mockup.jpg')" }}
          >
            {(pdfLoading || pdfError || !previewDocUrl) && (
              <div className="absolute inset-0 flex items-center justify-center z-20 text-gray-600">
               
                {pdfError && (
                  <span className="text-red-600 max-w-md text-center p-4 text-lg">
                    {pdfError}
                  </span>
                )}
                {!previewDocUrl && !pdfLoading && "No document selected."}
              </div>
            )}
            
            {/* Text content overlay for left page */}
            <div className="absolute top-[12%] left-[26%] w-[22%] h-[60%] overflow-auto z-10 py-16 mb-2 rounded">
              {previewDocUrl && pageTextContent[previewPageNumber] ? (
                <div className="font-serif text-xs text-gray-800 leading-relaxed">
                  {pageTextContent[previewPageNumber]}
                </div>
              ) : (
                !pdfLoading && !pdfError && previewDocUrl && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Extracting text...</span>
                  </div>
                )
              )}
            </div>
            
            {/* Text content overlay for right page */}
            <div className="absolute top-[12%] left-[52%] w-[22%] h-[60%] overflow-auto z-10 py-16 mb-2 rounded">
              {previewDocUrl && numPages && previewPageNumber + 1 <= numPages && pageTextContent[previewPageNumber + 1] ? (
                <div className="font-serif text-xs text-gray-800 leading-relaxed">
                  {pageTextContent[previewPageNumber + 1]}
                </div>
              ) : (
                !pdfLoading && !pdfError && previewDocUrl && numPages && previewPageNumber + 1 <= numPages && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="animate-spin h-6 w-6 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Extracting text...</span>
                  </div>
                )
              )}
            </div>
            
            {/* Hidden Document component to load PDF data */}
            {previewDocUrl && !pdfError && (
              <Document
                file={previewDocUrl}
                onLoadSuccess={onDocumentLoadSuccessLarge}
                onLoadError={onDocumentLoadErrorLarge}
                loading={null}
                error={null}
                key={previewDocUrl}
                className="hidden"
              >
                {/* Render a hidden Page component to ensure PDF.js is fully initialized */}
                <Page 
                  pageNumber={previewPageNumber} 
                  width={1} 
                  height={1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="opacity-0 absolute"
                />
              </Document>
            )}
          </div>
        </div>
        
        {/* Fixed pagination controls at bottom - Improved visibility */}
        <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-4 py-3 px-8 bg-black/50 backdrop-blur-md rounded-full shadow-lg text-white z-20 ${
          !isPreviewModalOpen || !numPages || pdfLoading || pdfError ? '' : ''
        }`}>
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={!canGoPrev}
            className="px-6 py-2 border border-white/50 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            aria-label="Previous Pages"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium tabular-nums px-4 text-white">
            {getPageSpreadLabel()}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={!canGoNext}
            className="px-6 py-2 border border-white/50 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            aria-label="Next Pages"
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
"use client";
import { useState, useEffect } from "react";
import { UploadedDoc } from "./InteriorDesign"; // Adjust path if needed
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useRouter } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const isFormattedDoc = (doc: UploadedDoc | null): boolean => {
  if (!doc || !doc.title) return false;
  return /\((classic|minimalist|modern)\)/i.test(doc.title);
};

interface FormattingToolOptionProps {
  isSelected: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  currentDocument: UploadedDoc | null;
  // bookProjectId prop removed
}

export function FormattingToolOption({
  isSelected,
  onChange,
  value,
  currentDocument,
}: FormattingToolOptionProps) {
  const radioId = "formatting-tool";
  const router = useRouter();

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [fetchPreviewError, setFetchPreviewError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [previewPageNumber, setPreviewPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pageTextContent, setPageTextContent] = useState<{ [key: number]: string }>({});
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const [textExtractionInProgress, setTextExtractionInProgress] = useState(false);
  const [localBookProjectId, setLocalBookProjectId] = useState<string | null>(null);

  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1);
    // Attempt to get bookProjectId from localStorage on mount or when isSelected becomes true
    if (isSelected) {
        const storedId = localStorage.getItem('bookProjectId');
        setLocalBookProjectId(storedId);
    } else {
        setLocalBookProjectId(null); // Clear if not selected
    }
  }, [isSelected]); // Re-check localStorage if selection state changes


  useEffect(() => {
    const fetchBookPreview = async () => {
      if (!localBookProjectId) {
        console.warn("Cannot fetch book preview without bookProjectId from localStorage.");
        setFetchPreviewError("Book Project ID not found.");
        setPreviewDocUrl(null);
        setIsFetchingPreview(false);
        return;
      }

      setIsFetchingPreview(true);
      setFetchPreviewError(null);
      setPreviewDocUrl(null);
      setNumPages(null);
      setPreviewPageNumber(1);
      setPdfError(null);
      setPageTextContent({});

      try {
        const response = await fetch(`/api/get-template-preview?bookProjectId=${localBookProjectId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to fetch preview: ${response.statusText}`);
        }

        if (data.book && data.book.bookPdfUrl) {
          setPreviewDocUrl(data.book.bookPdfUrl);
        } else {
          console.warn(`Book PDF URL not found in response for project: ${localBookProjectId}`, data);
          setFetchPreviewError("Formatted PDF not available yet.");
          setPreviewDocUrl(null);
        }

      } catch (error: any) {
        console.error("Error fetching book preview:", error);
        setFetchPreviewError(error.message || "Could not load preview.");
        setPreviewDocUrl(null);
      } finally {
        setIsFetchingPreview(false);
      }
    };

    if (isSelected && localBookProjectId) {
        console.log("Formatting tool selected, attempting to fetch preview for bookProjectId:", localBookProjectId);
        fetchBookPreview();
    } else if (isSelected && !localBookProjectId) {
        // Handle case where option is selected but ID wasn't found initially
        setFetchPreviewError("Book Project ID not found.");
        setPreviewDocUrl(null);
        setIsFetchingPreview(false); // Ensure loading stops
    } else {
        // Clear preview when this option is deselected
        setPreviewDocUrl(null);
        setIsFetchingPreview(false);
        setFetchPreviewError(null);
        setNumPages(null);
        setPreviewPageNumber(1);
        setPdfError(null);
        setPageTextContent({});
    }
    // Depend on isSelected and the retrieved localBookProjectId
  }, [isSelected, localBookProjectId]);


  useEffect(() => {
    if (isPreviewModalOpen && previewDocUrl && !textExtractionInProgress) {
      extractTextContent(previewDocUrl, previewPageNumber);
      if (numPages && previewPageNumber + 1 <= numPages) {
        extractTextContent(previewDocUrl, previewPageNumber + 1);
      }
    }
  }, [isPreviewModalOpen, previewDocUrl, previewPageNumber, numPages, textExtractionInProgress]);


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

      setPageTextContent(prev => ({ ...prev, [pageNum]: textItems }));
    } catch (error) {
      console.error(`Error extracting text from page ${pageNum}:`, error);
    } finally {
      setTextExtractionInProgress(false);
    }
  };


  const onDocumentLoadSuccessSmall = () => {};


  const onDocumentLoadSuccessLarge = ({ numPages: loadedNumPages }: { numPages: number; }) => {
     setNumPages(loadedNumPages);
    if (previewPageNumber > loadedNumPages) {
      setPreviewPageNumber(Math.max(1, loadedNumPages - (loadedNumPages % 2 === 0 ? 1 : 0)));
    } else if (previewPageNumber % 2 === 0 && previewPageNumber > 1) {
      setPreviewPageNumber(previewPageNumber - 1);
    }
    setPdfLoading(false);
    setPdfError(null);

    if (previewDocUrl) {
        const currentPageToExtract = (previewPageNumber > loadedNumPages)
            ? Math.max(1, loadedNumPages - (loadedNumPages % 2 === 0 ? 1 : 0))
            : (previewPageNumber % 2 === 0 && previewPageNumber > 1) ? previewPageNumber - 1 : previewPageNumber;

        extractTextContent(previewDocUrl, currentPageToExtract);
        if (currentPageToExtract + 1 <= loadedNumPages) {
            extractTextContent(previewDocUrl, currentPageToExtract + 1);
        }
    }
  };

  const onDocumentLoadErrorLarge = (error: Error) => {
     console.error("Error loading large PDF preview:", error);
    setPdfError(`Failed to load PDF: ${error.message}. Please check the file or try again.`);
    setPdfLoading(false);
    setNumPages(null);
  };


  const handleOpenPreviewModal = () => {
    if (previewDocUrl) {
      setIsPreviewModalOpen(true);
      setPdfLoading(true);
      setPdfError(null);
    } else {
      console.warn("Preview cannot be opened without a document URL.");
    }
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPdfLoading(false);
  };


  const goToPreviousPage = () => {
     const newPageNum = Math.max(previewPageNumber - 2, 1);
    setPreviewPageNumber(newPageNum);
     if (previewDocUrl) {
      extractTextContent(previewDocUrl, newPageNum);
      if (newPageNum + 1 <= (numPages || 0)) {
        extractTextContent(previewDocUrl, newPageNum + 1);
      }
    }
  };

  const goToNextPage = () => {
    const newPageNum = Math.min(previewPageNumber + 2, numPages || 1);
     const targetPage = (newPageNum >= (numPages || 1) && (numPages || 0) % 2 !== 0)
        ? Math.max(1, newPageNum - 1)
        : newPageNum;
    setPreviewPageNumber(targetPage);
    if (previewDocUrl) {
      extractTextContent(previewDocUrl, targetPage);
      if (targetPage + 1 <= (numPages || 0)) {
        extractTextContent(previewDocUrl, targetPage + 1);
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
    return `Page ${left} / ${numPages}`;
  };

  const canGoPrev = previewPageNumber > 1;
  const canGoNext = numPages !== null && previewPageNumber + 1 < numPages;


  const displayTitle = currentDocument && isFormattedDoc(currentDocument)
    ? currentDocument.title
    : previewDocUrl
    ? "Formatted Preview"
    : null;


  const handleLaunchClick = () => {
    const projectId = localStorage.getItem('bookProjectId');
    if (projectId) {
      router.push(`/format-book?bookProjectId=${projectId}`);
    } else {
      // Handle the case where the ID isn't found, maybe show an alert or redirect differently
      console.error("Book Project ID not found in localStorage for launching formatter.");
      alert("Could not find the Book Project ID. Please ensure you have started a project.");
    }
  };


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
                onClick={previewDocUrl ? handleOpenPreviewModal : undefined}
                className={`aspect-[3/4] w-full max-w-[150px] mx-auto md:mx-0 rounded border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden relative shadow-inner ${
                  previewDocUrl ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}
                  ${isFetchingPreview ? 'animate-pulse' : ''}`
                }
                role={previewDocUrl ? "button" : undefined}
                tabIndex={previewDocUrl ? 0 : -1}
                aria-label={ previewDocUrl ? "Open document preview" : "Document preview area"}
              >
                {isFetchingPreview && (
                   <div className="p-2 text-center text-xs text-gray-500">Loading Preview...</div>
                )}
                {fetchPreviewError && !isFetchingPreview && (
                   <div className="p-2 text-center text-xs text-red-600">{fetchPreviewError}</div>
                )}
                {previewDocUrl && !isFetchingPreview && !fetchPreviewError && (
                  <Document
                    file={previewDocUrl}
                    onLoadSuccess={onDocumentLoadSuccessSmall}
                    loading={ <div className="p-2 text-center text-xs text-gray-500">Loading...</div> }
                    error={ <div className="p-2 text-center text-xs text-red-600">Error</div> }
                    className="flex justify-center items-center w-full h-full"
                    key={previewDocUrl}
                  >
                    <Page
                      pageNumber={1} width={150} renderTextLayer={false} renderAnnotationLayer={false}
                      className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:max-h-full"
                    />
                  </Document>
                )}
                 {!previewDocUrl && !isFetchingPreview && !fetchPreviewError && (
                  <span className="text-gray-500 text-sm text-center px-2">
                     {fetchPreviewError || "No preview available"}
                  </span>
                )}
              </div>
              {displayTitle && !isFetchingPreview && !fetchPreviewError && (
                <p className="mt-1.5 text-xs text-center text-gray-700 truncate md:text-left" title={displayTitle}>
                  {displayTitle}
                </p>
              )}
            </div>
            <div className="md:w-3/4">
              <p className="text-sm text-gray-600 mt-1">
                Works best for books with text and limited images. Format your DOCX file using our online tool.
              </p>
              <div className="mt-2 flex flex-col gap-1">
                 <p className="text-sm text-blue-600">✓ Get Published in 2 days</p>
                <p className="text-sm text-blue-600">✓ Publish Print & eBook</p>
                <p className="text-sm text-blue-600">✓ Publish in India & sell in 150+ countries</p>
              </div>
              <button
                type="button"
                onClick={handleLaunchClick}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                Launch Formatting Tool
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center transition-opacity duration-300 ${
          isPreviewModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
            <h2 className="text-xl font-semibold truncate pr-4">
                {displayTitle ? `Preview: ${displayTitle}` : "Document Preview"}
            </h2>
            <button
                onClick={handleClosePreviewModal}
                className="p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                aria-label="Close preview"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        <div className="w-full h-full flex items-center justify-center px-4 pb-16 pt-20">
            {pdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <div className="text-white text-lg flex items-center gap-2 bg-black/50 p-4 rounded-lg">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading Document...
                    </div>
                </div>
            )}
            <div
                className="relative w-full max-w-5xl h-full max-h-[90vh] bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: "url('/book-mockup.jpg')" }}
                role="document"
                aria-label="Book spread preview"
            >
                {(pdfError || (!previewDocUrl && !pdfLoading && !isFetchingPreview)) && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 text-gray-600 p-4">
                        <span className="text-red-200 bg-red-900/80 max-w-md text-center p-4 rounded-lg text-lg shadow-lg">
                        {pdfError ? pdfError : "No preview document available."}
                        </span>
                    </div>
                )}
                <div className="absolute top-[12%] left-[26%] w-[22%] h-[60%] overflow-auto z-10 py-16 mb-2 rounded select-text pointer-events-auto">
                    {previewDocUrl && pageTextContent[previewPageNumber] && !pdfLoading && !pdfError ? (
                        <div className="font-serif text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {pageTextContent[previewPageNumber]}
                        </div>
                    ) : (
                        !pdfLoading && !pdfError && previewDocUrl && !pageTextContent[previewPageNumber] && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                            <svg className="animate-spin h-4 w-4 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Loading text...</span>
                        </div>
                        )
                    )}
                </div>
                <div className="absolute top-[12%] left-[52%] w-[22%] h-[60%] overflow-auto z-10 py-16 mb-2 rounded select-text pointer-events-auto">
                    {previewDocUrl && numPages && previewPageNumber + 1 <= numPages && pageTextContent[previewPageNumber + 1] && !pdfLoading && !pdfError ? (
                        <div className="font-serif text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {pageTextContent[previewPageNumber + 1]}
                        </div>
                    ) : (
                        !pdfLoading && !pdfError && previewDocUrl && numPages && previewPageNumber + 1 <= numPages && !pageTextContent[previewPageNumber + 1] && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                        <svg className="animate-spin h-4 w-4 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Loading text...</span>
                        </div>
                        )
                    )}
                </div>
                {previewDocUrl && (
                    <Document
                        file={previewDocUrl}
                        onLoadSuccess={onDocumentLoadSuccessLarge}
                        onLoadError={onDocumentLoadErrorLarge}
                        loading={null}
                        error={null}
                        key={previewDocUrl}
                        className="opacity-0 absolute pointer-events-none w-0 h-0"
                    >
                        <Page
                        pageNumber={1}
                        width={1}
                        height={1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="opacity-0 absolute pointer-events-none w-0 h-0"
                        />
                    </Document>
                )}
            </div>
        </div>
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-center gap-4 py-3 px-8 bg-black/60 backdrop-blur-sm rounded-full shadow-lg text-white z-20 transition-opacity ${
           !numPages || pdfLoading || pdfError ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
            <button
                type="button"
                onClick={goToPreviousPage}
                disabled={!canGoPrev}
                className="px-5 py-2 border border-white/40 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                aria-label="Previous Pages"
            >
                ← Prev
            </button>
            <span className="text-sm font-medium tabular-nums px-3 text-white min-w-[120px] text-center">
                {getPageSpreadLabel()}
            </span>
            <button
                type="button"
                onClick={goToNextPage}
                disabled={!canGoNext}
                className="px-5 py-2 border border-white/40 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                aria-label="Next Pages"
            >
                Next →
            </button>
        </div>
      </div>
    </>
  );
}
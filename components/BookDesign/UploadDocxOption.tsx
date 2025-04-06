"use client";
import { Check } from "lucide-react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface UploadedDoc {
  id: string;
  title: string;
  cloudinaryUrl: string;
}

interface UploadDocxOptionProps {
  isSelected: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  file: File | null;
  loading: boolean;
  error: string | null;
  currentDoc: UploadedDoc | null;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => Promise<void>;
  onPreview: (url: string) => void;
  onDocumentLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export function UploadDocxOption({
  isSelected,
  onChange,
  value,
  file,
  loading,
  error,
  currentDoc,
  previewUrl,
  onFileChange,
  onUpload,
  onPreview,
  onDocumentLoadSuccess,
}: UploadDocxOptionProps) {
  const radioId = "pdf-file";
  const fileInputId = "file-input";

  return (
    <div
      className={`rounded-lg border shadow-sm transition-all duration-300 ease-in-out ${
        isSelected
          ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <label
        htmlFor={radioId}
        className="flex cursor-pointer items-center p-4"
      >
        <input
          id={radioId}
          type="radio"
          value={value}
          checked={isSelected}
          onChange={onChange}
          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-3 block text-sm font-medium text-gray-800">
          Upload your professionally formatted .docx file
        </span>
      </label>

      {isSelected && (
        <div className="border-t border-gray-200 px-4 pt-4 pb-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-xs font-medium text-gray-600 mb-1.5">
                Preview
              </p>
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
                    <Page
                      pageNumber={1}
                      width={150}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="[&>canvas]:max-w-full [&>canvas]:h-auto [&>canvas]:max-h-full"
                    />
                  </Document>
                ) : (
                  <div className="text-center text-xs text-gray-500 p-2">
                    {currentDoc ? "Click Preview" : "Upload a file"}
                  </div>
                )}
              </div>

              {currentDoc && (
                <p
                  className="mt-1.5 text-xs text-center text-gray-700 truncate md:text-left"
                  title={currentDoc.title}
                >
                  {currentDoc.title}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">
                Works best for books with many images, tables, or custom
                layouts.
              </p>
              <ul className="mt-2 space-y-1">
                {[
                  "Get Published in ~7 days",
                  "Publish Print book",
                  "Sell globally in 150+ countries",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <Check className="mr-1.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2">
                <label
                  htmlFor={fileInputId}
                  className={`inline-flex items-center justify-center px-4 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>{file ? file.name : "Choose .docx file"}</span>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={onFileChange}
                    className="sr-only"
                    disabled={loading}
                  />
                </label>

                {file && !currentDoc && (
                  <button
                    className="ml-2 inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={onUpload}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Upload & Convert"
                    )}
                  </button>
                )}
                {currentDoc && !loading && (
                  <div className="mt-3 flex justify-between items-center p-2 border border-green-200 bg-green-50 rounded text-sm">
                    <span
                      className="truncate mr-2 text-green-800"
                      title={currentDoc.title}
                    >
                      Ready: {currentDoc.title}.docx
                    </span>
                    <button
                      onClick={() => onPreview(currentDoc.cloudinaryUrl)}
                      className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 flex-shrink-0"
                    >
                      Preview
                    </button>
                  </div>
                )}
                {error && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                    <span className="font-medium">Error:</span> {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
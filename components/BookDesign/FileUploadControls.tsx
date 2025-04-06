"use client";
import { Check } from "lucide-react";

interface UploadedDoc {
  id: string;
  title: string;
  cloudinaryUrl: string;
}

interface FileUploadControlsProps {
  file: File | null;
  loading: boolean;
  error: string | null;
  currentDoc: UploadedDoc | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => Promise<void>;
  onPreview: (url: string) => void;
}

export function FileUploadControls({
  file,
  loading,
  error,
  currentDoc,
  onFileChange,
  onUpload,
  onPreview,
}: FileUploadControlsProps) {
  const fileInputId = "file-input";

  return (
    <>
      <p className="text-sm text-gray-600">
        Works best for books with many images, tables, or custom layouts.
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
            // Add key={file?.name || 'empty'} if you need to force re-render on file change/clear
            // or manage reset via parent component setting file to null
          />
        </label>

        {file && !currentDoc && ( // Show upload button only if a file is selected *and* not yet uploaded/processed
          <button
            className="ml-2 inline-flex items-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={onUpload}
            disabled={loading} // Disable while loading or if no file
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

        {/* Display status after successful upload */}
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

        {/* Display error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            <span className="font-medium">Error:</span> {error}
          </p>
        )}
      </div>
    </>
  );
}
'use client'

import { useState } from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";


interface UploadedDoc {
  id: string      
  title: string
  cloudinaryUrl: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDoc, setCurrentDoc] = useState<UploadedDoc | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setPreviewUrl(null);
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const handleUpload = async () => {
    if (!file) return;

    const originalFileName = file.name;
    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      const responseData = await res.json();

      if (!res.ok) {
        const errorPayload = responseData as { error?: string; details?: string };
        throw new Error(errorPayload?.error || `Failed to upload: ${res.statusText}`);
      }

      if (typeof responseData !== 'string') {
          throw new Error("Received invalid data from the server.");
      }

      const cloudinaryUrl = responseData;
      const title = originalFileName?.replace(/\.docx$/i, '') || 'Untitled Book';
      
      setCurrentDoc({
        id: cloudinaryUrl,
        title: title,
        cloudinaryUrl: cloudinaryUrl,
      });

      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
      if (fileInput) {
          fileInput.value = '';
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setNumPages(null)
    setPageNumber(1)
  }

  return (
    <div className="p-6 max-w-4xl text-black mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Upload DOCX</h2>
        <div className="mb-4">
          <input
            id="file-input"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleUpload}
          disabled={!file || loading}
          aria-busy={loading}
        >
          {loading ? 'Uploading...' : 'Upload & Convert to PDF'}
        </button>

        {error && (
          <p className="mt-4 text-red-600 bg-red-100 border border-red-400 p-3 rounded">
            Error: {error}
          </p>
        )}

        {currentDoc && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Current Book</h3>
            <div className="flex justify-between items-center p-2 border rounded">
              <span className="truncate mr-2" title={currentDoc.title}>{currentDoc.title}</span>
              <button
                onClick={() => handlePreview(currentDoc.cloudinaryUrl)}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Preview
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        {previewUrl ? (
          <div className="border rounded p-4">
            <div className="mb-4 flex justify-center">
              <Document
                file={previewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="pdf-container"
                loading={<div className="text-center">Loading PDF...</div>}
                error={<div className="text-center text-red-500">Failed to load PDF</div>}
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={200}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div className="text-center">Loading page...</div>}
                />
              </Document>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <button
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="mr-2 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
                  disabled={!!(numPages && pageNumber >= numPages)}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <p className="text-sm">
                Page {pageNumber} of {numPages || '--'}
              </p>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Close Preview
              </button>
            </div>
          </div>
        ) : (
          <div className="border rounded h-[300px] flex items-center justify-center text-gray-500 bg-gray-50">
            <p>Click "Preview" on the uploaded book to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
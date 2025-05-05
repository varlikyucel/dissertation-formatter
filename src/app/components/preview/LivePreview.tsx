"use client";

import { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDocumentStore } from "@/lib/store";

// Set pdfjs worker source - make sure it matches the version we're using
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface LivePreviewProps {
  url: string | null;
}

const LivePreview = ({ url }: LivePreviewProps) => {
  const { isLoading, error } = useDocumentStore();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Reset page number when URL changes
  useEffect(() => {
    setPageNumber(1);
  }, [url]);

  // Memoize the options object to avoid unnecessary re-renders
  const documentOptions = useMemo(
    () => ({
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.0.279/cmaps/",
      cMapPacked: true,
    }),
    []
  );

  // Function to handle successful PDF loading
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Functions to handle page navigation
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Compiling your document...</p>
          <p className="text-sm text-gray-500 mt-2">
            This might take a moment as we run LaTeX on your content.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center overflow-auto">
        <div className="text-center text-red-500 max-w-2xl p-4">
          <h3 className="text-lg font-semibold mb-2">
            Error Compiling Document
          </h3>
          <pre className="text-left bg-red-50 p-4 rounded border border-red-200 overflow-auto text-sm whitespace-pre-wrap">
            {error}
          </pre>
          <p className="text-sm mt-4">
            Please check your LaTeX syntax and try again.
          </p>
          <div className="mt-4 text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
            <p className="font-semibold">Troubleshooting tips:</p>
            <ul className="list-disc text-left pl-5 mt-2">
              <li>
                Make sure MiKTeX is properly installed and all required packages
                are downloaded
              </li>
              <li>Check for syntax errors in your LaTeX content</li>
              <li>
                Try using the Test Compile button to verify LaTeX is working
                correctly
              </li>
              <li>Run the Diagnostics tool to check your LaTeX installation</li>
              <li>Try manually running pdflatex from a command prompt</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 max-w-lg">
          <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
          <p>
            Click the &quot;Compile&quot; button in the toolbar to generate a
            PDF preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* PDF Controls */}
      <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded">
        <div>
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`px-3 py-1 rounded ${
              pageNumber <= 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={numPages !== null && pageNumber >= numPages}
            className={`px-3 py-1 rounded ml-2 ${
              numPages !== null && pageNumber >= numPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>

        <div className="text-center">
          {numPages && (
            <p>
              Page {pageNumber} of {numPages}
            </p>
          )}
        </div>

        <a
          href={url}
          download="dissertation.pdf"
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error("Error loading PDF:", error)}
          options={documentOptions}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
};

export default LivePreview;

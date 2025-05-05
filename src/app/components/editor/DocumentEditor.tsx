"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useDocumentStore } from "@/lib/store";
import BlockList from "../blocks/BlockList";
import BlockEditor from "../../components/editor/BlockEditor";
import ReferenceManager from "../citation/ReferenceManager";
import LivePreview from "../preview/LivePreview";
import {
  Block,
  BlockType,
  TitlePageBlock,
  ChapterBlock,
  SectionBlock,
  FigureBlock,
  TableBlock,
  SummaryBlock,
  AppendicesBlock,
  CvBlock,
} from "@/lib/types";
import axios from "axios";

const DocumentEditor = () => {
  const {
    project,
    selectedBlockId,
    previewUrl,
    addBlock,
    reorderBlocks,
    selectBlock,
    setPreviewUrl,
    setLoading,
    setError,
    saveProject,
  } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<
    "blocks" | "references" | "preview"
  >("blocks");

  const [latexStatus, setLatexStatus] = useState<
    "unchecked" | "checking" | "found" | "not-found"
  >("unchecked");

  const [testCompileStatus, setTestCompileStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  const [latexSource, setLatexSource] = useState<string | null>(null);
  const [latexSourceLoading, setLatexSourceLoading] = useState(false);

  const [overleafLoading, setOverleafLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      // Redirect to project selection or creation if no project is loaded
      return;
    }
  }, [project]);

  // Handle drag-and-drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    reorderBlocks(sourceIndex, destinationIndex);
  };

  // Handle adding a new block
  const handleAddBlock = (type: BlockType) => {
    // Create appropriate block data based on type
    if (type === "title-page") {
      const blockData: Partial<TitlePageBlock> = {
        title: "My Dissertation",
        author: "Author Name",
        department: "Department of Science",
        university: "University Name",
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
        // Additional fields for ITU template
        studentId: "",
        program: "",
        supervisor: "",
        degree: "Master of Science",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "chapter") {
      const blockData: Partial<ChapterBlock> = {
        title: "New Chapter",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "section") {
      const blockData: Partial<SectionBlock> = {
        title: "New Section",
        level: 1,
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "figure") {
      const blockData: Partial<FigureBlock> = {
        caption: "Figure Caption",
        label: "fig:label",
        imagePath: "",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "table") {
      const blockData: Partial<TableBlock> = {
        caption: "Table Caption",
        label: "tab:label",
        data: [
          ["Header 1", "Header 2"],
          ["Data 1", "Data 2"],
        ],
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "summary") {
      const blockData: Partial<SummaryBlock> = {
        content: "Enter your thesis summary here (required for ITU template).",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "appendices") {
      const blockData: Partial<AppendicesBlock> = {
        content: "Enter your appendices content here.",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else if (type === "cv") {
      const blockData: Partial<CvBlock> = {
        content: "Enter your curriculum vitae here.",
      };
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    } else {
      // Abstract and bibliography don't need special fields
      const blockData: Partial<Block> = {};
      const newBlockId = addBlock(blockData, type);
      selectBlock(newBlockId);
    }
  };

  // Handle compiling the document to PDF
  const handleCompile = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      // Save project first
      await saveProject();

      // Compile the document
      const response = await axios.post(
        "/api/compile",
        { project },
        {
          responseType: "blob",
        }
      );

      // Create a URL for the PDF blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      setPreviewUrl(url);
      setActiveTab("preview");
    } catch (error: any) {
      console.error("Compilation error:", error);

      // Try to get detailed error info from response
      if (error.response?.data) {
        try {
          // Convert blob to text to get error details
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              let errorMessage = errorData.error;

              if (errorData.details) {
                errorMessage += `\n\nDetails: ${errorData.details}`;
              }

              if (errorData.logExcerpt) {
                errorMessage += `\n\nLog excerpt:\n${errorData.logExcerpt}`;
              }

              setError(errorMessage);
              console.log("Detailed error:", errorData);
            } catch (parseError) {
              console.error("Error parsing error details:", parseError);
              setError("Failed to parse error details");
            }
          };
          reader.readAsText(error.response.data);
        } catch (e) {
          console.error("Error reading error response:", e);
          setError("Failed to compile document. Check console for details.");
        }
      } else {
        setError(error.message || "Failed to compile document");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle exporting the project
  const handleExport = async () => {
    if (!project) return;

    setLoading(true);

    try {
      // Save project first
      await saveProject();

      // Export the project as a ZIP file
      const response = await axios.post(
        "/api/export",
        { project },
        {
          responseType: "blob",
        }
      );

      // Create a download link for the ZIP
      const zipBlob = new Blob([response.data], { type: "application/zip" });
      const url = URL.createObjectURL(zipBlob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.title}.zip`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export project");
    } finally {
      setLoading(false);
    }
  };

  // Handle checking LaTeX installation
  const checkLatexInstallation = async () => {
    setLatexStatus("checking");
    setError(null);

    try {
      const response = await axios.get("/api/check-latex");
      if (response.data.installed) {
        setLatexStatus("found");
      } else {
        setLatexStatus("not-found");
        setError(
          "LaTeX (pdflatex) is not installed or not in PATH. Please install MiKTeX and restart your computer before trying again."
        );
      }
    } catch (error) {
      console.error("Error checking LaTeX:", error);
      setLatexStatus("not-found");
      setError(
        "Failed to check LaTeX installation. Please make sure MiKTeX is installed properly."
      );
    }
  };

  // Handle test compilation of a minimal LaTeX document
  const handleTestCompile = async () => {
    setTestCompileStatus("loading");
    setTestError(null);

    try {
      const response = await axios.get("/api/test-compile", {
        responseType: "blob",
      });

      // Create a URL for the PDF blob
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);

      setPreviewUrl(url);
      setActiveTab("preview");
      setTestCompileStatus("success");
    } catch (error: any) {
      console.error("Test compilation error:", error);
      setTestCompileStatus("error");

      // Try to get detailed error info from response
      if (error.response?.data) {
        try {
          // Convert blob to text to get error details
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = reader.result as string;
              const errorData = JSON.parse(errorText);
              setTestError(
                errorData.details || "Failed to compile test document"
              );
              console.log("Detailed error:", errorData);
            } catch (parseError) {
              console.error("Error parsing error details:", parseError);
              setTestError("Failed to parse error details");
            }
          };
          reader.readAsText(error.response.data);
        } catch (e) {
          console.error("Error reading error blob:", e);
          setTestError("Failed to read error details");
        }
      } else {
        setTestError(error.message || "Failed to compile test document");
      }
    }
  };

  // Run detailed LaTeX diagnostics
  const runLatexDiagnostics = async () => {
    setDiagnosticsLoading(true);
    setDiagnostics(null);

    try {
      const response = await axios.get("/api/latex-debug");
      setDiagnostics(response.data);
    } catch (error) {
      console.error("Diagnostics error:", error);
      setTestError("Failed to run LaTeX diagnostics");
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  // View the generated LaTeX source code
  const viewLatexSource = async () => {
    if (!project) return;

    setLatexSourceLoading(true);

    try {
      const response = await axios.post("/api/preview-latex", { project });
      setLatexSource(response.data.latex);
    } catch (error) {
      console.error("Error fetching LaTeX source:", error);
      setError("Failed to generate LaTeX source");
    } finally {
      setLatexSourceLoading(false);
    }
  };

  // Handle exporting the project to Overleaf
  const handleOpenInOverleaf = async () => {
    if (!project) return;

    setOverleafLoading(true);
    setError(null);

    try {
      // Save project first (optional, but good practice)
      await saveProject();

      // Get the Overleaf data URL
      console.log("Requesting Overleaf export data...");
      const response = await axios.post("/api/overleaf", { project });
      const { dataUrl } = response.data;

      if (!dataUrl) {
        throw new Error("No data URL received from Overleaf API");
      }

      console.log("Received Overleaf data URL (length):", dataUrl.length);

      // Construct the final Overleaf URL
      // IMPORTANT: The dataUrl itself needs to be URL encoded
      // const overleafUrl = `https://www.overleaf.com/docs?snip_uri=${encodeURIComponent(
      //   dataUrl
      // )}`;

      // Open in new tab
      // console.log("Opening Overleaf...");
      // window.open(overleafUrl, "_blank");

      // --- NEW: Use POST request via a temporary form ---
      console.log("Creating temporary form for Overleaf POST...");
      const form = document.createElement("form");
      form.action = "https://www.overleaf.com/docs";
      form.method = "post";
      form.target = "_blank"; // Open Overleaf in a new tab
      form.style.display = "none"; // Hide the form

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "snip_uri";
      input.value = dataUrl; // Send the base64 data URL
      form.appendChild(input);

      // Add optional parameters (example: set engine)
      // const engineInput = document.createElement('input');
      // engineInput.type = 'hidden';
      // engineInput.name = 'engine';
      // engineInput.value = 'pdflatex'; // Or xelatex, lualatex
      // form.appendChild(engineInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form); // Clean up the form
      console.log("Submitted form to Overleaf.");
      // --- END NEW ---
    } catch (error: any) {
      console.error("Overleaf export error:", error);
      let errorMessage = "Failed to generate Overleaf link.";
      if (error.response?.data?.details) {
        errorMessage += ` Details: ${error.response.data.details}`;
      } else if (error.message) {
        errorMessage += ` Details: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setOverleafLoading(false);
    }
  };

  if (!project) {
    return <div className="p-8 text-center">No project loaded</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header/Toolbar */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => {
                // Clear the project from store
                useDocumentStore.setState({ project: null });
              }}
              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 mr-4"
              title="Return to home page"
            >
              Home
            </button>
            <h1 className="text-xl font-bold">{project.title}</h1>
          </div>
          <div className="flex space-x-2 flex-wrap">
            <button
              onClick={checkLatexInstallation}
              className={`px-4 py-2 rounded ${
                latexStatus === "found"
                  ? "bg-green-600 hover:bg-green-700"
                  : latexStatus === "not-found"
                  ? "bg-red-600 hover:bg-red-700"
                  : latexStatus === "checking"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
              disabled={latexStatus === "checking"}
            >
              {latexStatus === "checking"
                ? "Checking LaTeX..."
                : latexStatus === "found"
                ? "LaTeX Installed"
                : latexStatus === "not-found"
                ? "LaTeX Not Found"
                : "Check LaTeX"}
            </button>
            <button
              onClick={handleTestCompile}
              className={`px-4 py-2 rounded ${
                testCompileStatus === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : testCompileStatus === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : testCompileStatus === "loading"
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
              disabled={testCompileStatus === "loading"}
            >
              {testCompileStatus === "loading"
                ? "Testing..."
                : testCompileStatus === "success"
                ? "Test Passed"
                : testCompileStatus === "error"
                ? "Test Failed"
                : "Test Compile"}
            </button>
            <button
              onClick={runLatexDiagnostics}
              className={`px-4 py-2 rounded ${
                diagnosticsLoading
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              disabled={diagnosticsLoading}
            >
              {diagnosticsLoading ? "Running..." : "Diagnostics"}
            </button>
            <button
              onClick={viewLatexSource}
              className={`px-4 py-2 rounded ${
                latexSourceLoading
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
              disabled={latexSourceLoading}
            >
              {latexSourceLoading ? "Loading..." : "View LaTeX"}
            </button>
            <button
              onClick={() => saveProject()}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCompile}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Compile PDF
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
            >
              Export ZIP
            </button>
            <button
              onClick={handleOpenInOverleaf}
              className={`px-4 py-2 rounded ${
                overleafLoading
                  ? "bg-yellow-600"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
              disabled={overleafLoading}
            >
              {overleafLoading ? "Generating..." : "Open in Overleaf"}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("blocks")}
              className={`px-4 py-2 ${
                activeTab === "blocks"
                  ? "bg-white border-t border-l border-r"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Blocks
            </button>
            <button
              onClick={() => setActiveTab("references")}
              className={`px-4 py-2 ${
                activeTab === "references"
                  ? "bg-white border-t border-l border-r"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              References
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 ${
                activeTab === "preview"
                  ? "bg-white border-t border-l border-r"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {testError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
            <p className="font-bold">Test Compilation Error</p>
            <p className="whitespace-pre-wrap font-mono text-sm">{testError}</p>
            <p className="mt-2 text-sm">
              <strong>Troubleshooting tips:</strong>
            </p>
            <ul className="list-disc ml-5 text-sm">
              <li>Make sure MiKTeX is properly installed</li>
              <li>Verify that pdflatex is in your system PATH</li>
              <li>Try restarting your computer after installing MiKTeX</li>
              <li>
                Check if MiKTeX package manager is working (not blocked by
                antivirus)
              </li>
              <li>Try running pdflatex manually in a command prompt</li>
            </ul>
          </div>
        )}

        {latexSource && (
          <div className="bg-white border border-gray-300 p-4 rounded m-4 overflow-auto max-h-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Generated LaTeX Source</h3>
              <button
                onClick={() => setLatexSource(null)}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
              >
                Close
              </button>
            </div>
            <pre className="text-sm font-mono bg-gray-50 p-4 rounded overflow-auto">
              {latexSource}
            </pre>
          </div>
        )}

        {diagnostics && (
          <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded m-4">
            <div className="flex justify-between items-center">
              <p className="font-bold">LaTeX Environment Diagnostics</p>
              <button
                onClick={() => setDiagnostics(null)}
                className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 text-xs"
              >
                Close
              </button>
            </div>
            <div className="mt-2 overflow-auto max-h-96">
              <div className="mb-3">
                <p className="font-semibold">System Information:</p>
                <p className="text-sm">
                  OS: {diagnostics.os.platform} {diagnostics.os.release}
                </p>
                <p className="text-sm">Architecture: {diagnostics.os.arch}</p>
                <p className="text-sm">Node: {diagnostics.node.version}</p>
              </div>

              <div className="mb-3">
                <p className="font-semibold">LaTeX Installation:</p>
                <p className="text-sm">
                  Installed: {diagnostics.latex.installed ? "Yes" : "No"}
                </p>
                {diagnostics.latex.path && (
                  <p className="text-sm">Path: {diagnostics.latex.path}</p>
                )}
                {diagnostics.latex.version && (
                  <p className="text-sm whitespace-pre-wrap">
                    Version: {diagnostics.latex.version.split("\n")[0]}
                  </p>
                )}
                {diagnostics.latex.error && (
                  <p className="text-sm text-red-700">
                    Error: {diagnostics.latex.error}
                  </p>
                )}
              </div>

              {process.platform === "win32" && (
                <div className="mb-3">
                  <p className="font-semibold">MiKTeX:</p>
                  <p className="text-sm">
                    Detected: {diagnostics.miktex.detected ? "Yes" : "No"}
                  </p>
                  {diagnostics.miktex.path && (
                    <p className="text-sm">Path: {diagnostics.miktex.path}</p>
                  )}
                  {diagnostics.miktex.version && (
                    <p className="text-sm whitespace-pre-wrap">
                      Version: {diagnostics.miktex.version.split("\n")[0]}
                    </p>
                  )}
                  {diagnostics.miktex.error && (
                    <p className="text-sm text-red-700">
                      Error: {diagnostics.miktex.error}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-3">
                <p className="font-semibold">Verification Steps:</p>
                <ul className="list-disc ml-5 text-sm">
                  {diagnostics.verificationSteps.map(
                    (step: string, i: number) => (
                      <li key={i}>{step}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blocks" && (
          <div className="container mx-auto h-full flex">
            {/* Sidebar with block list */}
            <div className="w-1/3 border-r overflow-y-auto p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Add Block</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddBlock("title-page")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Title Page
                  </button>
                  <button
                    onClick={() => handleAddBlock("abstract")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Abstract
                  </button>
                  <button
                    onClick={() => handleAddBlock("chapter")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Chapter
                  </button>
                  <button
                    onClick={() => handleAddBlock("section")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Section
                  </button>
                  <button
                    onClick={() => handleAddBlock("figure")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Figure
                  </button>
                  <button
                    onClick={() => handleAddBlock("table")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Table
                  </button>
                  <button
                    onClick={() => handleAddBlock("bibliography")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Bibliography
                  </button>
                  <button
                    onClick={() => handleAddBlock("summary")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => handleAddBlock("appendices")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Appendices
                  </button>
                  <button
                    onClick={() => handleAddBlock("cv")}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    CV
                  </button>
                </div>
              </div>

              <h2 className="text-lg font-semibold mb-2">Document Structure</h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <BlockList />
              </DragDropContext>
            </div>

            {/* Block editor */}
            <div className="w-2/3 p-4 overflow-y-auto">
              {selectedBlockId ? (
                <BlockEditor blockId={selectedBlockId} />
              ) : (
                <div className="text-center p-8 text-gray-500">
                  Select a block to edit or add a new block
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "references" && (
          <div className="container mx-auto p-4">
            <ReferenceManager />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="container mx-auto p-4 h-full">
            <LivePreview url={previewUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentEditor;

"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useDocumentStore } from "@/lib/store";
import BlockList from "../blocks/BlockList";
import BlockEditor from "../editor/BlockEditor";
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
  AppendicesBlock,
  CvBlock,
  AVAILABLE_TEMPLATES,
  DedicationBlock,
  ListOfFiguresBlock,
  ListOfTablesBlock,
  ListOfAbbreviationsBlock,
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
    isLoading,
    error,
    resetStore,
  } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<
    "blocks" | "references" | "preview"
  >("blocks");

  const [latexSource, setLatexSource] = useState<string | null>(null);
  const [latexSourceLoading, setLatexSourceLoading] = useState(false);
  const [overleafLoading, setOverleafLoading] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Get current template config
  const templateConfig = project?.template
    ? AVAILABLE_TEMPLATES.find((t) => t.id === project.template)
    : null;

  // Group block types for the add menu
  const blockMenuCategories = [
    {
      name: "Structure",
      types: [
        "title-page",
        "abstract",
        "acknowledgments",
        "dedication",
        "chapter",
        "section",
      ],
    },
    {
      name: "Content",
      types: ["paragraph", "figure", "table", "code", "equation"],
    },
    {
      name: "Lists",
      types: [
        "list-of-figures",
        "list-of-tables",
        "list-of-abbreviations",
        "glossary",
      ],
    },
    {
      name: "Back Matter",
      types: ["bibliography", "appendix", "appendices", "cv"],
    },
  ];

  useEffect(() => {
    if (!project) {
      return;
    }
  }, [project]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Get the block being moved
    if (project) {
      const movedBlock = project.blocks[sourceIndex];
      const isSectionMove = movedBlock.type === "section";

      // Store the current state to detect hierarchy changes
      const currentLevel = isSectionMove
        ? (movedBlock as SectionBlock).level
        : null;
      const currentParentId = isSectionMove
        ? (movedBlock as SectionBlock).parentId
        : null;

      // Perform the reordering
      reorderBlocks(sourceIndex, destinationIndex);

      // If it's a section, it might have changed its hierarchy
      if (isSectionMove) {
        setTimeout(() => {
          // Now check if there were hierarchy changes (the store update happens asynchronously)
          if (project.blocks) {
            const updatedBlock = project.blocks.find(
              (b) => b.id === movedBlock.id
            );
            if (updatedBlock && updatedBlock.type === "section") {
              const newLevel = (updatedBlock as SectionBlock).level;
              const newParentId = (updatedBlock as SectionBlock).parentId;

              // Check if hierarchy changed
              if (
                newLevel !== currentLevel ||
                newParentId !== currentParentId
              ) {
                // Show a notification about the hierarchy adjustment
                setError(
                  "Section hierarchy was adjusted to maintain proper document structure"
                );

                // Auto-clear the message after 3 seconds
                setTimeout(() => {
                  setError(null);
                }, 3000);
              }
            }
          }
        }, 100); // Small delay to ensure store is updated
      }
    } else {
      // Just reorder if no project is available
      reorderBlocks(sourceIndex, destinationIndex);
    }
  };

  const handleAddBlock = (type: BlockType) => {
    // Close the add menu
    setAddMenuOpen(false);

    switch (type) {
      case "title-page": {
        const blockData: Partial<TitlePageBlock> = {
          title: "My Dissertation",
          author: {
            name: "Author Name",
            studentId: "",
          },
          department: "Department of Science",
          program: "",
          submissionDate: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          }),
          defenseDate: "",
          advisor: {
            title: "Prof. Dr.",
            name: "Advisor Name",
            institution: "University Name",
          },
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "dedication": {
        const blockData: Partial<DedicationBlock> = {
          content: "Enter your dedication here.",
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "chapter": {
        const blockData: Partial<ChapterBlock> = {
          title: "New Chapter",
          content: "Enter your chapter content here.",
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "section": {
        const blockData: Partial<SectionBlock> = {
          title: "New Section",
          level: 2,
          content: "Enter your section content here.",
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "figure": {
        // Find potential parent chapters/sections like we do for paragraphs
        const potentialParents = project?.blocks.filter(
          (b) => b.type === "chapter" || b.type === "section"
        );

        // Find the selected block if it's a section or chapter
        const selectedParent = selectedBlockId
          ? project?.blocks.find(
              (b) =>
                b.id === selectedBlockId &&
                (b.type === "chapter" || b.type === "section")
            )
          : null;

        // If a section/chapter is selected, use it as parent
        const parentId =
          selectedParent?.id ||
          (potentialParents && potentialParents.length > 0
            ? potentialParents[potentialParents.length - 1].id
            : undefined);

        const blockData: Partial<FigureBlock> = {
          caption: "Figure Caption",
          label: "fig:example",
          imagePath: "",
          content: "Description of the figure.",
          parentId,
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "table": {
        const potentialParents = project?.blocks.filter(
          (b) => b.type === "chapter" || b.type === "section"
        );

        const selectedParent = selectedBlockId
          ? project?.blocks.find(
              (b) =>
                b.id === selectedBlockId &&
                (b.type === "chapter" || b.type === "section")
            )
          : null;

        const parentId =
          selectedParent?.id ||
          (potentialParents && potentialParents.length > 0
            ? potentialParents[potentialParents.length - 1].id
            : undefined);

        const blockData: Partial<TableBlock> = {
          caption: "Table Caption",
          label: "tab:example",
          data: [
            ["Header 1", "Header 2", "Header 3"],
            ["Cell 1-1", "Cell 1-2", "Cell 1-3"],
            ["Cell 2-1", "Cell 2-2", "Cell 2-3"],
          ],
          content: "Description of the table.",
          parentId,
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "appendices": {
        const blockData: Partial<AppendicesBlock> = {
          // Remove the 'title' property which doesn't exist in AppendicesBlock type
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "cv": {
        const blockData: Partial<CvBlock> = {
          content: "Enter your CV here.",
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "list-of-figures": {
        const blockData: Partial<ListOfFiguresBlock> = {};
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "list-of-tables": {
        const blockData: Partial<ListOfTablesBlock> = {};
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      case "list-of-abbreviations": {
        const blockData: Partial<ListOfAbbreviationsBlock> = {
          // Fix the property name to match the type definition
          abbreviations: [
            { term: "e.g.", definition: "For example" },
            { term: "i.e.", definition: "That is" },
          ],
        };
        const newBlockId = addBlock(blockData, type);
        selectBlock(newBlockId);
        break;
      }

      default: {
        // Add a generic block
        const newBlockId = addBlock({}, type);
        selectBlock(newBlockId);
      }
    }
  };

  const handleExport = async () => {
    if (!project) return;

    try {
      setLoading(true);

      // First save the project to make sure we have the latest version
      await saveProject();

      const response = await axios.post(
        "/api/export",
        { projectId: project.id },
        {
          responseType: "blob",
        }
      );

      // Convert response to a blob URL
      const blob = new Blob([response.data], {
        type: "application/zip",
      });
      const url = window.URL.createObjectURL(blob);

      // Create a link element to download the file
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${project.title || "document"}.zip`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export the document. Please try again.");
      setLoading(false);
    }
  };

  const viewLatexSource = async () => {
    if (!project) return;

    try {
      setLatexSourceLoading(true);
      const response = await axios.post("/api/latex", {
        projectId: project.id,
      });

      setLatexSource(response.data.source);
      setLatexSourceLoading(false);
    } catch (error) {
      console.error("LaTeX error:", error);
      setError("Failed to generate LaTeX source. Please try again.");
      setLatexSourceLoading(false);
    }
  };

  const handleOpenInOverleaf = async () => {
    if (!project) return;

    try {
      setOverleafLoading(true);

      // Save the project first
      await saveProject();

      // Send the full project to the overleaf API
      const overleafResponse = await axios.post("/api/overleaf", {
        project: project,
      });

      // Create a hidden form to submit to Overleaf
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://www.overleaf.com/docs";
      form.target = "_blank";
      form.style.display = "none";

      // Add the snip_uri as a hidden field
      const snipUriField = document.createElement("input");
      snipUriField.type = "hidden";
      snipUriField.name = "snip_uri";
      snipUriField.value = overleafResponse.data.snip_uri;
      form.appendChild(snipUriField);

      // Optionally add project name if you want to set the initial name in Overleaf
      if (overleafResponse.data.projectName) {
        const nameField = document.createElement("input");
        nameField.type = "hidden";
        nameField.name = "snip_name";
        nameField.value = overleafResponse.data.projectName;
        form.appendChild(nameField);
      }

      // Append the form to the body and submit it
      document.body.appendChild(form);
      form.submit();

      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
      }, 100);

      setOverleafLoading(false);
    } catch (error) {
      console.error("Overleaf API error:", error);
      setError("Failed to open in Overleaf. Please try again.");
      setOverleafLoading(false);
    }
  };

  // Helper function to check if a block type is available in the current template
  const isBlockTypeAvailable = (type: BlockType): boolean => {
    if (!templateConfig) return true; // If no template, allow all blocks
    if (!templateConfig.requiredBlocks && !templateConfig.defaultBlocks)
      return true; // If no restrictions, allow all

    // Check if it's in the requiredBlocks or defaultBlocks arrays
    return (
      templateConfig.requiredBlocks?.includes(type as any) ||
      false ||
      templateConfig.defaultBlocks?.includes(type as any) ||
      false
    );
  };

  // Helper function to get a friendly name for a block type
  const getBlockTypeName = (type: BlockType): string => {
    const nameMap: Record<string, string> = {
      "title-page": "Title Page",
      abstract: "Abstract",
      acknowledgments: "Acknowledgments",
      dedication: "Dedication",
      chapter: "Chapter",
      section: "Section",
      paragraph: "Paragraph",
      figure: "Figure",
      table: "Table",
      code: "Code Block",
      equation: "Equation",
      "list-of-figures": "List of Figures",
      "list-of-tables": "List of Tables",
      "list-of-abbreviations": "List of Abbreviations",
      glossary: "Glossary",
      bibliography: "Bibliography",
      appendix: "Appendix",
      appendices: "Appendices",
      cv: "Curriculum Vitae",
    };

    return nameMap[type] || type;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top navigation bar */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center shadow-md">
        <button
          onClick={() => {
            resetStore();
            window.location.href = "/";
          }}
          className="mr-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Home
        </button>
        <h1 className="text-lg font-medium flex-1">
          {project?.title || "Document"}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={saveProject}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center text-sm"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center text-sm"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>

          <button
            onClick={viewLatexSource}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center text-sm"
            disabled={latexSourceLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            {latexSourceLoading ? "Loading..." : "View LaTeX"}
          </button>

          <button
            onClick={handleOpenInOverleaf}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center text-sm"
            disabled={overleafLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            {overleafLoading ? "Loading..." : "Open in Overleaf"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-2 text-red-600 bg-red-50 px-4 py-2 rounded-md border border-red-200 text-sm flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Block list & controls */}
        <div className="w-64 bg-gray-50 flex flex-col border-r border-gray-200">
          {/* Navigation tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-2.5 text-sm font-medium ${
                activeTab === "blocks"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("blocks")}
            >
              Blocks
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium ${
                activeTab === "references"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("references")}
            >
              References
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium ${
                activeTab === "preview"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "blocks" && (
              <div className="p-3">
                {/* Add Block button with dropdown */}
                <div className="relative mb-3">
                  <button
                    onClick={() => setAddMenuOpen(!addMenuOpen)}
                    className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center text-sm shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Block
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={addMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  </button>

                  {addMenuOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
                      {blockMenuCategories.map((category) => (
                        <div key={category.name} className="p-2">
                          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-1">
                            {category.name}
                          </h3>
                          <div>
                            {category.types.map((type) => {
                              // Only show block types that are available in the current template
                              const available = isBlockTypeAvailable(
                                type as BlockType
                              );

                              return available ? (
                                <button
                                  key={type}
                                  onClick={() =>
                                    handleAddBlock(type as BlockType)
                                  }
                                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md transition-colors flex items-center"
                                >
                                  {getBlockTypeName(type as BlockType)}
                                </button>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Block list */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <BlockList />
                </DragDropContext>
              </div>
            )}

            {activeTab === "references" && <ReferenceManager />}

            {activeTab === "preview" && (
              <div className="h-full">
                <LivePreview url={previewUrl} />
              </div>
            )}
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex-1 overflow-auto bg-white">
          {selectedBlockId ? (
            <BlockEditor blockId={selectedBlockId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="bg-gray-50 rounded-lg p-10 flex flex-col items-center max-w-md text-center shadow-sm border border-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  No Block Selected
                </h2>
                <p className="text-sm text-gray-500">
                  Select a block from the list to edit or add a new block using
                  the button above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LaTeX Source Modal */}
      {latexSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                LaTeX Source
              </h2>
              <button
                onClick={() => setLatexSource(null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="bg-gray-50 p-4 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-800 border border-gray-200">
                {latexSource}
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end bg-gray-50">
              <button
                onClick={() => setLatexSource(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;

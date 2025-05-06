"use client";

import { useState, useEffect } from "react";
import { useDocumentStore } from "@/lib/store";
import {
  Block,
  BlockType,
  TitlePageBlock,
  ChapterBlock,
  SectionBlock,
  FigureBlock,
  TableBlock,
  AbstractBlock,
  ListOfAbbreviationsBlock,
  ListOfSymbolsBlock,
  TableOfContentsBlock,
  JuryApprovalBlock,
  TurkishTitlePageBlock,
  TurkishAbstractBlock,
  SubfigureBlock,
  LandscapeFigureBlock,
  LandscapeTableBlock,
  ContinuedTableBlock,
  InlineEquationBlock,
  DisplayEquationBlock,
  MultiLineEquationBlock,
  AppendicesBlock,
  CvBlock,
  DeclarationBlock,
  DedicationBlock,
  ForewordBlock,
  ListOfFiguresBlock,
  ListOfTablesBlock,
} from "@/lib/types";
import axios from "axios";

interface BlockEditorProps {
  blockId: string;
}

const BlockEditor = ({ blockId }: BlockEditorProps) => {
  const { project, updateBlock, setError } = useDocumentStore();
  const [block, setBlock] = useState<Block | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (project && blockId) {
      const foundBlock = project.blocks.find((b) => b.id === blockId);
      if (foundBlock) {
        setBlock(foundBlock);
      }
      setIsLoading(false);
    }
  }, [project, blockId]);

  // Add this effect to clear errors when block changes
  useEffect(() => {
    if (block) {
      setLocalError(null);
    }
  }, [block?.id]);

  // Don't render anything while loading to prevent uncontrolled/controlled switches
  if (isLoading || !block) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-8 text-center text-gray-500 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Loading block...
        </div>
      </div>
    );
  }

  // Helper functions for renderers - defined here to avoid hooks inside renderers
  const handleUpdateBlock = (data: Partial<Block>) => {
    updateBlock(blockId, data);
  };

  // Helper function to safely get string value with default
  const getStringValue = (value: string | undefined): string => {
    return value !== undefined ? value : "";
  };

  // Helper function to safely get number value with default
  const getNumberValue = (value: number | undefined): number => {
    return value !== undefined ? value : 0;
  };

  // Helper function to safely get boolean value with default
  const getBoolValue = (value: boolean | undefined): boolean => {
    return value !== undefined ? value : false;
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBlock((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
    handleUpdateBlock({ [name]: value });
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    setBlock((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: numValue };
    });
    handleUpdateBlock({ [name]: numValue });
  };

  const handleTableChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (block.type !== "table") return;

    const newData = [...block.data];
    newData[rowIndex][colIndex] = value;

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    handleUpdateBlock({ data: newData });
  };

  const handleAddRow = () => {
    if (block.type !== "table") return;

    const numCols = block.data[0]?.length || 0;
    if (numCols === 0) return;

    const newRow = Array(numCols).fill("");
    const newData = [...block.data, newRow];

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    handleUpdateBlock({ data: newData });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (block.type !== "table" || rowIndex === 0) return; // Don't remove header row

    const newData = block.data.filter((_, index) => index !== rowIndex);

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    handleUpdateBlock({ data: newData });
  };

  const handleAddColumn = () => {
    if (block.type !== "table") return;

    const newData = block.data.map((row) => [...row, ""]);

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    handleUpdateBlock({ data: newData });
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (block.type !== "table") return;

    const newData = block.data.map((row) =>
      row.filter((_, index) => index !== colIndex)
    );

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    handleUpdateBlock({ data: newData });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      e.target.files.length === 0 ||
      block.type !== "figure"
    )
      return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", "user123"); // This should come from auth in a real app
    formData.append("projectId", project?.id || "unknown");

    try {
      const response = await axios.post("/api/upload", formData);

      setBlock((prev) => {
        if (!prev || prev.type !== "figure") return prev;
        return { ...prev, imagePath: response.data.path };
      });

      handleUpdateBlock({ imagePath: response.data.path });
    } catch (error) {
      console.error("Upload error:", error);
      // Handle error (show message, etc.)
    }
  };

  // Function to find appropriate parent for a section based on its level
  const findAppropriateParent = (level: number): string | undefined => {
    if (!project || !block || block.type !== "section") return undefined;

    // Level 2 sections need a chapter parent
    if (level === 2) {
      // Find available chapters
      const chapters = project.blocks.filter((b) => b.type === "chapter");
      return chapters.length > 0 ? chapters[0].id : undefined;
    }

    // For level 3+, we need to find an appropriate parent section of level-1
    const currentSection = block as SectionBlock;
    const allBlocks = [...project.blocks].sort((a, b) => a.order - b.order);

    // Get the index of the current block
    const currentIndex = allBlocks.findIndex((b) => b.id === block.id);
    if (currentIndex === -1) return undefined;

    // Look backwards to find appropriate parent
    for (let i = currentIndex - 1; i >= 0; i--) {
      const potentialParent = allBlocks[i];

      // A section can be parent if its level is exactly one less than the current section
      if (potentialParent.type === "section") {
        const parentSection = potentialParent as SectionBlock;
        if (parentSection.level === level - 1) {
          return parentSection.id;
        }
      } else if (potentialParent.type === "chapter" && level === 2) {
        // A chapter can be a parent for level 2 sections
        return potentialParent.id;
      }
    }

    return undefined; // No appropriate parent found
  };

  // Function to check if a block can be a valid parent for a section of a given level
  const isValidParentForLevel = (
    parentBlock: Block,
    level: number
  ): boolean => {
    if (level <= 2) {
      // Level 2 sections can have chapter as parent or no parent
      return parentBlock.type === "chapter" || parentBlock.id === "";
    }

    if (parentBlock.type === "section") {
      // A section can be a parent if its level is exactly one less than the current section
      const parentSection = parentBlock as SectionBlock;
      return parentSection.level === level - 1;
    }

    return false;
  };

  // Helper function to convert section level to heading name
  const getLevelName = (level: number): string => {
    switch (level) {
      case 1:
        return "Chapter";
      case 2:
        return "Section";
      case 3:
        return "Subsection";
      case 4:
        return "Subsubsection";
      case 5:
        return "Paragraph";
      default:
        return "Section";
    }
  };

  // Enhanced parent selector for sections with level-based filtering
  const EnhancedParentSelector = ({
    block,
    handleUpdateBlock,
    project,
    currentLevel,
  }: {
    block: Block;
    handleUpdateBlock: (data: Partial<Block>) => void;
    project: { blocks: Block[] } | null;
    currentLevel?: number;
  }) => {
    // Get valid parents based on section level
    const validParents =
      project?.blocks.filter((b: Block) => {
        if (currentLevel === 2) {
          // Level 2 sections can ONLY be under chapters
          return b.type === "chapter";
        } else if (currentLevel && currentLevel > 2) {
          // Level 3+ sections must be under a section of level-1
          return (
            b.type === "section" &&
            (b as SectionBlock).level === currentLevel - 1
          );
        } else {
          // Default case - shouldn't happen with our UI
          return b.type === "chapter";
        }
      }) || [];

    return (
      <div className="mt-4">
        <label
          htmlFor="parentSection"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Parent Section
        </label>
        <select
          id="parentSection"
          value={(block as any).parentId || ""}
          onChange={(e) => {
            const parentId = e.target.value || undefined;
            handleUpdateBlock({ parentId });
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          {/* Remove the option for None/Top level for all section levels */}
          {validParents.map((parentBlock: Block) => (
            <option key={parentBlock.id} value={parentBlock.id}>
              {parentBlock.type === "chapter"
                ? `Chapter: ${(parentBlock as ChapterBlock).title}`
                : `${getLevelName((parentBlock as SectionBlock).level)}: ${
                    (parentBlock as SectionBlock).title
                  }`}
            </option>
          ))}

          {validParents.length === 0 && (
            <option value="" disabled>
              {currentLevel === 2
                ? "No chapters found. Create a Chapter first."
                : `No valid parents found for this level. Create a ${getLevelName(
                    currentLevel ? currentLevel - 1 : 1
                  )} first.`}
            </option>
          )}
        </select>

        {(block as any).parentId === undefined ||
        !validParents.some((p) => p.id === (block as any).parentId) ? (
          <p className="mt-1 text-sm text-amber-600">
            {currentLevel === 2
              ? "Warning: This section needs a Chapter as parent. Please select a valid parent."
              : `Warning: This section needs a ${getLevelName(
                  currentLevel ? currentLevel - 1 : 1
                )} as parent. Please select a valid parent.`}
          </p>
        ) : null}
      </div>
    );
  };

  // Regular ParentSelector for non-section blocks
  const ParentSelector = ({
    block,
    handleUpdateBlock,
    project,
  }: {
    block: Block;
    handleUpdateBlock: (data: Partial<Block>) => void;
    project: { blocks: Block[] } | null;
  }) => {
    return (
      <div className="mt-4">
        <label
          htmlFor="parentSection"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Parent Section
        </label>
        <select
          id="parentSection"
          value={(block as any).parentId || ""}
          onChange={(e) => {
            const parentId = e.target.value || undefined;
            handleUpdateBlock({ parentId });
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="">None (Top level)</option>
          {project?.blocks
            .filter((b: Block) => b.type === "chapter" || b.type === "section")
            .map((parentBlock: Block) => (
              <option key={parentBlock.id} value={parentBlock.id}>
                {parentBlock.type === "chapter"
                  ? `Chapter: ${(parentBlock as ChapterBlock).title}`
                  : `${getLevelName((parentBlock as SectionBlock).level)}: ${
                      (parentBlock as SectionBlock).title
                    }`}
              </option>
            ))}
        </select>
      </div>
    );
  };

  // Custom components for block types
  const renderBlockEditor = () => {
    switch (block.type) {
      case "title-page":
        return (
          <div className="space-y-6 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Title Page Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Dissertation Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={getStringValue((block as TitlePageBlock).title)}
                    onChange={handleTextChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="border-t border-gray-200 my-6 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    Author Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="authorName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Author Name
                      </label>
                      <input
                        type="text"
                        id="authorName"
                        name="author.name"
                        value={getStringValue(
                          (block as TitlePageBlock).author?.name
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="studentId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Student ID
                      </label>
                      <input
                        type="text"
                        id="studentId"
                        name="author.studentId"
                        value={getStringValue(
                          (block as TitlePageBlock).author?.studentId
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    Institutional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={getStringValue(
                          (block as TitlePageBlock).department
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="program"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Program
                      </label>
                      <input
                        type="text"
                        id="program"
                        name="program"
                        value={getStringValue(
                          (block as TitlePageBlock).program
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="submissionDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Submission Date
                      </label>
                      <input
                        type="text"
                        id="submissionDate"
                        name="submissionDate"
                        value={getStringValue(
                          (block as TitlePageBlock).submissionDate
                        )}
                        onChange={handleTextChange}
                        placeholder="e.g. May 2023"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="defenseDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Defense Date
                      </label>
                      <input
                        type="text"
                        id="defenseDate"
                        name="defenseDate"
                        value={getStringValue(
                          (block as TitlePageBlock).defenseDate
                        )}
                        onChange={handleTextChange}
                        placeholder="e.g. June 10, 2023"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-6 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-4">
                    Advisor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="advisorTitle"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="advisorTitle"
                        name="advisor.title"
                        value={getStringValue(
                          (block as TitlePageBlock).advisor?.title
                        )}
                        onChange={handleTextChange}
                        placeholder="e.g. Prof. Dr."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="advisorName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="advisorName"
                        name="advisor.name"
                        value={getStringValue(
                          (block as TitlePageBlock).advisor?.name
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="advisorInstitution"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Institution
                      </label>
                      <input
                        type="text"
                        id="advisorInstitution"
                        name="advisor.institution"
                        value={getStringValue(
                          (block as TitlePageBlock).advisor?.institution
                        )}
                        onChange={handleTextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "turkish-abstract":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Extended Turkish Abstract (Özet)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (ALL CAPITALS)
              </label>
              <input
                type="text"
                name="title"
                value={(block as any).title || "ÖZET"}
                onChange={(e) => {
                  // Convert to uppercase
                  const value = e.target.value.toUpperCase();
                  handleUpdateBlock({ title: value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 uppercase"
                placeholder="ÖZET"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={8}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "chapter":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Chapter</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={block.title}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={12}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "section":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {block.level === 2
                ? "Section"
                : block.level === 3
                ? "Subsection"
                : block.level === 4
                ? "Subsubsection"
                : block.level === 5
                ? "Subsubsection (no numbering)"
                : "Fifth level title (no numbering)"}
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm">
              <h3 className="font-medium text-blue-800 mb-1">
                Section Hierarchy Rules
              </h3>
              <ul className="list-disc pl-5 text-blue-700 space-y-1">
                <li>
                  <strong>Level 2 (Sections)</strong> must be under a Chapter
                </li>
                <li>
                  <strong>Level 3 (Subsections)</strong> must be under a Level 2
                  Section
                </li>
                <li>
                  <strong>Level 4 (Subsubsections)</strong> must be under a
                  Level 3 Subsection
                </li>
                <li>
                  <strong>Level 5 (Paragraphs)</strong> must be under a Level 4
                  Subsubsection
                </li>
              </ul>
              <p className="mt-2 text-blue-600">
                When you change the level, the section will automatically be
                placed under the appropriate parent to maintain correct document
                hierarchy.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={block.title}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                name="level"
                value={block.level}
                onChange={handleSectionLevelChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={2}>Section (Level 2)</option>
                <option value={3}>Subsection (Level 3)</option>
                <option value={4}>Subsubsection (Level 4)</option>
                <option value={5}>Subsubsection no numbering (Level 5)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={8}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <EnhancedParentSelector
              block={block}
              handleUpdateBlock={handleUpdateBlock}
              project={project}
              currentLevel={block.level}
            />
          </div>
        );

      case "figure":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Figure</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                name="caption"
                value={block.caption}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (used for references)
              </label>
              <input
                type="text"
                name="label"
                value={block.label}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              {block.imagePath ? (
                <div className="mt-2 relative">
                  <img
                    src={block.imagePath}
                    alt={block.caption}
                    className="max-w-full h-auto mb-2 border"
                    onError={(e) => {
                      console.error(`Error loading image: ${block.imagePath}`);
                      e.currentTarget.src = "/placeholder-image.png";
                    }}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Image path: {block.imagePath}
                  </div>
                  <button
                    onClick={() => {
                      setBlock((prev) => {
                        if (!prev || prev.type !== "figure") return prev;
                        return { ...prev, imagePath: "" };
                      });
                      handleUpdateBlock({ imagePath: "" });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Or use a template image:
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            const imagePath = `/templates/itu/fig/sekil${num}.png`;
                            setBlock((prev) => {
                              if (!prev || prev.type !== "figure") return prev;
                              return { ...prev, imagePath };
                            });
                            handleUpdateBlock({ imagePath });
                          }}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                        >
                          Image {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (additional notes, not rendered in LaTeX)
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={4}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <ParentSelector
              block={block}
              handleUpdateBlock={handleUpdateBlock}
              project={project}
            />
          </div>
        );

      case "table":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Table</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                name="caption"
                value={block.caption}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (used for references)
              </label>
              <input
                type="text"
                name="label"
                value={block.label}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Data
              </label>
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {block.data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="p-1">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                handleTableChange(
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                        ))}
                        {rowIndex > 0 && (
                          <td className="p-1">
                            <button
                              onClick={() => handleRemoveRow(rowIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={handleAddRow}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Row
                </button>
                <button
                  onClick={handleAddColumn}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Column
                </button>
                {block.data[0]?.length > 1 && (
                  <button
                    onClick={() => handleRemoveColumn(block.data[0].length - 1)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove Column
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (additional notes, not rendered in LaTeX)
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={4}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <ParentSelector
              block={block}
              handleUpdateBlock={handleUpdateBlock}
              project={project}
            />
          </div>
        );

      case "bibliography":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Bibliography</h2>
            <p className="text-gray-600">
              The bibliography will be automatically generated from your
              references. Go to the References tab to manage your citations.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (additional notes, not rendered in LaTeX)
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={4}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "appendices":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Appendices</h2>
            <p className="text-gray-600 mb-2">
              Use this block to add appendices to your thesis. For the ITU
              template, this will appear after the bibliography.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={8}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "cv":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Curriculum Vitae</h2>
            <p className="text-gray-600 mb-2">
              This block is required for the ITU template. It should contain
              your CV in the format required by ITU.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={12}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "jury-approval":
        const juryBlock = block as JuryApprovalBlock;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Jury Approval Page (Jüri Onay Sayfası)
            </h2>

            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded">
              <p className="text-sm text-yellow-800">
                According to the ITU thesis template, the jury approval page
                must include at least 3 jury members including your advisor. For
                PhD, a minimum of 5 jury members is required.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Defense Date (Savunma Tarihi)
              </label>
              <input
                type="text"
                value={juryBlock.defenseDate || ""}
                onChange={(e) =>
                  handleUpdateBlock({ defenseDate: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., December 21, 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jury Members (Jüri Üyeleri)
              </label>

              {/* Display existing jury members */}
              {juryBlock.juryMembers?.map((member, index) => (
                <div key={index} className="mb-4 p-3 border rounded bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Jury Member {index + 1}</h3>
                    <button
                      onClick={() => {
                        const newMembers = [...juryBlock.juryMembers];
                        newMembers.splice(index, 1);
                        handleUpdateBlock({ juryMembers: newMembers });
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Title
                      </label>
                      <select
                        value={member.title || "Prof. Dr."}
                        onChange={(e) => {
                          const newMembers = [...juryBlock.juryMembers];
                          newMembers[index] = {
                            ...newMembers[index],
                            title: e.target.value,
                          };
                          handleUpdateBlock({ juryMembers: newMembers });
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="Prof. Dr.">Prof. Dr.</option>
                        <option value="Doç. Dr.">
                          Doç. Dr. (Assoc. Prof.)
                        </option>
                        <option value="Dr. Öğr. Üyesi">
                          Dr. Öğr. Üyesi (Asst. Prof.)
                        </option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={member.name || ""}
                        onChange={(e) => {
                          const newMembers = [...juryBlock.juryMembers];
                          newMembers[index] = {
                            ...newMembers[index],
                            name: e.target.value,
                          };
                          handleUpdateBlock({ juryMembers: newMembers });
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="Name SURNAME"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={member.institution || ""}
                        onChange={(e) => {
                          const newMembers = [...juryBlock.juryMembers];
                          newMembers[index] = {
                            ...newMembers[index],
                            institution: e.target.value,
                          };
                          handleUpdateBlock({ juryMembers: newMembers });
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="e.g., Istanbul Technical University"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Role
                      </label>
                      <select
                        value={member.role || "member"}
                        onChange={(e) => {
                          const newMembers = [...juryBlock.juryMembers];
                          newMembers[index] = {
                            ...newMembers[index],
                            role: e.target.value as
                              | "advisor"
                              | "coAdvisor"
                              | "member",
                          };
                          handleUpdateBlock({ juryMembers: newMembers });
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="advisor">Advisor (Tez Danışmanı)</option>
                        <option value="coAdvisor">
                          Co-Advisor (Eş Danışman)
                        </option>
                        <option value="member">Member (Üye)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new jury member button */}
              <button
                onClick={() => {
                  const newMembers = [
                    ...(juryBlock.juryMembers || []),
                    {
                      name: "",
                      title: "Prof. Dr.",
                      institution: "Istanbul Technical University",
                      role: "member" as "advisor" | "coAdvisor" | "member",
                    },
                  ];
                  handleUpdateBlock({ juryMembers: newMembers });
                }}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Jury Member
              </button>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Not included in final document)
              </label>
              <textarea
                name="content"
                value={juryBlock.content || ""}
                onChange={handleTextChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about the jury approval page"
              />
            </div>
          </div>
        );

      case "abstract":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Abstract</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (ALL CAPITALS)
              </label>
              <input
                type="text"
                name="title"
                value={(block as any).title || "ABSTRACT"}
                onChange={(e) => {
                  // Convert to uppercase
                  const value = e.target.value.toUpperCase();
                  handleUpdateBlock({ title: value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 uppercase"
                placeholder="ABSTRACT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content}
                onChange={handleTextChange}
                rows={8}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "table-of-contents": {
        const tocBlock = block as TableOfContentsBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              Table of Contents (İçindekiler)
            </h2>

            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                The Table of Contents will be automatically generated based on
                your document structure. In the ITU template, this follows a
                specific format with dotted lines and appropriate spacing.
              </p>
            </div>

            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="autoGenerated"
                checked={tocBlock.autoGenerated}
                onChange={(e) => {
                  handleUpdateBlock({ autoGenerated: e.target.checked });
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="autoGenerated"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Auto-generate TOC (Recommended)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in English
                </label>
                <input
                  type="text"
                  value={tocBlock.englishTitle || "TABLE OF CONTENTS"}
                  onChange={(e) => {
                    handleUpdateBlock({ englishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={tocBlock.autoGenerated}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in Turkish
                </label>
                <input
                  type="text"
                  value={tocBlock.turkishTitle || "İÇİNDEKİLER"}
                  onChange={(e) => {
                    handleUpdateBlock({ turkishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={tocBlock.autoGenerated}
                />
              </div>
            </div>

            <div className="border rounded p-4 bg-gray-50">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                ITU TOC Format Preview
              </h3>
              <div className="text-sm font-mono whitespace-pre-wrap text-gray-600">
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>1. INTRODUCTION</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1 pl-4">
                  <span>1.1 Purpose of Thesis</span>
                  <span>2</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1 pl-8">
                  <span>1.1.1 Research questions</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>2. LITERATURE REVIEW</span>
                  <span>5</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Not included in final document)
              </label>
              <textarea
                name="content"
                value={tocBlock.content || ""}
                onChange={handleTextChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about the table of contents"
              />
            </div>
          </div>
        );
      }

      case "list-of-symbols":
        const symbolsBlock = block as ListOfSymbolsBlock;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">List of Symbols</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbols
              </label>
              {symbolsBlock.symbols?.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={item.symbol || ""}
                    onChange={(e) => {
                      const newSymbols = [...symbolsBlock.symbols];
                      newSymbols[index] = {
                        ...newSymbols[index],
                        symbol: e.target.value,
                      };
                      handleUpdateBlock({ symbols: newSymbols });
                    }}
                    className="w-1/3 p-2 border rounded"
                    placeholder="Symbol"
                  />
                  <input
                    type="text"
                    value={item.definition || ""}
                    onChange={(e) => {
                      const newSymbols = [...symbolsBlock.symbols];
                      newSymbols[index] = {
                        ...newSymbols[index],
                        definition: e.target.value,
                      };
                      handleUpdateBlock({ symbols: newSymbols });
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder="Definition"
                  />
                  <button
                    onClick={() => {
                      const newSymbols = symbolsBlock.symbols.filter(
                        (_, i) => i !== index
                      );
                      handleUpdateBlock({ symbols: newSymbols });
                    }}
                    className="p-2 bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newSymbols = [
                    ...(symbolsBlock.symbols || []),
                    { symbol: "", definition: "" },
                  ];
                  handleUpdateBlock({ symbols: newSymbols });
                }}
                className="mt-1 px-3 py-1 bg-blue-50 text-blue-500 border border-blue-200 rounded hover:bg-blue-100"
              >
                Add Symbol
              </button>
            </div>
          </div>
        );

      case "turkish-title-page": {
        const turkishTitleBlock = block as TurkishTitlePageBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              Turkish Title Page (Türkçe Başlık Sayfası)
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title in Turkish (Türkçe Başlık)
              </label>
              <input
                type="text"
                value={turkishTitleBlock.title || ""}
                onChange={(e) => {
                  handleUpdateBlock({ title: e.target.value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Author Information */}
            <fieldset className="border p-4 rounded">
              <legend className="text-sm font-medium text-gray-700 px-2">
                Author Information (Yazar Bilgileri)
              </legend>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name (Yazar Adı)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.author?.name || ""}
                  onChange={(e) => {
                    handleUpdateBlock({
                      author: {
                        ...turkishTitleBlock.author,
                        name: e.target.value,
                      },
                    });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID (Öğrenci Numarası)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.author?.studentId || ""}
                  onChange={(e) => {
                    handleUpdateBlock({
                      author: {
                        ...turkishTitleBlock.author,
                        studentId: e.target.value,
                      },
                    });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department in Turkish (Anabilim Dalı)
              </label>
              <input
                type="text"
                value={turkishTitleBlock.department || ""}
                onChange={(e) => {
                  handleUpdateBlock({ department: e.target.value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="örn: İnşaat Mühendisliği Anabilim Dalı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program in Turkish (Program)
              </label>
              <input
                type="text"
                value={turkishTitleBlock.program || ""}
                onChange={(e) => {
                  handleUpdateBlock({ program: e.target.value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="örn: Yapı Mühendisliği Programı"
              />
            </div>

            {/* Advisor Information */}
            <fieldset className="border p-4 rounded">
              <legend className="text-sm font-medium text-gray-700 px-2">
                Advisor Information (Danışman Bilgileri)
              </legend>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advisor Title (Danışman Ünvanı)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.advisor?.title || "Prof. Dr."}
                  onChange={(e) => {
                    const updatedAdvisor = {
                      title: e.target.value,
                      name: turkishTitleBlock.advisor?.name || "Danışman Adı",
                      institution:
                        turkishTitleBlock.advisor?.institution ||
                        "İstanbul Teknik Üniversitesi",
                    };
                    handleUpdateBlock({ advisor: updatedAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advisor Name (Danışman Adı)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.advisor?.name || ""}
                  onChange={(e) => {
                    const updatedAdvisor = {
                      title: turkishTitleBlock.advisor?.title || "Prof. Dr.",
                      name: e.target.value,
                      institution:
                        turkishTitleBlock.advisor?.institution ||
                        "İstanbul Teknik Üniversitesi",
                    };
                    handleUpdateBlock({ advisor: updatedAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Advisor Institution (Danışman Kurumu)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.advisor?.institution || ""}
                  onChange={(e) => {
                    const updatedAdvisor = {
                      title: turkishTitleBlock.advisor?.title || "Prof. Dr.",
                      name: turkishTitleBlock.advisor?.name || "Danışman Adı",
                      institution: e.target.value,
                    };
                    handleUpdateBlock({ advisor: updatedAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </fieldset>

            {/* Co-Advisor Information */}
            <fieldset className="border p-4 rounded">
              <legend className="text-sm font-medium text-gray-700 px-2">
                Co-Advisor Information (Eş Danışman Bilgileri) - İsteğe Bağlı
              </legend>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Co-Advisor Title (Eş Danışman Ünvanı)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.coAdvisor?.title || ""}
                  onChange={(e) => {
                    const updatedCoAdvisor = {
                      title: e.target.value,
                      name:
                        turkishTitleBlock.coAdvisor?.name || "Eş Danışman Adı",
                      institution:
                        turkishTitleBlock.coAdvisor?.institution ||
                        "İstanbul Teknik Üniversitesi",
                    };
                    handleUpdateBlock({ coAdvisor: updatedCoAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Co-Advisor Name (Eş Danışman Adı)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.coAdvisor?.name || ""}
                  onChange={(e) => {
                    const updatedCoAdvisor = {
                      title: turkishTitleBlock.coAdvisor?.title || "Doç. Dr.",
                      name: e.target.value,
                      institution:
                        turkishTitleBlock.coAdvisor?.institution ||
                        "İstanbul Teknik Üniversitesi",
                    };
                    handleUpdateBlock({ coAdvisor: updatedCoAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Co-Advisor Institution (Eş Danışman Kurumu)
                </label>
                <input
                  type="text"
                  value={turkishTitleBlock.coAdvisor?.institution || ""}
                  onChange={(e) => {
                    const updatedCoAdvisor = {
                      title: turkishTitleBlock.coAdvisor?.title || "Doç. Dr.",
                      name:
                        turkishTitleBlock.coAdvisor?.name || "Eş Danışman Adı",
                      institution: e.target.value,
                    };
                    handleUpdateBlock({ coAdvisor: updatedCoAdvisor });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </fieldset>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Date in Turkish (Teslim Tarihi)
              </label>
              <input
                type="text"
                value={turkishTitleBlock.submissionDate || ""}
                onChange={(e) => {
                  handleUpdateBlock({ submissionDate: e.target.value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="örn: EYLÜL 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Defense Date in Turkish (Savunma Tarihi)
              </label>
              <input
                type="text"
                value={turkishTitleBlock.defenseDate || ""}
                onChange={(e) => {
                  handleUpdateBlock({ defenseDate: e.target.value });
                }}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="örn: 21 ARALIK 2024"
              />
            </div>
          </div>
        );
      }

      case "declaration": {
        const declarationBlock = block as DeclarationBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              Declaration Page (Beyan Sayfası)
            </h2>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-4">
              <p className="text-sm text-blue-800">
                This is the formal declaration page where you certify that your
                thesis is your original work. The ITU template has a standard
                declaration text, but you may modify it as needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Declaration Text (Beyan Metni)
              </label>
              <textarea
                name="content"
                value={declarationBlock.content || ""}
                onChange={handleTextChange}
                rows={8}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="I hereby declare that all information in this document has been obtained and presented in accordance with academic rules and ethical conduct..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date (Tarih)
                </label>
                <input
                  type="text"
                  value={declarationBlock.date || ""}
                  onChange={(e) => {
                    handleUpdateBlock({ date: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., December 21, 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature (İmza){" "}
                  <span className="text-xs text-gray-500">
                    (Optional in digital version)
                  </span>
                </label>
                <input
                  type="text"
                  value={declarationBlock.signature || ""}
                  onChange={(e) => {
                    handleUpdateBlock({ signature: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name SURNAME"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Example Declaration Text (ITU Template)
              </h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <p>
                  I hereby declare that all information in this document has
                  been obtained and presented in accordance with academic rules
                  and ethical conduct. I also declare that, as required by these
                  rules and conduct, I have fully cited and referenced all
                  material and results that are not original to this work.
                </p>
                <p className="mt-2">Name, Last name :</p>
                <p>Signature :</p>
              </div>
            </div>
          </div>
        );
      }

      case "dedication": {
        const dedicationBlock = block as DedicationBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              Dedication Page (İthaf Sayfası)
            </h2>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-4">
              <p className="text-sm text-blue-800">
                The dedication page is optional. It typically contains a brief
                dedication to someone special. In the ITU template, this appears
                after the declaration page.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dedication Text (İthaf Metni)
              </label>
              <textarea
                name="content"
                value={dedicationBlock.content || ""}
                onChange={handleTextChange}
                rows={5}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="To my family..."
              />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Example Dedication Text
              </h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <p>
                  "To my parents for their endless support and encouragement..."
                </p>
                <p className="mt-2">
                  "To my spouse and children, who supported me throughout this
                  journey..."
                </p>
                <p className="mt-2">"In memory of my father..."</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Note: Dedications are typically centered on the page and written
                in a simple, elegant style.
              </p>
            </div>
          </div>
        );
      }

      case "foreword": {
        const forewordBlock = block as ForewordBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">Foreword Page (Önsöz)</h2>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-4">
              <p className="text-sm text-blue-800">
                The foreword (önsöz) typically acknowledges the support received
                during your research. Include acknowledgments to your advisor,
                committee members, family, and funding sources.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreword Text (Önsöz Metni)
              </label>
              <textarea
                name="content"
                value={forewordBlock.content || ""}
                onChange={handleTextChange}
                rows={10}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="I would like to express my deep appreciation to my thesis advisor, Prof. Dr. Name SURNAME for their guidance..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date (Tarih)
                </label>
                <input
                  type="text"
                  value={forewordBlock.date || ""}
                  onChange={(e) => {
                    handleUpdateBlock({ date: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., December 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signature (İmza){" "}
                  <span className="text-xs text-gray-500">
                    (Your name at the end)
                  </span>
                </label>
                <input
                  type="text"
                  value={forewordBlock.signature || ""}
                  onChange={(e) => {
                    handleUpdateBlock({ signature: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name SURNAME"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Example Foreword Structure
              </h3>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <p>
                  1. Express gratitude to your advisor and committee members
                </p>
                <p>
                  2. Acknowledge any funding sources or institutional support
                </p>
                <p>
                  3. Thank colleagues, friends, and family members who helped
                </p>
                <p>4. End with your name and the date</p>
              </div>
            </div>
          </div>
        );
      }

      case "list-of-figures": {
        const lofBlock = block as ListOfFiguresBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              List of Figures (Şekil Listesi)
            </h2>

            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                The List of Figures will be automatically generated based on all
                figures in your document. ITU template formats this list with
                figure numbers, captions, and page numbers.
              </p>
            </div>

            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="autoGeneratedLof"
                checked={lofBlock.autoGenerated}
                onChange={(e) => {
                  handleUpdateBlock({ autoGenerated: e.target.checked });
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="autoGeneratedLof"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Auto-generate List of Figures (Recommended)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in English
                </label>
                <input
                  type="text"
                  value={lofBlock.englishTitle || "LIST OF FIGURES"}
                  onChange={(e) => {
                    handleUpdateBlock({ englishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={lofBlock.autoGenerated}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in Turkish
                </label>
                <input
                  type="text"
                  value={lofBlock.turkishTitle || "ŞEKİL LİSTESİ"}
                  onChange={(e) => {
                    handleUpdateBlock({ turkishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={lofBlock.autoGenerated}
                />
              </div>
            </div>

            <div className="border rounded p-4 bg-gray-50">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                ITU List of Figures Format Preview
              </h3>
              <div className="text-sm font-mono whitespace-pre-wrap text-gray-600">
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>
                    Figure 1.1 : Sample diagram showing the research
                    methodology.
                  </span>
                  <span>6</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>Figure 2.1 : Data collection process flowchart.</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>Figure 3.1 : Results of the experimental setup.</span>
                  <span>24</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To include figures in your document, add
                Figure blocks in the chapter sections. Each figure must have a
                caption and label to appear in the list of figures.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Not included in final document)
              </label>
              <textarea
                name="content"
                value={lofBlock.content || ""}
                onChange={handleTextChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about the list of figures"
              />
            </div>
          </div>
        );
      }

      case "list-of-tables": {
        const lotBlock = block as ListOfTablesBlock;
        return (
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold">
              List of Tables (Tablo Listesi)
            </h2>

            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                The List of Tables will be automatically generated based on all
                tables in your document. ITU template formats this list with
                table numbers, captions, and page numbers.
              </p>
            </div>

            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="autoGeneratedLot"
                checked={lotBlock.autoGenerated}
                onChange={(e) => {
                  handleUpdateBlock({ autoGenerated: e.target.checked });
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="autoGeneratedLot"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Auto-generate List of Tables (Recommended)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in English
                </label>
                <input
                  type="text"
                  value={lotBlock.englishTitle || "LIST OF TABLES"}
                  onChange={(e) => {
                    handleUpdateBlock({ englishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={lotBlock.autoGenerated}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title in Turkish
                </label>
                <input
                  type="text"
                  value={lotBlock.turkishTitle || "TABLO LİSTESİ"}
                  onChange={(e) => {
                    handleUpdateBlock({ turkishTitle: e.target.value });
                  }}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={lotBlock.autoGenerated}
                />
              </div>
            </div>

            <div className="border rounded p-4 bg-gray-50">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                ITU List of Tables Format Preview
              </h3>
              <div className="text-sm font-mono whitespace-pre-wrap text-gray-600">
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>
                    Table 1.1 : Comparison of various methodologies in previous
                    studies.
                  </span>
                  <span>8</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>
                    Table 2.1 : Statistical results of the experiments.
                  </span>
                  <span>15</span>
                </div>
                <div className="flex justify-between border-b border-dotted border-gray-300 py-1">
                  <span>
                    Table 3.1 : Characteristics of different materials.
                  </span>
                  <span>28</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To include tables in your document, add
                Table blocks in the chapter sections. Each table must have a
                caption and label to appear in the list of tables.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Not included in final document)
              </label>
              <textarea
                name="content"
                value={lotBlock.content || ""}
                onChange={handleTextChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about the list of tables"
              />
            </div>
          </div>
        );
      }

      case "list-of-abbreviations":
        const abbreviationsBlock = block as ListOfAbbreviationsBlock;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">List of Abbreviations</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abbreviations
              </label>
              {abbreviationsBlock.abbreviations?.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={item.term || ""}
                    onChange={(e) => {
                      const newAbbreviations = [
                        ...abbreviationsBlock.abbreviations,
                      ];
                      newAbbreviations[index] = {
                        ...newAbbreviations[index],
                        term: e.target.value,
                      };
                      handleUpdateBlock({ abbreviations: newAbbreviations });
                    }}
                    className="w-1/3 p-2 border rounded"
                    placeholder="Abbreviation"
                  />
                  <input
                    type="text"
                    value={item.definition || ""}
                    onChange={(e) => {
                      const newAbbreviations = [
                        ...abbreviationsBlock.abbreviations,
                      ];
                      newAbbreviations[index] = {
                        ...newAbbreviations[index],
                        definition: e.target.value,
                      };
                      handleUpdateBlock({ abbreviations: newAbbreviations });
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder="Definition"
                  />
                  <button
                    onClick={() => {
                      const newAbbreviations =
                        abbreviationsBlock.abbreviations.filter(
                          (_, i) => i !== index
                        );
                      handleUpdateBlock({ abbreviations: newAbbreviations });
                    }}
                    className="p-2 bg-red-50 text-red-500 border border-red-200 rounded hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newAbbreviations = [
                    ...(abbreviationsBlock.abbreviations || []),
                    { term: "", definition: "" },
                  ];
                  handleUpdateBlock({ abbreviations: newAbbreviations });
                }}
                className="mt-1 px-3 py-1 bg-blue-50 text-blue-500 border border-blue-200 rounded hover:bg-blue-100"
              >
                Add Abbreviation
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {block.type.charAt(0).toUpperCase() +
                block.type.slice(1).replace(/-/g, " ")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                name="content"
                value={block.content || ""}
                onChange={handleTextChange}
                rows={10}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Notes section for all blocks */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (for your reference only)
              </label>
              <textarea
                name="notes"
                value={getStringValue(block.notes)}
                onChange={handleTextChange}
                rows={3}
                placeholder="Add notes about this block (not included in final document)"
                className="w-full p-2 border border-yellow-200 bg-yellow-50 rounded focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        );
    }
  };

  // Replace the handleSectionLevelChange function with this improved version
  const handleSectionLevelChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newLevel = parseInt(value, 10) as 1 | 2 | 3 | 4 | 5; // Cast to the specific level union type

    if (block.type !== "section") return;

    // Store the original level to calculate level difference for child updates
    const originalLevel = (block as SectionBlock).level;
    const levelDifference = newLevel - originalLevel;

    let newParentId: string | undefined = undefined;

    // For level 2 sections, find a chapter parent
    if (newLevel === 2) {
      // Find a chapter to be the parent
      const chapters = project?.blocks.filter((b) => b.type === "chapter");

      // First try to use the current chapter parent if it exists
      const currentParentId = (block as SectionBlock).parentId;
      const currentParent = currentParentId
        ? project?.blocks.find((b) => b.id === currentParentId)
        : null;

      if (currentParent && currentParent.type === "chapter") {
        // Keep the current chapter parent
        newParentId = currentParentId;
      } else {
        // Otherwise use the first chapter or the most recent chapter
        newParentId =
          chapters && chapters.length > 0 ? chapters[0].id : undefined;
      }

      // If no chapter exists, show an error message
      if (!newParentId) {
        setLocalError(
          "Level 2 sections must be under a chapter. Please create a chapter first."
        );
        return;
      }
    } else if (newLevel >= 3) {
      // For level 3+, find an appropriate parent of one level higher
      newParentId = findAppropriateParent(newLevel);

      // If no appropriate parent found, show an error
      if (!newParentId) {
        setLocalError(
          `Level ${newLevel} sections must be under a level ${
            newLevel - 1
          } section. Please create one first.`
        );
        return;
      }
    }

    // Update the block's level and parent
    setBlock((prev) => {
      if (!prev || prev.type !== "section") return prev;
      return { ...prev, level: newLevel, parentId: newParentId };
    });

    // Send updates to the store for the current block
    handleUpdateBlock({ level: newLevel, parentId: newParentId });

    // Now recursively update child section levels if the level changed
    if (project && levelDifference !== 0) {
      // Find all direct children of this section
      const childSections = project.blocks.filter(
        (b) => b.type === "section" && (b as SectionBlock).parentId === block.id
      );

      // Recursively adjust child levels
      const updateChildSectionLevels = (childSections: Block[]) => {
        childSections.forEach((childSection) => {
          if (childSection.type === "section") {
            const childSectionTyped = childSection as SectionBlock;

            // Calculate new level, ensuring it stays within valid range (2-5)
            const newChildLevel = Math.min(
              Math.max(childSectionTyped.level + levelDifference, 2),
              5
            ) as 2 | 3 | 4 | 5;

            // Update this child's level using the store's updateBlock
            updateBlock(childSection.id, { level: newChildLevel });

            // Find this child's children and recursively update them
            const grandchildren = project.blocks.filter(
              (b) =>
                b.type === "section" &&
                (b as SectionBlock).parentId === childSection.id
            );

            if (grandchildren.length > 0) {
              updateChildSectionLevels(grandchildren);
            }
          }
        });
      };

      // Start recursive update
      updateChildSectionLevels(childSections);
    }
  };

  return renderBlockEditor();
};

export default BlockEditor;

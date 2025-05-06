"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useDocumentStore } from "@/lib/store";
import { Block, BlockType } from "@/lib/types";
import { getBlockDisplayName, getBlockCategory } from "@/lib/blockUtils";
import React, { useState } from "react";

// Helper function to get a readable title for the block
const getBlockTitle = (block: Block): string => {
  // Get the base display name from our utility
  const baseTitle = getBlockDisplayName(block.type);

  // Add custom details for specific block types
  switch (block.type) {
    case "title-page":
      return `${baseTitle}: ${(block as any).title || ""}`;

    case "chapter":
      return `${baseTitle} ${(block as any).number || ""}: ${
        (block as any).title || ""
      }`;

    case "section":
      const sectionBlock = block as any;
      const prefix = sectionBlock.parentNumber
        ? `${sectionBlock.parentNumber}.`
        : "";
      return `${baseTitle} ${prefix}${sectionBlock.title || ""}`;

    case "figure":
      return `${baseTitle}: ${(block as any).caption || ""}`;

    case "table":
      return `${baseTitle}: ${(block as any).caption || ""}`;

    default:
      return baseTitle;
  }
};

// Replace the emoji-based block icons with a function that returns SVG icons
const getBlockIcon = (blockType: BlockType): React.ReactElement => {
  // Map of block type to SVG icon
  const icons: Record<string, React.ReactElement> = {
    "title-page": (
      <svg
        className="w-4 h-4 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    abstract: (
      <svg
        className="w-4 h-4 text-purple-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    chapter: (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    section: (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    figure: (
      <svg
        className="w-4 h-4 text-green-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    table: (
      <svg
        className="w-4 h-4 text-yellow-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    "list-of-figures": (
      <svg
        className="w-4 h-4 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    "list-of-tables": (
      <svg
        className="w-4 h-4 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    "list-of-abbreviations": (
      <svg
        className="w-4 h-4 text-teal-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M3 8h12m-7 3h7M5 16l-2 2 2 2M9 16l2 2-2 2m4-7h3"
        />
      </svg>
    ),
    "list-of-symbols": (
      <svg
        className="w-4 h-4 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
    "table-of-contents": (
      <svg
        className="w-4 h-4 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
    bibliography: (
      <svg
        className="w-4 h-4 text-pink-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    appendices: (
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
        />
      </svg>
    ),
    cv: (
      <svg
        className="w-4 h-4 text-indigo-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  };

  // Return the icon or a default
  return (
    icons[blockType] || (
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    )
  );
};

// Helper to check if a block is a child of another block
const isChildBlock = (block: Block, parentId: string | undefined): boolean => {
  // Check for any block type that might have a parentId
  return (block as any).parentId === parentId;
};

const BlockList = () => {
  const { project, selectedBlockId, selectBlock, removeBlock, updateBlock } =
    useDocumentStore();

  // State to track which chapters/sections are expanded
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!project || !project.blocks.length) {
    return (
      <div className="text-gray-500 p-6 text-center flex flex-col items-center">
        <svg
          className="w-12 h-12 text-gray-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p>No blocks yet. Add your first block using the button above.</p>
      </div>
    );
  }

  // Sort blocks by order for display
  const sortedBlocks = [...project.blocks].sort((a, b) => a.order - b.order);

  // Filter top-level blocks (those without parents)
  const topLevelBlocks = sortedBlocks.filter(
    (block) => !(block as any).parentId
  );

  // Group child blocks by their parent ID
  const childBlocksByParent: Record<string, Block[]> = {};

  sortedBlocks.forEach((block) => {
    const parentId = (block as any).parentId;
    if (parentId) {
      if (!childBlocksByParent[parentId]) {
        childBlocksByParent[parentId] = [];
      }
      childBlocksByParent[parentId].push(block);
    }
  });

  // Toggle block visibility
  const toggleVisibility = (block: Block, e: React.MouseEvent) => {
    e.stopPropagation();
    updateBlock(block.id, { visible: block.visible === false ? true : false });
  };

  // Render a block and its children recursively
  const renderBlock = (block: Block, index: number, depth: number = 0) => {
    const hasChildren = childBlocksByParent[block.id]?.length > 0;
    const isExpanded = expandedSections[block.id] !== false; // Default to expanded

    return (
      <div key={block.id} className="block-container relative">
        <Draggable draggableId={block.id} index={index} isDragDisabled={false}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`py-2 px-3 rounded-md ${
                block.id === selectedBlockId
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : snapshot.isDragging
                  ? "bg-gray-100 shadow-md"
                  : block.visible === false
                  ? "bg-gray-50 opacity-60"
                  : "bg-white hover:bg-gray-50"
              } cursor-pointer flex justify-between items-center relative transition-colors mb-1`}
              style={{
                marginLeft: `${depth * 16}px`,
                ...provided.draggableProps.style,
              }}
              onClick={() => selectBlock(block.id)}
            >
              {/* Block content - left side */}
              <div className="flex items-center space-x-2 overflow-hidden flex-1">
                {/* Toggle expand button or icon */}
                <div className="flex-shrink-0 w-6">
                  {hasChildren ? (
                    <button
                      onClick={(e) => toggleExpand(block.id, e)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                        />
                      </svg>
                    </button>
                  ) : (
                    <span className="p-1">
                      {getBlockIcon(block.type as BlockType)}
                    </span>
                  )}
                </div>

                {/* Block title */}
                <div className="overflow-hidden">
                  <span
                    className={`truncate font-medium ${
                      block.visible === false
                        ? "line-through text-gray-400"
                        : hasChildren
                        ? "text-gray-800"
                        : "text-gray-700"
                    }`}
                  >
                    {getBlockTitle(block)}
                  </span>
                </div>

                {/* Notes indicator */}
                {block.notes && (
                  <span
                    title={block.notes}
                    className="flex-shrink-0 w-5 h-5 text-amber-500"
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </span>
                )}
              </div>

              {/* Controls - right side */}
              <div className="flex items-center space-x-1 opacity-60 hover:opacity-100">
                {/* Toggle visibility button */}
                <button
                  onClick={(e) => toggleVisibility(block, e)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  title={block.visible === false ? "Show block" : "Hide block"}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        block.visible === false
                          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      }
                    />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBlock(block.id);
                  }}
                  className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600"
                  title="Delete block"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </Draggable>

        {/* Render children if this block has any and is expanded */}
        {hasChildren && isExpanded && (
          <div className="pl-6 relative">
            {/* Vertical line connecting all children */}
            <div
              className="absolute border-l border-gray-200"
              style={{
                height: "calc(100% - 8px)",
                left: `${depth * 16 + 12}px`,
                top: "0",
              }}
            ></div>

            {childBlocksByParent[block.id]?.map((childBlock, childIndex) =>
              renderBlock(childBlock, -1, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Droppable droppableId="document-blocks" isDropDisabled={false}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-1"
        >
          {topLevelBlocks.map((block, index) => renderBlock(block, index))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default BlockList;

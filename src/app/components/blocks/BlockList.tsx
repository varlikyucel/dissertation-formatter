"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { useDocumentStore } from "@/lib/store";
import { Block } from "@/lib/types";

// Helper function to get a readable title for the block
const getBlockTitle = (block: Block): string => {
  switch (block.type) {
    case "title-page":
      return "Title Page: " + block.title;
    case "abstract":
      return "Abstract";
    case "chapter":
      return "Chapter: " + block.title;
    case "section":
      return "Section: " + block.title;
    case "figure":
      return "Figure: " + block.caption;
    case "table":
      return "Table: " + block.caption;
    case "bibliography":
      return "Bibliography";
    case "summary":
      return "Summary";
    case "appendices":
      return "Appendices";
    case "cv":
      return "Curriculum Vitae";
    default:
      return "Block";
  }
};

const BlockList = () => {
  const { project, selectedBlockId, selectBlock, removeBlock } =
    useDocumentStore();

  if (!project || !project.blocks.length) {
    return (
      <div className="text-gray-500 p-4 text-center">
        No blocks yet. Add your first block using the buttons above.
      </div>
    );
  }

  // Sort blocks by order for display
  const sortedBlocks = [...project.blocks].sort((a, b) => a.order - b.order);

  return (
    <Droppable droppableId="document-blocks" isDropDisabled={false}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-2"
        >
          {sortedBlocks.map((block, index) => (
            <Draggable
              key={block.id}
              draggableId={block.id}
              index={index}
              isDragDisabled={false}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`p-3 rounded border ${
                    block.id === selectedBlockId
                      ? "bg-blue-100 border-blue-300"
                      : snapshot.isDragging
                      ? "bg-gray-100 border-gray-300"
                      : "bg-white border-gray-200"
                  } hover:bg-gray-50 cursor-pointer flex justify-between items-center`}
                  onClick={() => selectBlock(block.id)}
                >
                  <div className="flex items-center space-x-2">
                    {/* Icon based on block type */}
                    <div className="w-5 h-5 flex-shrink-0">
                      {block.type === "title-page" && <span>📄</span>}
                      {block.type === "abstract" && <span>📝</span>}
                      {block.type === "chapter" && <span>📚</span>}
                      {block.type === "section" && <span>📑</span>}
                      {block.type === "figure" && <span>🖼️</span>}
                      {block.type === "table" && <span>🗃️</span>}
                      {block.type === "bibliography" && <span>📚</span>}
                      {block.type === "summary" && <span>📋</span>}
                      {block.type === "appendices" && <span>📎</span>}
                      {block.type === "cv" && <span>👤</span>}
                    </div>
                    <span className="truncate">{getBlockTitle(block)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default BlockList;

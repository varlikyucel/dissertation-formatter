import React from "react";
import { ChapterBlock as ChapterBlockType } from "@/lib/types";
import BaseBlock from "./BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ChapterBlockProps {
  block: ChapterBlockType;
  onUpdate?: (block: ChapterBlockType) => void;
}

export default function ChapterBlock({ block, onUpdate }: ChapterBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="chapter-block">
      <div className="chapter-header mb-6">
        <h2 className="text-xl font-bold uppercase">
          CHAPTER {block.number}. {block.title}
        </h2>
      </div>

      <div className="chapter-content prose max-w-none">{block.content}</div>

      {!isValid && (
        <div className="validation-errors text-red-500 mt-4">
          {errors.map((error, index) => (
            <p key={index}>{error.message}</p>
          ))}
        </div>
      )}
    </BaseBlock>
  );
}

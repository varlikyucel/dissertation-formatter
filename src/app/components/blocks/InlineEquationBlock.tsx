import React from "react";
import { InlineEquationBlock as InlineEquationBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface InlineEquationBlockProps {
  block: InlineEquationBlockType;
  onUpdate?: (block: InlineEquationBlockType) => void;
}

export default function InlineEquationBlock({
  block,
  onUpdate,
}: InlineEquationBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="inline-equation-block">
      <div className="equation-container px-4 py-2 text-center">
        <div className="latex-content inline-block px-2 py-1 bg-gray-50 rounded">
          <span className="latex-placeholder font-serif">
            {block.equation || "E = mc^2"}
          </span>
        </div>
        <div className="equation-note text-gray-500 text-sm mt-1">
          [Inline equation: {block.equation || "E = mc^2"}]
        </div>
      </div>

      {!isValid && (
        <div className="validation-errors text-red-500 mt-4 text-center">
          {errors.map((error, index) => (
            <p key={index}>{error.message}</p>
          ))}
        </div>
      )}
    </BaseBlock>
  );
}

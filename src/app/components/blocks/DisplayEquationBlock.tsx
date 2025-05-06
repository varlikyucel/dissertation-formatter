import React from "react";
import { DisplayEquationBlock as DisplayEquationBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface DisplayEquationBlockProps {
  block: DisplayEquationBlockType;
  onUpdate?: (block: DisplayEquationBlockType) => void;
}

export default function DisplayEquationBlock({
  block,
  onUpdate,
}: DisplayEquationBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="display-equation-block">
      <div className="equation-container px-4 py-4 flex justify-between items-center">
        <div className="flex-grow"></div>
        <div className="latex-content px-4 py-2 bg-gray-50 rounded">
          <span className="latex-placeholder font-serif text-lg">
            {block.equation || "E = mc^2"}
          </span>
        </div>
        {block.number && (
          <div className="equation-number ml-4">({block.number})</div>
        )}
        <div className="flex-grow"></div>
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

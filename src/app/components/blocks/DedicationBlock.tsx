import React from "react";
import { DedicationBlock as DedicationBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface DedicationBlockProps {
  block: DedicationBlockType;
  onUpdate?: (block: DedicationBlockType) => void;
}

export default function DedicationBlock({
  block,
  onUpdate,
}: DedicationBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="dedication-block">
      <div className="h-64 flex items-center justify-center">
        <div className="dedication-content text-center italic max-w-md">
          {block.content || (
            <span className="text-gray-500">
              Your dedication text (optional)
            </span>
          )}
        </div>
      </div>

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

import React from "react";
import { MultiLineEquationBlock as MultiLineEquationBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface MultiLineEquationBlockProps {
  block: MultiLineEquationBlockType;
  onUpdate?: (block: MultiLineEquationBlockType) => void;
}

export default function MultiLineEquationBlock({
  block,
  onUpdate,
}: MultiLineEquationBlockProps) {
  const { isValid, errors } = validateBlock(block);

  // Default equations if none provided
  const equations =
    block.equations && block.equations.length > 0
      ? block.equations
      : ["f(x) = ax^2 + bx + c", "\\frac{\\partial f}{\\partial x} = 2ax + b"];

  return (
    <BaseBlock block={block} className="multi-line-equation-block">
      <div className="equations-container px-4 py-4">
        <div className="multi-line-content bg-gray-50 rounded p-4">
          {equations.map((equation, index) => (
            <div
              key={index}
              className="equation-row flex justify-between items-center py-2"
            >
              <div className="flex-grow"></div>
              <div className="latex-content px-4">
                <span className="latex-placeholder font-serif text-lg">
                  {equation}
                </span>
              </div>
              {block.numbers && block.numbers[index] && (
                <div className="equation-number ml-4">
                  ({block.numbers[index]})
                </div>
              )}
              <div className="flex-grow"></div>
            </div>
          ))}
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

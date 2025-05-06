import React from "react";
import { FigureBlock as FigureBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface FigureBlockProps {
  block: FigureBlockType;
  onUpdate?: (block: FigureBlockType) => void;
}

export default function FigureBlock({ block, onUpdate }: FigureBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="figure-block">
      <div className="figure-container flex flex-col items-center mb-4">
        <div className="image-wrapper border p-2 mb-2 max-w-2xl">
          {block.imagePath ? (
            <img
              src={block.imagePath}
              alt={block.caption}
              className="max-w-full h-auto"
            />
          ) : (
            <div className="bg-gray-100 w-full h-48 flex items-center justify-center text-gray-500">
              Image placeholder
            </div>
          )}
        </div>

        <div className="caption text-center max-w-2xl mt-3">
          <p className="font-bold">
            {block.number ? `Figure ${block.number}: ` : "Figure: "}
            {block.caption || (
              <span className="italic text-gray-500">Enter figure caption</span>
            )}
          </p>
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

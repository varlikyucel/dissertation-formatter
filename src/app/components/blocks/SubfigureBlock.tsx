import React from "react";
import { SubfigureBlock as SubfigureBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface SubfigureBlockProps {
  block: SubfigureBlockType;
  onUpdate?: (block: SubfigureBlockType) => void;
}

export default function SubfigureBlock({
  block,
  onUpdate,
}: SubfigureBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="subfigure-block">
      <div className="figure-container flex flex-col items-center mb-4">
        <div className="subfigure-grid grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
          {block.subfigures && block.subfigures.length > 0 ? (
            block.subfigures.map((subfig, index) => (
              <div key={index} className="subfigure flex flex-col items-center">
                <div className="image-wrapper border p-2 mb-2 w-full">
                  {subfig.imagePath ? (
                    <img
                      src={subfig.imagePath}
                      alt={subfig.caption}
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="bg-gray-100 w-full h-32 flex items-center justify-center text-gray-500">
                      Subfigure placeholder
                    </div>
                  )}
                </div>
                <div className="subcaption text-center mt-1">
                  <p className="text-sm">
                    <span className="font-bold">
                      ({String.fromCharCode(97 + index)})
                    </span>{" "}
                    {subfig.caption || "Caption for subfigure"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center w-full">
              No subfigures added yet.
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

import React from "react";
import { LandscapeFigureBlock as LandscapeFigureBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface LandscapeFigureBlockProps {
  block: LandscapeFigureBlockType;
  onUpdate?: (block: LandscapeFigureBlockType) => void;
}

export default function LandscapeFigureBlock({
  block,
  onUpdate,
}: LandscapeFigureBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="landscape-figure-block">
      <div className="figure-container flex flex-col items-center mb-4">
        <div
          className="image-wrapper border p-2 mb-2 w-full overflow-auto"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: "left top",
            maxHeight: "80vh",
          }}
        >
          <div
            style={{
              width: "150%",
              height: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {block.imagePath ? (
              <img
                src={block.imagePath}
                alt={block.caption}
                className="max-h-full"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-500">
                Landscape image placeholder
              </div>
            )}
          </div>
        </div>

        <div className="caption text-center max-w-2xl mt-3">
          <p className="font-bold">
            {block.number ? `Figure ${block.number}: ` : "Figure: "}
            {block.caption || (
              <span className="italic text-gray-500">Enter figure caption</span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">[Landscape orientation]</p>
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

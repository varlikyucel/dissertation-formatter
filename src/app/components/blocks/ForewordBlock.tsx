import React from "react";
import { ForewordBlock as ForewordBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ForewordBlockProps {
  block: ForewordBlockType;
  onUpdate?: (block: ForewordBlockType) => void;
}

export default function ForewordBlock({ block, onUpdate }: ForewordBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="foreword-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">FOREWORD</h2>
      </div>

      <div className="foreword-content prose max-w-none mb-12">
        {block.content || (
          <p className="italic text-gray-500">
            Your foreword text goes here. The foreword typically acknowledges
            individuals or organizations who contributed to your research or
            supported you during your studies.
          </p>
        )}
      </div>

      <div className="signature-section flex justify-between items-center mt-10">
        <div className="date">
          <p className="text-base">Date: {block.date}</p>
        </div>
        <div className="signature-area">
          <div className="border-b border-black w-48 h-10 flex items-end justify-center">
            {block.signature ? (
              <span className="mb-1">Signed</span>
            ) : (
              <span className="text-gray-400 mb-1">Signature</span>
            )}
          </div>
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

import React from "react";
import { DeclarationBlock as DeclarationBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface DeclarationBlockProps {
  block: DeclarationBlockType;
  onUpdate?: (block: DeclarationBlockType) => void;
}

export default function DeclarationBlock({
  block,
  onUpdate,
}: DeclarationBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="declaration-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">DECLARATION</h2>
      </div>

      <div className="declaration-content prose max-w-none mb-12">
        {block.content || (
          <p className="italic text-gray-500">
            Declaration text goes here. This will be provided in the template.
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

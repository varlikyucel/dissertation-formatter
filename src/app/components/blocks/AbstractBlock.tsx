import React from "react";
import { AbstractBlock as AbstractBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface AbstractBlockProps {
  block: AbstractBlockType;
  onUpdate?: (block: AbstractBlockType) => void;
}

export default function AbstractBlock({ block, onUpdate }: AbstractBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="abstract-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">ABSTRACT</h2>
      </div>

      <div className="abstract-content prose max-w-none mb-8">
        {block.content || (
          <p className="italic text-gray-500">
            Your abstract text goes here. The abstract should be a concise
            summary of your thesis, typically 150-300 words. It should include
            the purpose of the research, methodology, findings, and conclusions.
          </p>
        )}
      </div>

      <div className="keywords-section">
        <p className="font-bold mb-2">Keywords:</p>
        <p>
          {block.keywords && block.keywords.length > 0 ? (
            block.keywords.join(", ")
          ) : (
            <span className="italic text-gray-500">
              Add 3-5 keywords separated by commas
            </span>
          )}
        </p>
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

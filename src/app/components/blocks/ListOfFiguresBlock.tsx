import React from "react";
import { ListOfFiguresBlock as ListOfFiguresBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ListOfFiguresBlockProps {
  block: ListOfFiguresBlockType;
  onUpdate?: (block: ListOfFiguresBlockType) => void;
}

export default function ListOfFiguresBlock({
  block,
  onUpdate,
}: ListOfFiguresBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="list-of-figures-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">LIST OF FIGURES</h2>
      </div>

      <div className="figures-content">
        <p className="text-gray-500 italic">
          This section will be automatically generated when the document is
          compiled. It will include all figures with their captions and
          corresponding page numbers.
        </p>

        {/* Sample List of Figures preview */}
        <div className="figures-preview mt-6 space-y-2 text-sm">
          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Figure 1.1:</span> Sample figure
              caption for the first figure in chapter one
            </div>
            <div className="flex-shrink-0 ml-4">10</div>
          </div>
          <div className="flex items-end mb-2">
            <div className="grow border-b border-dotted border-gray-300 mx-1 mb-1"></div>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Figure 2.1:</span> Sample figure
              caption for the first figure in chapter two
            </div>
            <div className="flex-shrink-0 ml-4">15</div>
          </div>
          <div className="flex items-end mb-2">
            <div className="grow border-b border-dotted border-gray-300 mx-1 mb-1"></div>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Figure 3.1:</span> Sample figure
              caption for the first figure in chapter three
            </div>
            <div className="flex-shrink-0 ml-4">22</div>
          </div>
          <div className="flex items-end mb-2">
            <div className="grow border-b border-dotted border-gray-300 mx-1 mb-1"></div>
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

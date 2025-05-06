import React from "react";
import { ListOfTablesBlock as ListOfTablesBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ListOfTablesBlockProps {
  block: ListOfTablesBlockType;
  onUpdate?: (block: ListOfTablesBlockType) => void;
}

export default function ListOfTablesBlock({
  block,
  onUpdate,
}: ListOfTablesBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="list-of-tables-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">LIST OF TABLES</h2>
      </div>

      <div className="tables-content">
        <p className="text-gray-500 italic">
          This section will be automatically generated when the document is
          compiled. It will include all tables with their captions and
          corresponding page numbers.
        </p>

        {/* Sample List of Tables preview */}
        <div className="tables-preview mt-6 space-y-2 text-sm">
          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Table 1.1:</span> Sample table caption
              for the first table in chapter one
            </div>
            <div className="flex-shrink-0 ml-4">12</div>
          </div>
          <div className="flex items-end mb-2">
            <div className="grow border-b border-dotted border-gray-300 mx-1 mb-1"></div>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Table 2.1:</span> Sample table caption
              for the first table in chapter two
            </div>
            <div className="flex-shrink-0 ml-4">18</div>
          </div>
          <div className="flex items-end mb-2">
            <div className="grow border-b border-dotted border-gray-300 mx-1 mb-1"></div>
          </div>

          <div className="flex justify-between items-baseline">
            <div className="flex-grow">
              <span className="font-bold">Table 3.1:</span> Sample table caption
              for the first table in chapter three
            </div>
            <div className="flex-shrink-0 ml-4">25</div>
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

import React from "react";
import { TableOfContentsBlock as TableOfContentsBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface TableOfContentsBlockProps {
  block: TableOfContentsBlockType;
  onUpdate?: (block: TableOfContentsBlockType) => void;
}

export default function TableOfContentsBlock({
  block,
  onUpdate,
}: TableOfContentsBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="table-of-contents-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">TABLE OF CONTENTS</h2>
      </div>

      <div className="toc-content">
        <p className="text-gray-500 italic">
          This section will be automatically generated when the document is
          compiled. It will include all chapters, sections, and subsections with
          their corresponding page numbers.
        </p>

        {/* Sample TOC preview */}
        <div className="toc-preview mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <div>ABSTRACT</div>
            <div>ix</div>
          </div>
          <div className="flex justify-between">
            <div>INTRODUCTION</div>
            <div>1</div>
          </div>
          <div className="flex justify-between">
            <div className="pl-4">Background</div>
            <div>2</div>
          </div>
          <div className="flex justify-between">
            <div className="pl-8">Historical Context</div>
            <div>3</div>
          </div>
          <div className="flex items-end">
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

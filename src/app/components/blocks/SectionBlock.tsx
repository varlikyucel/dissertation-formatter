import React from "react";
import { SectionBlock as SectionBlockType } from "@/lib/types";
import BaseBlock from "./BaseBlock";
import { validateBlock } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface SectionBlockProps {
  block: SectionBlockType;
  onUpdate?: (block: SectionBlockType) => void;
}

export default function SectionBlock({ block, onUpdate }: SectionBlockProps) {
  const { isValid, errors } = validateBlock(block);

  const getTitleClassName = () => {
    const baseClasses = "font-bold mb-4";
    switch (block.level) {
      case 1:
        return cn(baseClasses, "text-lg capitalize"); // First level sections
      case 2:
        return cn(baseClasses, "text-base"); // Subsections
      case 3:
        return cn(baseClasses, "text-base"); // Sub-subsections
      case 4:
        return cn(baseClasses, "text-base italic"); // Fourth level
      case 5:
        return cn(baseClasses, "text-base"); // Fifth level (no numbering)
      default:
        return baseClasses;
    }
  };

  const formatSectionNumber = () => {
    if (block.level === 5) return ""; // No numbering for fifth level
    const prefix = block.parentNumber ? `${block.parentNumber}.` : "";
    return `${prefix}${block.title}`;
  };

  return (
    <BaseBlock block={block} className="section-block">
      <div className={getTitleClassName()}>{formatSectionNumber()}</div>

      <div className="section-content prose max-w-none">{block.content}</div>

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

import React from "react";
import { BaseBlock as BaseBlockType } from "@/lib/types";
import { getFormatRules } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface BaseBlockProps {
  block: BaseBlockType;
  className?: string;
  children?: React.ReactNode;
  onUpdate?: (block: BaseBlockType) => void;
}

export default function BaseBlock({
  block,
  className,
  children,
  onUpdate,
}: BaseBlockProps) {
  const formatRules = getFormatRules(block.type);

  const blockStyles = {
    fontSize: formatRules.fontSize,
    fontWeight: formatRules.fontWeight,
    textAlign: formatRules.alignment,
    marginTop: `${formatRules.spacing?.before}pt`,
    marginBottom: `${formatRules.spacing?.after}pt`,
    lineHeight: formatRules.spacing?.line,
  };

  return (
    <div className={cn("block w-full", className)} style={blockStyles}>
      {children}
    </div>
  );
}

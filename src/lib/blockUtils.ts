import { BlockType } from "./types";

/**
 * Maps technical block type IDs to human-readable display names
 */
export const getBlockDisplayName = (blockType: BlockType): string => {
  const displayNames: Record<BlockType, string> = {
    "title-page": "Title Page",
    "jury-approval": "Jury Approval",
    declaration: "Declaration",
    dedication: "Dedication",
    foreword: "Foreword",
    "table-of-contents": "Table of Contents",
    "list-of-abbreviations": "List of Abbreviations",
    "list-of-symbols": "List of Symbols",
    abstract: "Abstract",
    chapter: "Chapter",
    section: "Section",
    figure: "Figure",
    table: "Table",
    bibliography: "References",
    appendices: "Appendices",
    cv: "Curriculum Vitae",
    "list-of-figures": "List of Figures",
    "list-of-tables": "List of Tables",
    "turkish-title-page": "Turkish Title Page (Kapak)",
    "turkish-abstract": "Turkish Abstract (ÖZET)",
    subfigure: "Subfigure",
    "landscape-figure": "Landscape Figure",
    "landscape-table": "Landscape Table",
    "continued-table": "Continued Table",
    "inline-equation": "Inline Equation",
    "display-equation": "Display Equation",
    "multi-line-equation": "Multi-line Equation",
  };

  return displayNames[blockType] || blockType;
};

/**
 * Groups blocks into logical categories for UI organization
 */
export const getBlockCategory = (blockType: BlockType): string => {
  const frontMatter = [
    "title-page",
    "turkish-title-page",
    "jury-approval",
    "declaration",
    "dedication",
    "foreword",
  ];

  const tableOfContents = [
    "table-of-contents",
    "list-of-abbreviations",
    "list-of-symbols",
    "list-of-figures",
    "list-of-tables",
  ];

  const mainContent = ["abstract", "turkish-abstract", "chapter", "section"];

  const elements = [
    "figure",
    "subfigure",
    "landscape-figure",
    "table",
    "landscape-table",
    "continued-table",
    "inline-equation",
    "display-equation",
    "multi-line-equation",
  ];

  const backMatter = ["bibliography", "appendices", "cv"];

  if (frontMatter.includes(blockType)) return "Front Matter";
  if (tableOfContents.includes(blockType)) return "Table of Contents";
  if (mainContent.includes(blockType)) return "Main Content";
  if (elements.includes(blockType)) return "Elements";
  if (backMatter.includes(blockType)) return "Back Matter";

  return "Other";
};

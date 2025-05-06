import React from "react";
import { Block, BlockType } from "@/lib/types";
import { getBlockDisplayName } from "@/lib/blockUtils";
import TitlePageBlock from "./TitlePageBlock";
import ChapterBlock from "./ChapterBlock";
import SectionBlock from "./SectionBlock";
import JuryApprovalBlock from "./JuryApprovalBlock";
import DeclarationBlock from "./DeclarationBlock";
import DedicationBlock from "./DedicationBlock";
import ForewordBlock from "./ForewordBlock";
import TableOfContentsBlock from "./TableOfContentsBlock";
import ListOfAbbreviationsBlock from "./ListOfAbbreviationsBlock";
import ListOfSymbolsBlock from "./ListOfSymbolsBlock";
import AbstractBlock from "./AbstractBlock";
import FigureBlock from "./FigureBlock";
import TableBlock from "./TableBlock";
import BibliographyBlock from "./BibliographyBlock";
import AppendicesBlock from "./AppendicesBlock";
import CvBlock from "./CvBlock";
import ListOfFiguresBlock from "./ListOfFiguresBlock";
import ListOfTablesBlock from "./ListOfTablesBlock";
import TurkishTitlePageBlock from "./TurkishTitlePageBlock";
import TurkishAbstractBlock from "./TurkishAbstractBlock";
import SubfigureBlock from "./SubfigureBlock";
import LandscapeFigureBlock from "./LandscapeFigureBlock";
import LandscapeTableBlock from "./LandscapeTableBlock";
import ContinuedTableBlock from "./ContinuedTableBlock";
import InlineEquationBlock from "./InlineEquationBlock";
import DisplayEquationBlock from "./DisplayEquationBlock";
import MultiLineEquationBlock from "./MultiLineEquationBlock";

interface BlockFactoryProps {
  block: Block;
  onUpdate?: (block: Block) => void;
}

export default function BlockFactory({ block, onUpdate }: BlockFactoryProps) {
  switch (block.type) {
    case "title-page":
      return <TitlePageBlock block={block} onUpdate={onUpdate} />;

    case "turkish-title-page":
      return <TurkishTitlePageBlock block={block} onUpdate={onUpdate} />;

    case "jury-approval":
      return <JuryApprovalBlock block={block} onUpdate={onUpdate} />;

    case "declaration":
      return <DeclarationBlock block={block} onUpdate={onUpdate} />;

    case "dedication":
      return <DedicationBlock block={block} onUpdate={onUpdate} />;

    case "foreword":
      return <ForewordBlock block={block} onUpdate={onUpdate} />;

    case "table-of-contents":
      return <TableOfContentsBlock block={block} onUpdate={onUpdate} />;

    case "list-of-abbreviations":
      return <ListOfAbbreviationsBlock block={block} onUpdate={onUpdate} />;

    case "list-of-symbols":
      return <ListOfSymbolsBlock block={block} onUpdate={onUpdate} />;

    case "abstract":
      return <AbstractBlock block={block} onUpdate={onUpdate} />;

    case "turkish-abstract":
      return <TurkishAbstractBlock block={block} onUpdate={onUpdate} />;

    case "chapter":
      return <ChapterBlock block={block} onUpdate={onUpdate} />;

    case "section":
      return <SectionBlock block={block} onUpdate={onUpdate} />;

    case "figure":
      return <FigureBlock block={block} onUpdate={onUpdate} />;

    case "subfigure":
      return <SubfigureBlock block={block} onUpdate={onUpdate} />;

    case "landscape-figure":
      return <LandscapeFigureBlock block={block} onUpdate={onUpdate} />;

    case "table":
      return <TableBlock block={block} onUpdate={onUpdate} />;

    case "landscape-table":
      return <LandscapeTableBlock block={block} onUpdate={onUpdate} />;

    case "continued-table":
      return <ContinuedTableBlock block={block} onUpdate={onUpdate} />;

    case "inline-equation":
      return <InlineEquationBlock block={block} onUpdate={onUpdate} />;

    case "display-equation":
      return <DisplayEquationBlock block={block} onUpdate={onUpdate} />;

    case "multi-line-equation":
      return <MultiLineEquationBlock block={block} onUpdate={onUpdate} />;

    case "bibliography":
      return <BibliographyBlock block={block} onUpdate={onUpdate} />;

    case "appendices":
      return <AppendicesBlock block={block} onUpdate={onUpdate} />;

    case "cv":
      return <CvBlock block={block} onUpdate={onUpdate} />;

    case "list-of-figures":
      return <ListOfFiguresBlock block={block} onUpdate={onUpdate} />;

    case "list-of-tables":
      return <ListOfTablesBlock block={block} onUpdate={onUpdate} />;

    default:
      const blockType = (block as any).type || "unknown";
      const displayName = getBlockDisplayName(blockType as BlockType);

      return (
        <div className="p-4 border border-red-500 rounded">
          <p className="text-red-500">
            Block type "{displayName}" not implemented yet
          </p>
        </div>
      );
  }
}

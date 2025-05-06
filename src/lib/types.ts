export type BlockType =
  | "title-page"
  | "abstract"
  | "chapter"
  | "section"
  | "figure"
  | "table"
  | "bibliography"
  | "summary" // ITU specific
  | "appendices" // ITU specific
  | "cv"; // ITU specific

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  content: string; // Common field for text content
}

export interface TitlePageBlock extends BaseBlock {
  type: "title-page";
  title: string;
  author: string;
  department: string;
  university: string;
  date: string;
  studentId?: string; // ITU specific
  program?: string; // ITU specific
  supervisor?: string; // ITU specific
  degree?: string; // ITU specific
}

export interface AbstractBlock extends BaseBlock {
  type: "abstract";
}

export interface ChapterBlock extends BaseBlock {
  type: "chapter";
  title: string;
}

export interface SectionBlock extends BaseBlock {
  type: "section";
  title: string;
  level: number; // 1 for section, 2 for subsection, 3 for subsubsection
}

export interface FigureBlock extends BaseBlock {
  type: "figure";
  caption: string;
  label: string;
  imagePath: string; // URL or path to the image
}

export interface TableBlock extends BaseBlock {
  type: "table";
  caption: string;
  label: string;
  data: string[][]; // 2D array for table data
}

export interface BibliographyBlock extends BaseBlock {
  type: "bibliography";
}

export interface SummaryBlock extends BaseBlock {
  type: "summary";
}

export interface AppendicesBlock extends BaseBlock {
  type: "appendices";
}

export interface CvBlock extends BaseBlock {
  type: "cv";
}

// Union type for all block types
export type Block =
  | TitlePageBlock
  | AbstractBlock
  | ChapterBlock
  | SectionBlock
  | FigureBlock
  | TableBlock
  | BibliographyBlock
  | SummaryBlock
  | AppendicesBlock
  | CvBlock;

export interface Citation {
  id: string;
  type: string; // e.g., 'article', 'book', 'misc'
  title: string;
  author: string;
  year: string;
  [key: string]: any; // Allow additional fields like journal, volume, pages, etc.
}

export interface Project {
  id: string;
  title: string;
  blocks: Block[];
  citations: Citation[];
  template: string; // e.g., 'standard', 'itu'
  lastModified: number; // Timestamp
}

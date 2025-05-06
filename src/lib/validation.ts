import { Block, BlockType } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface FormatRule {
  fontSize: string;
  fontWeight?: string;
  case?: "uppercase" | "capitalize" | "sentence";
  spacing: {
    before: number;
    after: number;
    line: number;
  };
  alignment?: "left" | "center" | "right" | "justify";
}

// Validation rules for specific formatting requirements
const FORMAT_RULES: Record<string, FormatRule> = {
  CHAPTER_TITLE: {
    case: "uppercase",
    fontSize: "14pt",
    fontWeight: "bold",
    spacing: { before: 35, after: 23, line: 1.5 },
  },
  SECTION_TITLE: {
    case: "capitalize",
    fontSize: "12pt",
    fontWeight: "bold",
    spacing: { before: 23, after: 11.5, line: 1.5 },
  },
  SUBSECTION_TITLE: {
    case: "sentence",
    fontSize: "12pt",
    fontWeight: "bold",
    spacing: { before: 11.5, after: 11.5, line: 1.5 },
  },
  BODY_TEXT: {
    fontSize: "12pt",
    spacing: { before: 0, after: 11.5, line: 1.5 },
    alignment: "justify",
  },
  FIGURE_CAPTION: {
    fontSize: "11pt",
    fontWeight: "bold",
    spacing: { before: 11.5, after: 11.5, line: 1 },
    alignment: "center",
  },
  TABLE_CAPTION: {
    fontSize: "11pt",
    fontWeight: "bold",
    spacing: { before: 11.5, after: 11.5, line: 1 },
    alignment: "center",
  },
};

// Required fields for each block type
const REQUIRED_FIELDS: Record<BlockType, string[]> = {
  "title-page": [
    "title",
    "author",
    "department",
    "program",
    "advisor",
    "submissionDate",
    "defenseDate",
  ],
  "jury-approval": ["juryMembers", "defenseDate"],
  declaration: ["content", "date"],
  dedication: ["content"],
  foreword: ["content", "date"],
  "table-of-contents": [],
  "list-of-abbreviations": ["abbreviations"],
  "list-of-symbols": ["symbols"],
  abstract: ["content", "keywords"],
  chapter: ["title", "content", "number"],
  section: ["title", "content", "level"],
  figure: ["caption", "label", "imagePath"],
  table: ["caption", "label", "data"],
  bibliography: ["style"],
  appendices: ["appendices"],
  cv: ["personalInfo", "education"],
  "list-of-figures": [],
  "list-of-tables": [],
  "turkish-title-page": [
    "title",
    "author",
    "department",
    "program",
    "advisor",
    "submissionDate",
    "defenseDate",
  ],
  "turkish-abstract": ["content", "keywords"],
  subfigure: ["caption", "label", "subfigures"],
  "landscape-figure": ["caption", "label", "imagePath"],
  "landscape-table": ["caption", "label", "data"],
  "continued-table": ["caption", "label", "data"],
  "inline-equation": ["equation"],
  "display-equation": ["equation"],
  "multi-line-equation": ["equations"],
};

// Content validation rules
const CONTENT_RULES = {
  studentId: {
    pattern: /^\d{9}$/,
    message: "Student ID must be 9 digits",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format",
  },
  date: {
    pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    message: "Date must be in YYYY-MM-DD format",
  },
};

export function validateBlock(block: Block): ValidationResult {
  const errors: ValidationError[] = [];
  const requiredFields = REQUIRED_FIELDS[block.type];

  // Check required fields
  requiredFields.forEach((field) => {
    if (!hasField(block, field)) {
      errors.push({
        field,
        message: `${field} is required for ${block.type} block`,
      });
    }
  });

  // Type-specific validation
  switch (block.type) {
    case "title-page":
      validateTitlePage(block, errors);
      break;
    case "chapter":
      validateChapter(block, errors);
      break;
    case "section":
      validateSection(block, errors);
      break;
    case "figure":
      validateFigure(block, errors);
      break;
    case "table":
      validateTable(block, errors);
      break;
    // Add other block type validations...
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function hasField(obj: any, field: string): boolean {
  return field.split(".").reduce((o, i) => o && o[i], obj) !== undefined;
}

function validateTitlePage(block: any, errors: ValidationError[]) {
  if (block.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title must not exceed 200 characters",
    });
  }

  if (!CONTENT_RULES.studentId.pattern.test(block.author.studentId)) {
    errors.push({
      field: "studentId",
      message: CONTENT_RULES.studentId.message,
    });
  }
}

function validateChapter(block: any, errors: ValidationError[]) {
  if (block.number < 1) {
    errors.push({
      field: "number",
      message: "Chapter number must be positive",
    });
  }

  if (!block.title.match(/^[A-Z\s]+$/)) {
    errors.push({
      field: "title",
      message: "Chapter title must be in uppercase",
    });
  }
}

function validateSection(block: any, errors: ValidationError[]) {
  if (block.level < 1 || block.level > 5) {
    errors.push({
      field: "level",
      message: "Section level must be between 1 and 5",
    });
  }

  if (!block.parentNumber && block.level > 1) {
    errors.push({
      field: "parentNumber",
      message: "Parent number is required for nested sections",
    });
  }
}

function validateFigure(block: any, errors: ValidationError[]) {
  if (!block.imagePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
    errors.push({
      field: "imagePath",
      message: "Image must be jpg, jpeg, png, or gif",
    });
  }

  if (!block.label.match(/^fig:/)) {
    errors.push({
      field: "label",
      message: 'Figure label must start with "fig:"',
    });
  }
}

function validateTable(block: any, errors: ValidationError[]) {
  if (!block.label.match(/^tab:/)) {
    errors.push({
      field: "label",
      message: 'Table label must start with "tab:"',
    });
  }

  if (!Array.isArray(block.data) || block.data.length === 0) {
    errors.push({
      field: "data",
      message: "Table must have at least one row",
    });
  }
}

export const getFormatRules = (blockType: BlockType, level?: number) => {
  switch (blockType) {
    case "chapter":
      return FORMAT_RULES.CHAPTER_TITLE;
    case "section":
      // Different formatting based on section level
      if (level === 2) {
        return FORMAT_RULES.SUBSECTION_TITLE;
      } else if (level === 3 || level === 4 || level === 5) {
        return FORMAT_RULES.SUBSUBSECTION_TITLE;
      }
      return FORMAT_RULES.SECTION_TITLE;
    case "figure":
      return FORMAT_RULES.FIGURE_CAPTION;
    case "table":
      return FORMAT_RULES.TABLE_CAPTION;
    default:
      return FORMAT_RULES.BODY_TEXT;
  }
};

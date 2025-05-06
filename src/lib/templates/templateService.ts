import fs from "fs";
import path from "path";
import {
  Block,
  BlockType,
  Project,
  Citation,
  TitlePageBlock,
  JuryApprovalBlock,
  ChapterBlock,
  SectionBlock,
  FigureBlock,
  TableBlock,
  BibliographyBlock,
  AbstractBlock,
  AppendicesBlock,
  CvBlock,
  TurkishAbstractBlock,
} from "../types";
import os from "os";

// Constants for template insertion points
const TITLE_PAGE_MARKER = "%TITLE_PAGE%";
const ABSTRACT_MARKER = "%ABSTRACT%";
const CONTENT_MARKER = "%CONTENT%";
const BIBLIOGRAPHY_MARKER = "%BIBLIOGRAPHY%";

// Additional markers for ITU template
const TITLE_MARKER = "%TITLE%";
const AUTHOR_MARKER = "%AUTHOR%";
const STUDENT_ID_MARKER = "%STUDENT_ID%";
const DEPARTMENT_MARKER = "%DEPARTMENT%";
const PROGRAM_MARKER = "%PROGRAM%";
const SUPERVISOR_MARKER = "%SUPERVISOR%";
const DEGREE_MARKER = "%DEGREE%";
const DATE_MARKER = "%DATE%";
const SUMMARY_MARKER = "%SUMMARY%";
const APPENDICES_MARKER = "%APPENDICES%";
const CV_MARKER = "%CV%";

// Path to template directory based on environment
const templatesDir =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "templates")
    : path.join(process.cwd(), "src", "lib", "templates", "latex");

/**
 * Load a LaTeX template by name
 */
export function loadTemplate(templateName: string): string {
  const templatePath = path.join(templatesDir, `${templateName}.tex`);

  try {
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
}

/**
 * Generate a BibTeX file from citation data
 */
export function generateBibTeX(citations: Citation[]): string {
  return citations
    .map((citation) => {
      const { id, type, title, author, year, ...fields } = citation;

      // Start BibTeX entry
      let entry = `@${type}{${id},\n`;

      // Add required fields
      entry += `  title = {${title}},\n`;
      entry += `  author = {${author}},\n`;
      entry += `  year = {${year}},\n`;

      // Add optional fields
      for (const [key, value] of Object.entries(fields)) {
        if (value) {
          entry += `  ${key} = {${value}},\n`;
        }
      }

      // Close the entry
      entry += "}\n";

      return entry;
    })
    .join("\n");
}

/**
 * Generate LaTeX for a title page
 */
function generateTitlePage(block: Block): string {
  if (block.type !== "title-page") return "";

  const titleBlock = block as TitlePageBlock;

  return `
\\title{${titleBlock.title}}
\\author{${titleBlock.author.name}}
\\department{${titleBlock.department}}
\\institute{${titleBlock.advisor.institution}}
\\date{${titleBlock.submissionDate}}
\\maketitle
  `.trim();
}

/**
 * Generate LaTeX for an abstract
 */
function generateAbstract(block: Block): string {
  if (block.type !== "abstract") return "";

  return `
\\begin{abstract}
${block.content}
\\end{abstract}
  `.trim();
}

/**
 * Generate LaTeX for a chapter
 */
function generateChapter(block: Block): string {
  if (block.type !== "chapter") return "";

  return `
\\chapter{${block.title}}
${block.content}
  `.trim();
}

/**
 * Generate LaTeX for a section, subsection, or subsubsection
 */
function generateSection(block: Block): string {
  if (block.type !== "section") return "";

  let command: string;
  switch (block.level) {
    case 2:
      command = "section";
      break;
    case 3:
      command = "subsection";
      break;
    case 4:
      command = "subsubsection";
      break;
    case 5:
      // For level 5, we use formatting with no numbering
      // (handled in template with \setcounter{secnumdepth}{3})
      return `
{\\normalfont\\normalsize\\bfseries ${block.title}}

${block.content}
      `.trim();
    default:
      command = "section";
  }

  return `
\\${command}{${block.title}}
${block.content}
  `.trim();
}

/**
 * Generate LaTeX for a figure
 */
function generateFigure(block: Block): string {
  if (block.type !== "figure") return "";

  return `
\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.8\\textwidth]{${block.imagePath}}
  \\caption{${block.caption}}
  \\label{fig:${block.label}}
\\end{figure}
  `.trim();
}

/**
 * Generate LaTeX for a table
 */
function generateTable(block: Block): string {
  if (block.type !== "table") return "";

  const numCols = block.data[0]?.length || 0;
  if (numCols === 0) return "";

  // Create column definition for tabular environment (centered columns)
  const colDef = Array(numCols).fill("c").join(" | ");

  // Create table header row
  const headers = block.data[0]
    .map((header: string) => `\\textbf{${header}}`)
    .join(" & ");

  // Create data rows
  const rows = block.data
    .slice(1)
    .map((row: string[]) => row.join(" & "))
    .join(" \\\\\n  ");

  return `
\\begin{table}[htbp]
  \\centering
  \\begin{tabular}{|${colDef}|}
    \\hline
    ${headers} \\\\
    \\hline
    ${rows} \\\\
    \\hline
  \\end{tabular}
  \\caption{${block.caption}}
  \\label{tab:${block.label}}
\\end{table}
  `.trim();
}

/**
 * Generate LaTeX for a bibliography command
 */
function generateBibliographyCommand(block: Block): string {
  if (block.type !== "bibliography") return "";

  return `
\\bibliography{references}
\\bibliographystyle{plain}
  `.trim();
}

/**
 * Generate LaTeX content for a block
 */
function generateBlockContent(block: Block): string {
  switch (block.type) {
    case "title-page":
      return generateTitlePage(block);
    case "abstract":
      return generateAbstract(block);
    case "chapter":
      return generateChapter(block);
    case "section":
      return generateSection(block);
    case "figure":
      return generateFigure(block);
    case "table":
      return generateTable(block);
    case "bibliography":
      return generateBibliographyCommand(block);
    default:
      return "";
  }
}

/**
 * Copy template files needed for compilation
 */
export function copyItuTemplateFiles(workDir: string) {
  console.log("Copying ITU template files to:", workDir);

  // Define the correct path to the ITU template files
  const templateDir = path.join(
    process.cwd(),
    "src",
    "lib",
    "templates",
    "latex",
    "itu"
  );

  // Ensure the target working directory exists (should already exist but good practice)
  fs.mkdirSync(workDir, { recursive: true });

  // Ensure the necessary directories exist in the working directory
  fs.mkdirSync(path.join(workDir, "figures"), { recursive: true });

  // List of essential ITU template files to copy
  const essentialFiles = [
    "itutez.cls", // The thesis document class
    "defs.tex", // Template definitions
    "itubib.bst", // Bibliography style
  ];

  // Create empty placeholder files for required inputs
  const placeholderFiles = [
    "onsoz.tex",
    "kisaltmalar.tex",
    "semboller.tex",
    "ozet.tex",
    "summary.tex",
    "eklerkapak.tex",
    "ekler.tex",
    "ozgecmis.tex",
    "tez.bib", // Empty bibliography file
  ];

  // Create empty chapter files
  const chapterFiles = [
    "ch1.tex",
    "ch2.tex",
    "ch3.tex",
    "ch4.tex",
    "ch5.tex",
    "ch6.tex",
  ];

  try {
    // Copy essential files if they exist in the templates folder
    for (const file of essentialFiles) {
      const sourcePath = path.join(templateDir, file);
      const destPath = path.join(workDir, file);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied template file: ${file}`);
      } else {
        // If template files don't exist, create minimal versions
        console.error(
          `Essential template file ${file} not found at ${sourcePath}, cannot proceed.`
        );
        // We should probably throw an error here instead of creating placeholders for essential files
        throw new Error(`Essential template file not found: ${file}`);
      }
    }

    // Create empty placeholder files ONLY if they don't exist (prevents overwriting content files later)
    for (const file of placeholderFiles) {
      const filePath = path.join(workDir, file);
      if (!fs.existsSync(filePath)) {
        // Simplified: Just create empty files for these placeholders
        // The actual content will be written by createItuContentFiles
        fs.writeFileSync(filePath, `% Placeholder for ${file}`);
        console.log(`Created placeholder file: ${file}`);
      }
    }

    // Create chapter files placeholders ONLY if they don't exist
    for (const file of chapterFiles) {
      const filePath = path.join(workDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `% Placeholder for ${file}`);
        console.log(`Created placeholder chapter file: ${file}`);
      }
    }

    console.log("Essential ITU template files copied successfully");
  } catch (error) {
    console.error("Error copying ITU template files:", error);
    throw error;
  }
}

/**
 * Create content files for ITU template
 */
export function createItuContentFiles(workDir: string, project: Project) {
  console.log("Creating ITU content files in:", workDir);

  const { blocks } = project;
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Find blocks by type
  const abstractBlock = sortedBlocks.find(
    (block): block is AbstractBlock => block.type === "abstract"
  );
  const turkishAbstractBlock = sortedBlocks.find(
    (block): block is TurkishAbstractBlock => block.type === "turkish-abstract"
  );
  const cvBlock = sortedBlocks.find(
    (block): block is CvBlock => block.type === "cv"
  );
  const appendicesBlock = sortedBlocks.find(
    (block): block is AppendicesBlock => block.type === "appendices"
  );

  // Create content files with proper content
  if (abstractBlock?.content) {
    console.log("Creating abstract file (summary.tex)");
    fs.writeFileSync(path.join(workDir, "summary.tex"), abstractBlock.content);
  }

  if (turkishAbstractBlock?.content) {
    console.log("Creating turkish abstract file (ozet.tex)");
    fs.writeFileSync(
      path.join(workDir, "ozet.tex"),
      turkishAbstractBlock.content
    );
  } else if (abstractBlock?.content) {
    // If no turkish abstract but abstract exists, use abstract as turkish abstract too
    console.log("No turkish abstract found, using abstract for ozet.tex");
    fs.writeFileSync(path.join(workDir, "ozet.tex"), abstractBlock.content);
  }

  if (cvBlock?.content) {
    console.log("Creating CV file (ozgecmis.tex)");
    fs.writeFileSync(path.join(workDir, "ozgecmis.tex"), cvBlock.content);
  }

  if (appendicesBlock?.content) {
    console.log("Creating appendices file (ekler.tex)");
    fs.writeFileSync(path.join(workDir, "ekler.tex"), appendicesBlock.content);
  }

  // Create chapter files
  const chapterBlocks = sortedBlocks.filter(
    (block): block is ChapterBlock => block.type === "chapter"
  );

  for (let i = 0; i < Math.min(chapterBlocks.length, 6); i++) {
    const chapterNum = i + 1;
    const chapterBlock = chapterBlocks[i];
    let chapterContent = `\\chapter{${chapterBlock.title}}\n\n${
      chapterBlock.content || ""
    }`;

    // Add section content to chapter
    const sectionBlocks = sortedBlocks.filter(
      (block): block is SectionBlock =>
        block.type === "section" &&
        sortedBlocks.findIndex((b) => b.id === block.id) >
          sortedBlocks.findIndex((b) => b.id === chapterBlock.id) &&
        (i === chapterBlocks.length - 1 ||
          sortedBlocks.findIndex((b) => b.id === block.id) <
            sortedBlocks.findIndex((b) => b.id === chapterBlocks[i + 1]?.id))
    );

    for (const block of sectionBlocks) {
      let sectionCmd = "section";
      if (block.level === 2) sectionCmd = "subsection";
      if (block.level === 3) sectionCmd = "subsubsection";
      chapterContent += `\n\n\\${sectionCmd}{${block.title}}\n\n${
        block.content || ""
      }`;
    }

    console.log(`Creating chapter file ch${chapterNum}.tex`);
    fs.writeFileSync(path.join(workDir, `ch${chapterNum}.tex`), chapterContent);
  }

  // Create empty chapter files for any chapters that don't exist up to 6
  for (let i = chapterBlocks.length; i < 6; i++) {
    const chapterNum = i + 1;
    const filePath = path.join(workDir, `ch${chapterNum}.tex`);
    if (!fs.existsSync(filePath)) {
      const emptyChapterContent = `\\chapter{Chapter ${chapterNum} (Empty)}

% This chapter is required by the ITU template but has no content in your document structure.`;
      console.log(`Creating empty chapter file ch${chapterNum}.tex`);
      fs.writeFileSync(filePath, emptyChapterContent);
    }
  }

  // Ensure placeholder files exist if not created by content blocks
  const requiredPlaceholders = [
    "onsoz.tex",
    "kisaltmalar.tex",
    "semboller.tex",
    "ozet.tex", // Ensure these exist even if abstractBlock is null
    "summary.tex", // Ensure these exist even if summaryBlock/abstractBlock is null
    "eklerkapak.tex",
    "ekler.tex", // Ensure this exists even if appendicesBlock is null
    "ozgecmis.tex", // Ensure this exists even if cvBlock is null
  ];

  for (const file of requiredPlaceholders) {
    const filePath = path.join(workDir, file);
    if (!fs.existsSync(filePath)) {
      // Use minimal placeholder content from copyItuTemplateFiles logic (or just empty comment)
      let content = `% Placeholder for ${file}`;
      // Add specific minimal content if necessary based on copyItuTemplateFiles placeholders
      if (file === "onsoz.tex")
        content =
          "Bu tezin hazırlanmasında yardımlarını esirgemeyen değerli hocam ...";
      // Add others as needed...
      fs.writeFileSync(filePath, content);
      console.log(`Ensuring placeholder file exists: ${file}`);
    }
  }

  console.log("All ITU content files created successfully");
}

/**
 * Generate LaTeX for the ITU template
 */
function generateItuTemplate(project: Project): string {
  const { blocks } = project;

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Extract blocks by type
  const titlePageBlock = sortedBlocks.find(
    (block) => block.type === "title-page"
  );
  const abstractBlock = sortedBlocks.find((block) => block.type === "abstract");
  const turkishAbstractBlock = sortedBlocks.find(
    (block) => block.type === "turkish-abstract"
  );
  const appendicesBlock = sortedBlocks.find(
    (block) => block.type === "appendices"
  );
  const cvBlock = sortedBlocks.find((block) => block.type === "cv");

  // Chapter blocks
  const chapterBlocks = sortedBlocks.filter(
    (block) => block.type === "chapter"
  );

  // Create a complete template from scratch
  let templateContent = `% ---------------------------------------------------------------- %
%                     LATEX Thesis Template                              %
%                                                                        %
%                   Istanbul Technical University                        %
% ---------------------------------------------------------------- %

\\documentclass[onluarkali,ingilizce,yukseklisans,bez,LisansustuEgitim]{itutez}

% Define author information
\\yazar{${titlePageBlock?.author.name.split(" ")[0] || "Name"}}{${
    titlePageBlock?.author.name.split(" ")[1]?.toUpperCase() || "SURNAME"
  }}
\\ogrencino{${titlePageBlock?.author.studentId || "123456789"}}

% Define department and program
\\anabilimdali{Department Turkish}{${
    titlePageBlock?.department || "Department of Science"
  }}
\\programi{Program Turkish}{${titlePageBlock?.program || "Science Program"}}

% Define dates
\\tarih{MONTH YEAR IN TURKISH}{${
    titlePageBlock?.submissionDate || "January 2024"
  }}
\\tarihKucuk{month year in Turkish}{${
    titlePageBlock?.submissionDate?.toLowerCase() || "january 2024"
  }}

% Define advisor information
\\tezyoneticisi{${titlePageBlock?.advisor?.title || "Prof. Dr."} ${
    titlePageBlock?.advisor?.name || "Advisor Name"
  }}{${titlePageBlock?.advisor?.institution || "Istanbul Technical University"}}
\\tezyoneticisiTR{${titlePageBlock?.advisor?.title || "Prof. Dr."} ${
    titlePageBlock?.advisor?.name || "Advisor Name TR"
  }}{İstanbul Teknik Üniversitesi}
\\unvan{${titlePageBlock?.advisor?.title || "Prof. Dr."}}

% Define co-advisor information (if any)
\\esdanismani{${
    titlePageBlock?.coAdvisor
      ? `${titlePageBlock.coAdvisor.title} ${titlePageBlock.coAdvisor.name}`
      : ""
  }}{${titlePageBlock?.coAdvisor?.institution || ""}} 
\\esdanismaniTR{${
    titlePageBlock?.coAdvisor
      ? `${titlePageBlock.coAdvisor.title} ${titlePageBlock.coAdvisor.name}`
      : ""
  }}{${titlePageBlock?.coAdvisor ? "İstanbul Teknik Üniversitesi" : ""}}

% Define thesis title
\\title{${titlePageBlock?.title || "Thesis Title"}}{}{} 
\\baslikENG{${titlePageBlock?.title || "Thesis Title"}}{}{} 
\\baslik{Thesis Title in Turkish}{}{} 

% Define submission and defense dates
\\tezvermetarih{${titlePageBlock?.submissionDate || "22 September 2024"}}{${
    titlePageBlock?.submissionDate || "22 September 2024"
  }}
\\tezsavunmatarih{${titlePageBlock?.defenseDate || "21 December 2024"}}{${
    titlePageBlock?.defenseDate || "21 December 2024"
  }}

% Define jury members
\\juriBir{Prof. Dr. Name SURNAME}{University Name}
\\juriIki{Prof. Dr. Name SURNAME}{University Name}
\\juriUc{Prof. Dr. Name SURNAME}{University Name}
\\juriDort{Assoc. Prof. Dr. Name SURNAME}{University Name}
\\juriBes{Assoc. Prof. Dr. Name SURNAME}{University Name}

\\input defs.tex

% Dedication page
\\ithaf{To my family and friends,}

% Front matter sections
\\onsoz{\\input onsoz.tex}
\\kisaltmalistesi{\\input kisaltmalar.tex}
\\sembollistesi{\\input semboller.tex}
\\ozet{\\input ozet.tex}
\\summary{\\input summary.tex}

\\usepackage{afterpage}
\\usepackage{tocloft}

\\renewcommand{\\cftfigpagefont}{\\bfseries}
\\renewcommand{\\cfttabpagefont}{\\bfseries}
\\renewcommand{\\cftpartleader}{\\cftdotfill{\\cftdotsep}}
\\renewcommand{\\cftchapleader}{\\cftdotfill{\\cftdotsep}}

\\setlength{\\cftfigindent}{0pt}
\\renewcommand{\\cftfigpresnum}{\\bfseries Figure }
\\setlength{\\cftfignumwidth}{5.5em}
\\renewcommand{\\cftfigaftersnum}{: }
\\renewcommand{\\cftdotsep}{1}

\\setlength{\\cfttabindent}{0pt}
\\renewcommand{\\cfttabpresnum}{\\bfseries Table }
\\setlength{\\cfttabnumwidth}{5em}
\\renewcommand{\\cfttabaftersnum}{: }

\\setlength{\\cftchapnumwidth}{1.6em}
\\setlength{\\cftsecnumwidth}{1.6em}
\\setlength{\\cftsubsecnumwidth}{2.4em}
\\setlength{\\cftsubsubsecnumwidth}{3.2em}

\\setlength{\\cftpartindent}{0em}
\\setlength{\\cftchapindent}{0em}
\\setlength{\\cftsecindent}{1.1em}
\\setlength{\\cftsubsecindent}{1.9em}
\\setlength{\\cftsubsubsecindent}{2.7em}

\\setlength{\\cftbeforechapskip}{1.055em}
\\setlength{\\cftbeforesecskip}{0.035em}
\\setlength{\\cftbeforesubsecskip}{0.035em}

\\setlength{\\cfttabindent}{0em}
\\renewcommand{\\cfttabpresnum}{\\bfseries Table }
\\setlength{\\cfttabnumwidth}{5em}
\\renewcommand{\\cfttabaftersnum}{: }

\\renewcommand\\cftaftertoctitle{\\hfill\\null\\\\\\\\null\\hfill\\bf\\underline{Page}}
\\renewcommand\\cftafterloftitle{\\hfill\\null\\\\\\\\\\null\\hfill\\bf\\underline{Page}}
\\renewcommand\\cftafterlottitle{\\hfill\\null\\\\\\\\\\null\\hfill\\bf\\underline{Page}}

\\renewcommand{\\cftafterloftitleskip}{10pt}
\\renewcommand{\\cftafterlottitleskip}{10pt}

\\usepackage{atbegshi}
\\AtBeginDocument{\\AtBeginShipoutNext{\\AtBeginShipoutDiscard}}
\\usepackage{graphicx}

% --- FIX for itutez.cls bug --- 
% Define \th@Instituteiki if not defined (needed internally by the class)
\\makeatletter
\\@ifundefined{th@Instituteiki}{\\def\\th@Instituteiki{}}{} % Def as empty if undef
\\makeatother
% --- END FIX ---

\\begin{document}

`;

  // Add content from chapters
  // Add content from chapters and their sections
  for (let i = 0; i < Math.min(chapterBlocks.length, 6); i++) {
    const chapterBlock = chapterBlocks[i];
    const chapterNumber = i + 1;

    templateContent += `\\input ch${chapterNumber}.tex\n`;
  }

  // Fill in remaining chapter inputs if needed
  for (let i = chapterBlocks.length; i < 6; i++) {
    const chapterNumber = i + 1;
    templateContent += `\\input ch${chapterNumber}.tex\n`;
  }

  // Add bibliography
  templateContent += `
% Bibliography
\\bibliographystyle{itubib}
\\bibliography{tez}

% Appendix
\\eklerkapak{}
\\input eklerkapak.tex

\\eklerbolum{0}
\\input ekler.tex

% CV
\\ozgecmis{\\input ozgecmis.tex}

\\end{document}
`;

  return templateContent;
}

/**
 * Merge project data into a LaTeX template
 */
export function generateLaTeXDocument(project: Project): string {
  const { template } = project;

  // Use ITU-specific template generator if template is "itu"
  if (template === "itu") {
    return generateItuTemplate(project);
  }

  // For other templates, use the existing code
  const { blocks } = project;

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Load template
  let templateContent = loadTemplate(template);

  // Extract blocks by type
  const titlePageBlock = sortedBlocks.find(
    (block) => block.type === "title-page"
  );
  const abstractBlock = sortedBlocks.find((block) => block.type === "abstract");
  const bibliographyBlock = sortedBlocks.find(
    (block) => block.type === "bibliography"
  );

  // Additional blocks for ITU template
  const turkishAbstractBlock = sortedBlocks.find(
    (block) => block.type === "turkish-abstract"
  );
  const appendicesBlock = sortedBlocks.find(
    (block) => block.type === "appendices"
  );
  const cvBlock = sortedBlocks.find((block) => block.type === "cv");

  // Content blocks (everything except title page, abstract, bibliography, turkish-abstract, appendices, cv)
  const contentBlocks = sortedBlocks.filter(
    (block) =>
      block.type !== "title-page" &&
      block.type !== "abstract" &&
      block.type !== "bibliography" &&
      block.type !== "turkish-abstract" &&
      block.type !== "appendices" &&
      block.type !== "cv"
  );

  // Replace markers in template
  if (titlePageBlock && titlePageBlock.type === "title-page") {
    if (template === "itu") {
      // For ITU template, replace individual fields
      templateContent = templateContent
        .replace(TITLE_MARKER, titlePageBlock.title)
        .replace(AUTHOR_MARKER, titlePageBlock.author.name || "")
        .replace(DEPARTMENT_MARKER, titlePageBlock.department)
        .replace(DATE_MARKER, titlePageBlock.submissionDate || "");

      // Set default values for ITU-specific fields if not provided
      templateContent = templateContent
        .replace(STUDENT_ID_MARKER, titlePageBlock.author.studentId || "")
        .replace(PROGRAM_MARKER, titlePageBlock.program || "")
        .replace(SUPERVISOR_MARKER, titlePageBlock.advisor?.name || "")
        .replace(DEGREE_MARKER, "Master of Science");
    } else {
      // For standard template, use the title page marker
      templateContent = templateContent.replace(
        TITLE_PAGE_MARKER,
        generateBlockContent(titlePageBlock)
      );
    }
  }

  if (abstractBlock) {
    templateContent = templateContent.replace(
      ABSTRACT_MARKER,
      abstractBlock.content
    );
  }

  // Generate main content
  const contentLaTeX = contentBlocks
    .map((block) => generateBlockContent(block))
    .join("\n\n");

  templateContent = templateContent.replace(CONTENT_MARKER, contentLaTeX);

  // Add bibliography if present
  if (bibliographyBlock) {
    templateContent = templateContent.replace(
      BIBLIOGRAPHY_MARKER,
      generateBlockContent(bibliographyBlock)
    );
  } else {
    templateContent = templateContent.replace(BIBLIOGRAPHY_MARKER, "");
  }

  // Handle ITU-specific blocks
  if (template === "itu") {
    // Replace turkish-abstract content as summary
    if (turkishAbstractBlock && turkishAbstractBlock.content) {
      templateContent = templateContent.replace(
        SUMMARY_MARKER,
        turkishAbstractBlock.content
      );
    } else if (abstractBlock && abstractBlock.content) {
      // Fallback to abstract
      templateContent = templateContent.replace(
        SUMMARY_MARKER,
        abstractBlock.content
      );
    } else {
      templateContent = templateContent.replace(SUMMARY_MARKER, "");
    }

    // Replace appendices content
    if (appendicesBlock && appendicesBlock.content) {
      templateContent = templateContent.replace(
        APPENDICES_MARKER,
        appendicesBlock.content
      );
    } else {
      templateContent = templateContent.replace(APPENDICES_MARKER, "");
    }

    // Replace CV content
    if (cvBlock && cvBlock.content) {
      templateContent = templateContent.replace(CV_MARKER, cvBlock.content);
    } else {
      templateContent = templateContent.replace(CV_MARKER, "");
    }
  }

  return templateContent;
}

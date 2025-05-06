import fs from "fs";
import path from "path";
import { Block, Citation, Project, ChapterBlock, SectionBlock } from "../types";
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

  return `
\\title{${block.title}}
\\author{${block.author}}
\\department{${block.department}}
\\university{${block.university}}
\\date{${block.date}}
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
    case 1:
      command = "section";
      break;
    case 2:
      command = "subsection";
      break;
    case 3:
      command = "subsubsection";
      break;
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

      // --- DEBUG LOGGING ---
      console.log(`Checking for essential file at source path: ${sourcePath}`);
      // --- END DEBUG LOGGING ---

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied template file: ${file}`);
      } else {
        // If template files don't exist, create minimal versions
        console.log(`Template file ${file} not found, creating placeholder`);
        if (file === "itutez.cls") {
          // Create a minimal document class file
          fs.writeFileSync(
            destPath,
            `\\NeedsTeXFormat{LaTeX2e}
\\ProvidesClass{itutez}[2023/01/01 ITU Thesis Class]
\\LoadClass[12pt,a4paper]{report}
\\RequirePackage{geometry}
\\geometry{margin=2.5cm}
\\RequirePackage{graphicx}
\\RequirePackage{natbib}
\\newcommand{\\yazar}[2]{\\author{#1 #2}}
\\newcommand{\\ogrencino}[1]{\\def\\@ogrencino{#1}}
\\newcommand{\\unvan}[1]{\\def\\@unvan{#1}}
\\newcommand{\\anabilimdali}[2]{\\def\\@anabilimdali{#2}}
\\newcommand{\\programi}[2]{\\def\\@programi{#2}}
\\newcommand{\\tarih}[2]{\\def\\@tarih{#2}}
\\newcommand{\\tarihKucuk}[2]{\\def\\@tarihKucuk{#2}}
\\newcommand{\\tezyoneticisi}[2]{\\def\\@tezyoneticisi{#1}\\def\\@tezyoneticisiUniv{#2}}
\\newcommand{\\tezyoneticisiTR}[2]{\\def\\@tezyoneticisiTR{#1}\\def\\@tezyoneticisiUnivTR{#2}}
\\newcommand{\\esdanismani}[2]{\\def\\@esdanismani{#1}\\def\\@esdanismaniUniv{#2}}
\\newcommand{\\esdanismaniTR}[2]{\\def\\@esdanismaniTR{#1}\\def\\@esdanismaniUnivTR{#2}}
\\newcommand{\\title}[3]{\\def\\@title{#1 #2 #3}}
\\newcommand{\\baslikENG}[3]{\\def\\@baslikENG{#1 #2 #3}}
\\newcommand{\\baslik}[3]{\\def\\@baslik{#1 #2 #3}}
\\newcommand{\\tezvermetarih}[2]{\\def\\@tezvermetarih{#2}}
\\newcommand{\\tezsavunmatarih}[2]{\\def\\@tezsavunmatarih{#2}}
\\newcommand{\\juriBir}[2]{\\def\\@juriBir{#1}\\def\\@juriBirUniv{#2}}
\\newcommand{\\juriIki}[2]{\\def\\@juriIki{#1}\\def\\@juriIkiUniv{#2}}
\\newcommand{\\juriUc}[2]{\\def\\@juriUc{#1}\\def\\@juriUcUniv{#2}}
\\newcommand{\\juriDort}[2]{\\def\\@juriDort{#1}\\def\\@juriDortUniv{#2}}
\\newcommand{\\juriBes}[2]{\\def\\@juriBes{#1}\\def\\@juriBesUniv{#2}}
\\newcommand{\\ithaf}[1]{\\def\\@ithaf{#1}}
\\newcommand{\\onsoz}[1]{\\def\\@onsoz{#1}}
\\newcommand{\\kisaltmalistesi}[1]{\\def\\@kisaltmalistesi{#1}}
\\newcommand{\\sembollistesi}[1]{\\def\\@sembollistesi{#1}}
\\newcommand{\\ozet}[1]{\\def\\@ozet{#1}}
\\newcommand{\\summary}[1]{\\def\\@summary{#1}}
\\newcommand{\\ozgecmis}[1]{\\def\\@ozgecmis{#1}}
\\newcommand{\\eklerkapak}[1]{\\appendix}
\\newcommand{\\eklerbolum}[1]{}
\\begin{document}
\\maketitle
\\tableofcontents
\\end{document}`
          );
        } else if (file === "defs.tex") {
          fs.writeFileSync(
            destPath,
            `% Standard definitions for ITU thesis
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{natbib}
\\usepackage{hyperref}
\\usepackage{tocloft}
\\usepackage{afterpage}`
          );
        } else if (file === "itubib.bst") {
          // Create a simple bibliography style file as before
          fs.writeFileSync(
            destPath,
            `% ITU bibliography style file - minimal version`
          );
        }
      }
    }

    // Create empty placeholder files with actual content
    for (const file of placeholderFiles) {
      const filePath = path.join(workDir, file);
      // Only create if it doesn't exist
      if (!fs.existsSync(filePath)) {
        if (file === "tez.bib") {
          // Create a minimal bibliography file with one sample entry
          fs.writeFileSync(
            filePath,
            `@article{smith2020,
  author = {Smith, John},
  title = {Sample Article Title},
  journal = {Journal of Examples},
  year = {2020},
  volume = {10},
  number = {2},
  pages = {123--145}
}`
          );
        } else if (file === "ozet.tex") {
          fs.writeFileSync(
            filePath,
            `Bu tez, placeholder metin içermektedir. Lütfen tezinizin özetini buraya ekleyin. Bu metin, gerçek bir özet değildir ve sadece şablon oluşturmak için kullanılmıştır.`
          );
        } else if (file === "summary.tex") {
          fs.writeFileSync(
            filePath,
            `This thesis contains placeholder text. Please add your thesis summary here. This text is not a real summary and is used only for template generation.`
          );
        } else if (file === "onsoz.tex") {
          fs.writeFileSync(
            filePath,
            `Bu tezin hazırlanmasında yardımlarını esirgemeyen değerli hocam ...`
          );
        } else if (file === "kisaltmalar.tex") {
          fs.writeFileSync(
            filePath,
            `\\begin{array}{ll}
ITU & Istanbul Technical University\\\\
IEEE & Institute of Electrical and Electronics Engineers\\\\
CPU & Central Processing Unit\\\\
AI & Artificial Intelligence
\\end{array}`
          );
        } else if (file === "semboller.tex") {
          fs.writeFileSync(
            filePath,
            `\\begin{array}{ll}
\\alpha & Alfa Katsayısı\\\\
\\beta & Beta Katsayısı\\\\
\\sigma & Sigma Değeri\\\\
\\lambda & Lambda Değişkeni
\\end{array}`
          );
        } else if (file === "eklerkapak.tex") {
          fs.writeFileSync(
            filePath,
            `% This file is used as the appendix cover page.
% The \\eklerkapak{} command in the main file triggers the appendix.`
          );
        } else if (file === "ekler.tex") {
          fs.writeFileSync(
            filePath,
            `\\chapter{APPENDIX}
This is a placeholder for your appendix content. Replace with your actual appendix.

\\section{Sample Appendix Section}
Sample appendix content goes here.`
          );
        } else if (file === "ozgecmis.tex") {
          fs.writeFileSync(
            filePath,
            `Ad Soyad, 1990 yılında İstanbul'da doğdu. Lisans eğitimini ... Üniversitesi ... Bölümü'nde 2013 yılında tamamladı. 2014 yılında başladığı İstanbul Teknik Üniversitesi'ndeki yüksek lisans eğitimine devam etmektedir.`
          );
        } else {
          // Create an empty file for other placeholders
          fs.writeFileSync(
            filePath,
            `% This is a placeholder file for ${file}`
          );
        }
        console.log(`Created placeholder file: ${file}`);
      }
    }

    // Create chapter files with minimal content
    for (const file of chapterFiles) {
      const filePath = path.join(workDir, file);
      if (!fs.existsSync(filePath)) {
        const chapterNum = file.replace("ch", "").replace(".tex", "");
        fs.writeFileSync(
          filePath,
          `\\chapter{Chapter ${chapterNum}}

This is placeholder content for Chapter ${chapterNum}. Replace this with your actual content.

\\section{Section 1}

Sample text for Section 1.

\\section{Section 2}

Sample text for Section 2.`
        );
        console.log(`Created chapter file: ${file}`);
      }
    }

    console.log("All ITU template files copied or created successfully");
  } catch (error) {
    console.error("Error copying ITU template files:", error);
    throw error;
  }
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
  const summaryBlock = sortedBlocks.find((block) => block.type === "summary");
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
\\yazar{${titlePageBlock?.author.split(" ")[0] || "Name"}}{${
    titlePageBlock?.author.split(" ")[1]?.toUpperCase() || "SURNAME"
  }}
\\ogrencino{${titlePageBlock?.studentId || "123456789"}}

% Define department and program
\\anabilimdali{Department Turkish}{${
    titlePageBlock?.department || "Department of Science"
  }}
\\programi{Program Turkish}{${titlePageBlock?.program || "Science Program"}}

% Define dates
\\tarih{MONTH YEAR IN TURKISH}{${titlePageBlock?.date || "January 2024"}}
\\tarihKucuk{month year in Turkish}{${
    titlePageBlock?.date?.toLowerCase() || "january 2024"
  }}

% Define advisor information
\\tezyoneticisi{Prof. Dr. Advisor Name}{Istanbul Technical University}
\\tezyoneticisiTR{Prof. Dr. Advisor Name TR}{İstanbul Teknik Üniversitesi}
\\unvan{Prof. Dr.}

% Define co-advisor information (if any)
\\esdanismani{}{} 
\\esdanismaniTR{}{}

% Define thesis title
\\title{${titlePageBlock?.title || "Thesis Title"}}{}{} 
\\baslikENG{${titlePageBlock?.title || "Thesis Title"}}{}{} 
\\baslik{Thesis Title in Turkish}{}{} 

% Define submission and defense dates
\\tezvermetarih{22 September 2024}{22 September 2024}
\\tezsavunmatarih{21 December 2024}{21 December 2024}

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
  const summaryBlock = sortedBlocks.find((block) => block.type === "summary");
  const appendicesBlock = sortedBlocks.find(
    (block) => block.type === "appendices"
  );
  const cvBlock = sortedBlocks.find((block) => block.type === "cv");

  // Content blocks (everything except title page, abstract, bibliography, summary, appendices, cv)
  const contentBlocks = sortedBlocks.filter(
    (block) =>
      block.type !== "title-page" &&
      block.type !== "abstract" &&
      block.type !== "bibliography" &&
      block.type !== "summary" &&
      block.type !== "appendices" &&
      block.type !== "cv"
  );

  // Replace markers in template
  if (titlePageBlock && titlePageBlock.type === "title-page") {
    if (template === "itu") {
      // For ITU template, replace individual fields
      templateContent = templateContent
        .replace(TITLE_MARKER, titlePageBlock.title)
        .replace(AUTHOR_MARKER, titlePageBlock.author)
        .replace(DEPARTMENT_MARKER, titlePageBlock.department)
        .replace(DATE_MARKER, titlePageBlock.date);

      // Set default values for ITU-specific fields if not provided
      templateContent = templateContent
        .replace(STUDENT_ID_MARKER, titlePageBlock.studentId || "")
        .replace(PROGRAM_MARKER, titlePageBlock.program || "")
        .replace(SUPERVISOR_MARKER, titlePageBlock.supervisor || "")
        .replace(DEGREE_MARKER, titlePageBlock.degree || "Master of Science");
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
    // Replace summary content
    if (summaryBlock && summaryBlock.content) {
      templateContent = templateContent.replace(
        SUMMARY_MARKER,
        summaryBlock.content
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

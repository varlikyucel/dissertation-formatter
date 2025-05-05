import { NextRequest, NextResponse } from "next/server";
import {
  generateLaTeXDocument,
  generateBibTeX,
  copyItuTemplateFiles,
} from "@/lib/templates/templateService";
import { Project, Block } from "@/lib/types";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const execAsync = promisify(exec);

// Directory for temporary LaTeX files
const TMP_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "tmp")
    : path.join(process.cwd(), "tmp");

// Ensure temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

/**
 * Create content files for ITU template
 */
export function createItuContentFiles(workDir: string, project: Project) {
  console.log("Creating ITU content files in:", workDir);

  const { blocks } = project;
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Find blocks by type
  const abstractBlock = sortedBlocks.find((block) => block.type === "abstract");
  const summaryBlock = sortedBlocks.find((block) => block.type === "summary");
  const cvBlock = sortedBlocks.find((block) => block.type === "cv");
  const appendicesBlock = sortedBlocks.find(
    (block) => block.type === "appendices"
  );

  // Create content files with proper content
  if (abstractBlock) {
    console.log("Creating abstract file (ozet.tex)");
    fs.writeFileSync(path.join(workDir, "ozet.tex"), abstractBlock.content);
  }

  if (summaryBlock) {
    console.log("Creating summary file (summary.tex)");
    fs.writeFileSync(path.join(workDir, "summary.tex"), summaryBlock.content);
  } else if (abstractBlock) {
    // If no summary but abstract exists, use abstract as summary too
    console.log("No summary found, using abstract for summary.tex");
    fs.writeFileSync(path.join(workDir, "summary.tex"), abstractBlock.content);
  }

  if (cvBlock) {
    console.log("Creating CV file (ozgecmis.tex)");
    fs.writeFileSync(path.join(workDir, "ozgecmis.tex"), cvBlock.content);
  }

  if (appendicesBlock) {
    console.log("Creating appendices file (ekler.tex)");
    fs.writeFileSync(path.join(workDir, "ekler.tex"), appendicesBlock.content);
  }

  // Create chapter files
  const chapterBlocks = sortedBlocks.filter(
    (block) => block.type === "chapter"
  );

  for (let i = 0; i < Math.min(chapterBlocks.length, 6); i++) {
    const chapterNum = i + 1;
    const chapterBlock = chapterBlocks[i];
    let chapterContent = `\\chapter{${chapterBlock.title}}\n\n${chapterBlock.content}`;

    // Add section content to chapter
    const sectionBlocks = sortedBlocks.filter(
      (block) =>
        block.type === "section" &&
        sortedBlocks.findIndex((b) => b.id === block.id) >
          sortedBlocks.findIndex((b) => b.id === chapterBlock.id) &&
        (i === chapterBlocks.length - 1 ||
          sortedBlocks.findIndex((b) => b.id === block.id) <
            sortedBlocks.findIndex((b) => b.id === chapterBlocks[i + 1].id))
    );

    for (const block of sectionBlocks) {
      if (block.type === "section") {
        let sectionCmd = "section";
        if (block.level === 2) sectionCmd = "subsection";
        if (block.level === 3) sectionCmd = "subsubsection";

        chapterContent += `\n\n\\${sectionCmd}{${block.title}}\n\n${block.content}`;
      }
    }

    console.log(`Creating chapter file ch${chapterNum}.tex`);
    fs.writeFileSync(path.join(workDir, `ch${chapterNum}.tex`), chapterContent);
  }

  // Create empty chapter files for any chapters that don't exist
  for (let i = chapterBlocks.length; i < 6; i++) {
    const chapterNum = i + 1;
    const emptyChapterContent = `\\chapter{Chapter ${chapterNum}}

This is an automatically generated placeholder chapter.

\\section{Empty Section}

This chapter is required by the ITU thesis template but has no content in your document structure.`;

    console.log(`Creating empty chapter file ch${chapterNum}.tex`);
    fs.writeFileSync(
      path.join(workDir, `ch${chapterNum}.tex`),
      emptyChapterContent
    );
  }

  // Create placeholder onsoz.tex (foreword) if it doesn't exist
  if (!fs.existsSync(path.join(workDir, "onsoz.tex"))) {
    console.log("Creating placeholder foreword file (onsoz.tex)");
    fs.writeFileSync(
      path.join(workDir, "onsoz.tex"),
      "Bu tezin hazırlanmasında yardımlarını esirgemeyen değerli hocam ..."
    );
  }

  // Create placeholder for any other required files that might not exist
  const requiredFiles = [
    "kisaltmalar.tex", // abbreviations
    "semboller.tex", // symbols
    "eklerkapak.tex", // appendix cover
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(workDir, file))) {
      console.log(`Creating placeholder file: ${file}`);

      let content = "";
      if (file === "kisaltmalar.tex") {
        content = `\\begin{array}{ll}
ITU & Istanbul Technical University\\\\
IEEE & Institute of Electrical and Electronics Engineers
\\end{array}`;
      } else if (file === "semboller.tex") {
        content = `\\begin{array}{ll}
\\alpha & Alpha\\\\
\\beta & Beta
\\end{array}`;
      } else if (file === "eklerkapak.tex") {
        content = "% This file is used as the appendix cover page";
      }

      fs.writeFileSync(path.join(workDir, file), content);
    }
  }

  console.log("All ITU content files created successfully");
}

/**
 * Copy template files needed for compilation
 */
async function copyTemplateFiles(
  workDir: string,
  templateName: string,
  project: Project
): Promise<void> {
  if (templateName === "itu") {
    // Use the enhanced ITU template handler
    copyItuTemplateFiles(workDir);

    // Create content files for ITU template
    createItuContentFiles(workDir, project);
  }
}

/**
 * Check if LaTeX is installed
 */
async function checkLaTeXInstallation(): Promise<boolean> {
  try {
    // On Windows, use 'where' command to find pdflatex
    const command =
      process.platform === "win32" ? "where pdflatex" : "which pdflatex";
    await execAsync(command);
    return true;
  } catch (error) {
    console.error("LaTeX installation check failed:", error);
    return false;
  }
}

/**
 * Get the MiKTeX bin directory path from the PATH environment variable on Windows
 */
function getMikTeXBinPath(): string | null {
  if (process.platform !== "win32") return null;

  const path = process.env.PATH || "";
  const paths = path.split(";");

  // Look for MiKTeX path in PATH
  const mikTexPath = paths.find(
    (p) => p.toLowerCase().includes("miktex") && p.toLowerCase().includes("bin")
  );

  return mikTexPath || null;
}

/**
 * Run the LaTeX compilation sequence (pdflatex → bibtex → pdflatex → pdflatex)
 */
async function runLaTeXCompilation(workDir: string): Promise<void> {
  // Normalize path for Windows
  const normalizedWorkDir = workDir.replace(/\\/g, "/");

  // Check for MiKTeX path on Windows
  const mikTexPath = getMikTeXBinPath();

  // Create commands with appropriate paths for Windows
  let pdflatexCmd: string;
  let bibtexCmd: string;

  if (process.platform === "win32") {
    // If MiKTeX path was found, use absolute path to pdflatex
    if (mikTexPath) {
      const pdflatexExe = path.join(mikTexPath, "pdflatex.exe");
      const bibtexExe = path.join(mikTexPath, "bibtex.exe");

      pdflatexCmd = `"${pdflatexExe}" -interaction=nonstopmode -halt-on-error -output-directory="${normalizedWorkDir}" "${path.join(
        normalizedWorkDir,
        "main.tex"
      )}"`;
      bibtexCmd = `"${bibtexExe}" "${path.join(normalizedWorkDir, "main")}"`;
    } else {
      // Fall back to regular commands and hope they're in PATH
      pdflatexCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${normalizedWorkDir}" "${path.join(
        normalizedWorkDir,
        "main.tex"
      )}"`;
      bibtexCmd = `bibtex "${path.join(normalizedWorkDir, "main")}"`;
    }
  } else {
    // Unix-based systems
    pdflatexCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${normalizedWorkDir} ${path.join(
      normalizedWorkDir,
      "main.tex"
    )}`;
    bibtexCmd = `bibtex ${path.join(normalizedWorkDir, "main")}`;
  }

  console.log("[RunLaTeX] Running pdflatex command:", pdflatexCmd);
  console.log("[RunLaTeX] Running bibtex command:", bibtexCmd);

  // --- First pdflatex run ---
  console.log("[RunLaTeX] Starting first pdflatex run...");
  try {
    const { stdout, stderr } = await execAsync(pdflatexCmd);
    console.log("[RunLaTeX] First pdflatex run stdout:", stdout);
    if (stderr) {
      console.log("[RunLaTeX] First pdflatex run stderr:", stderr);
    }
    console.log("[RunLaTeX] First pdflatex run completed.");
  } catch (error: any) {
    console.error("[RunLaTeX] First pdflatex run FAILED:", error);
    const logPath = path.join(workDir, "main.log");
    let logContent = "";
    if (fs.existsSync(logPath)) {
      logContent = fs.readFileSync(logPath, "utf-8");
      console.error(
        "[RunLaTeX] Log file content (on first pdflatex error):",
        logContent
      );
    }
    const errorMatch = logContent.match(/!(.*?)$/m);
    const detailedError = errorMatch
      ? `LaTeX Error: ${errorMatch[1].trim()}`
      : `First pdflatex run failed: ${error.message || "Unknown error"}`;
    throw new Error(detailedError);
  }

  // --- BibTeX run ---
  console.log("[RunLaTeX] Starting BibTeX run...");
  try {
    const { stdout, stderr } = await execAsync(bibtexCmd);
    console.log("[RunLaTeX] BibTeX run stdout:", stdout);
    if (stderr) {
      console.log("[RunLaTeX] BibTeX run stderr:", stderr);
    }
    console.log("[RunLaTeX] BibTeX run completed.");
  } catch (error: any) {
    console.error("[RunLaTeX] BibTeX run FAILED:", error);
    const blgPath = path.join(workDir, "main.blg");
    let blgContent = "";
    if (fs.existsSync(blgPath)) {
      blgContent = fs.readFileSync(blgPath, "utf-8");
      console.error(
        "[RunLaTeX] BibTeX log file content (on bibtex error):",
        blgContent
      );
    }
    throw new Error(
      `BibTeX run failed: ${
        blgContent.split("\n")[0] || error.message || "Unknown error"
      }`
    );
  }

  // --- Second pdflatex run ---
  console.log("[RunLaTeX] Starting second pdflatex run...");
  try {
    const { stdout, stderr } = await execAsync(pdflatexCmd);
    console.log("[RunLaTeX] Second pdflatex run stdout:", stdout);
    if (stderr) {
      console.log("[RunLaTeX] Second pdflatex run stderr:", stderr);
    }
    console.log("[RunLaTeX] Second pdflatex run completed.");
  } catch (error: any) {
    console.error("[RunLaTeX] Second pdflatex run FAILED:", error);
    const logPath = path.join(workDir, "main.log");
    let logContent = "";
    if (fs.existsSync(logPath)) {
      logContent = fs.readFileSync(logPath, "utf-8");
      console.error(
        "[RunLaTeX] Log file content (on second pdflatex error):",
        logContent
      );
    }
    throw new Error(
      `Second pdflatex run failed: ${error.message || "Unknown error"}`
    );
  }

  // --- Third pdflatex run ---
  console.log("[RunLaTeX] Starting third pdflatex run...");
  try {
    const { stdout, stderr } = await execAsync(pdflatexCmd);
    console.log("[RunLaTeX] Third pdflatex run stdout:", stdout);
    if (stderr) {
      console.log("[RunLaTeX] Third pdflatex run stderr:", stderr);
    }
    console.log("[RunLaTeX] Third pdflatex run completed.");
  } catch (error: any) {
    console.error("[RunLaTeX] Third pdflatex run FAILED:", error);
    const logPath = path.join(workDir, "main.log");
    let logContent = "";
    if (fs.existsSync(logPath)) {
      logContent = fs.readFileSync(logPath, "utf-8");
      console.error(
        "[RunLaTeX] Log file content (on third pdflatex error):",
        logContent
      );
    }
    throw new Error(
      `Third pdflatex run failed: ${error.message || "Unknown error"}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = body.project as Project;

    if (!project) {
      return NextResponse.json(
        { error: "Project data is required" },
        { status: 400 }
      );
    }

    // Check if LaTeX is installed
    const isLaTeXInstalled = await checkLaTeXInstallation();
    if (!isLaTeXInstalled) {
      return NextResponse.json(
        {
          error:
            "LaTeX (pdflatex) is not installed or not in PATH. MiKTeX may not be properly installed or added to your system PATH.",
        },
        { status: 500 }
      );
    }

    console.log("Starting compilation for project:", project.title);

    // Create a unique working directory for this compilation
    const workDir = path.join(TMP_DIR, uuidv4());
    fs.mkdirSync(workDir, { recursive: true });
    console.log("Created temporary directory:", workDir);

    try {
      // Generate LaTeX document and BibTeX file
      console.log("Generating LaTeX content...");
      const latexContent = generateLaTeXDocument(project);
      const bibtexContent = generateBibTeX(project.citations);

      // Write files to the working directory
      const mainTexFile = path.join(workDir, "main.tex");
      const bibtexFile = path.join(workDir, "tez.bib");

      fs.writeFileSync(mainTexFile, latexContent);
      fs.writeFileSync(bibtexFile, bibtexContent);
      console.log("LaTeX and BibTeX files written to:", workDir);

      // Copy template-specific files
      console.log("Copying template files...");
      await copyTemplateFiles(workDir, project.template, project);

      // Run LaTeX compilation sequence
      console.log("Starting LaTeX compilation process...");
      try {
        await runLaTeXCompilation(workDir);
        console.log("LaTeX compilation completed successfully");
      } catch (compileError: any) {
        console.error("LaTeX compilation error:", compileError);
        // Check for log file to get more details
        const logPath = path.join(workDir, "main.log");
        let logContent = "";
        if (fs.existsSync(logPath)) {
          logContent = fs.readFileSync(logPath, "utf-8");
          console.log("LaTeX log content:", logContent);
        }

        // Return detailed error information
        return NextResponse.json(
          {
            error: "LaTeX compilation failed",
            details: compileError.message,
            logExcerpt:
              logContent.length > 500
                ? logContent.slice(logContent.length - 500)
                : logContent,
          },
          { status: 500 }
        );
      }

      // Read the compiled PDF
      const pdfPath = path.join(workDir, "main.pdf");
      if (!fs.existsSync(pdfPath)) {
        console.error("PDF file not found at:", pdfPath);
        return NextResponse.json(
          { error: "PDF file was not created after successful compilation" },
          { status: 500 }
        );
      }

      console.log("Reading compiled PDF file...");
      const pdfContent = fs.readFileSync(pdfPath);

      // Clean up
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory");

      // Return PDF as response
      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${project.title}.pdf"`,
        },
      });
    } catch (error: any) {
      console.error("Error during compilation process:", error);

      // Save the error log if exists
      let errorLogPath = null;
      const logPath = path.join(workDir, "main.log");
      if (fs.existsSync(logPath)) {
        errorLogPath = path.join(TMP_DIR, `error-${Date.now()}.log`);
        fs.copyFileSync(logPath, errorLogPath);
        console.log("Saved error log to:", errorLogPath);
      }

      // Clean up on error
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }

      return NextResponse.json(
        {
          error: "Failed to compile document",
          details: error.message || "Unknown error",
          errorLogPath: errorLogPath,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected LaTeX compilation error:", error);
    return NextResponse.json(
      {
        error: "Failed to compile document",
        details: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

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
import archiver from "archiver";

const execAsync = promisify(exec);

// Directory for temporary export files
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
function createItuContentFiles(workDir: string, project: Project) {
  const { blocks } = project;
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Find blocks by type
  const abstractBlock = sortedBlocks.find((block) => block.type === "abstract");
  const turkishAbstractBlock = sortedBlocks.find(
    (block) => block.type === "turkish-abstract"
  );
  const cvBlock = sortedBlocks.find((block) => block.type === "cv");
  const appendicesBlock = sortedBlocks.find(
    (block) => block.type === "appendices"
  );

  // Create content files
  if (abstractBlock) {
    fs.writeFileSync(path.join(workDir, "ozet.tex"), abstractBlock.content);
  }

  if (abstractBlock) {
    fs.writeFileSync(path.join(workDir, "summary.tex"), abstractBlock.content);
  }

  if (cvBlock) {
    fs.writeFileSync(path.join(workDir, "ozgecmis.tex"), cvBlock.content);
  }

  if (appendicesBlock) {
    fs.writeFileSync(path.join(workDir, "ekler.tex"), appendicesBlock.content);
  }

  // Create chapter files
  const chapterBlocks = sortedBlocks.filter(
    (block) => block.type === "chapter"
  );

  for (let i = 0; i < chapterBlocks.length; i++) {
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
        if (block.level === 2) sectionCmd = "section";
        if (block.level === 3) sectionCmd = "subsection";
        if (block.level === 4) sectionCmd = "subsubsection";

        // Handle level 5 (no numbering)
        if (block.level === 5) {
          chapterContent += `\n\n{\\normalfont\\normalsize\\bfseries ${block.title}}\n\n${block.content}`;
        } else {
          chapterContent += `\n\n\\${sectionCmd}{${block.title}}\n\n${block.content}`;
        }
      }
    }

    fs.writeFileSync(path.join(workDir, `ch${chapterNum}.tex`), chapterContent);
  }
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

    // Create a unique working directory for this export
    const workDir = path.join(TMP_DIR, uuidv4());
    fs.mkdirSync(workDir, { recursive: true });

    try {
      // Generate LaTeX document and BibTeX file
      const latexContent = generateLaTeXDocument(project);
      const bibtexContent = generateBibTeX(project.citations);

      // Write files to the working directory
      const mainTexFile = path.join(workDir, "main.tex");
      const referencesFile = path.join(workDir, "references.bib");

      fs.writeFileSync(mainTexFile, latexContent);
      fs.writeFileSync(referencesFile, bibtexContent);

      // Copy template-specific files
      await copyTemplateFiles(workDir, project.template, project);

      // Run LaTeX compilation sequence to generate PDF
      await runLaTeXCompilation(workDir);

      // Create ZIP file
      const zipPath = path.join(workDir, `${project.title}.zip`);
      await createZipArchive(workDir, zipPath, project.template);

      // Read the ZIP file
      const zipContent = fs.readFileSync(zipPath);

      // Clean up
      fs.rmSync(workDir, { recursive: true, force: true });

      // Return ZIP as response
      return new NextResponse(zipContent, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${project.title}.zip"`,
        },
      });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export project" },
      { status: 500 }
    );
  }
}

/**
 * Run the LaTeX compilation sequence (pdflatex → bibtex → pdflatex → pdflatex)
 */
async function runLaTeXCompilation(workDir: string): Promise<void> {
  const pdflatexCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${workDir} ${path.join(
    workDir,
    "main.tex"
  )}`;
  const bibtexCmd = `bibtex ${path.join(workDir, "main")}`;

  try {
    // First pdflatex run
    await execAsync(pdflatexCmd);

    // BibTeX run
    await execAsync(bibtexCmd);

    // Second pdflatex run to incorporate references
    await execAsync(pdflatexCmd);

    // Third pdflatex run to ensure all references are resolved
    await execAsync(pdflatexCmd);
  } catch (error) {
    console.error("LaTeX compilation command failed:", error);
    throw new Error(
      "LaTeX compilation failed. Check if LaTeX is installed and your document is valid."
    );
  }
}

/**
 * Create a ZIP archive of the compiled files
 */
async function createZipArchive(
  workDir: string,
  zipPath: string,
  templateName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on("close", () => {
      resolve();
    });

    archive.on("error", (err: Error) => {
      reject(err);
    });

    archive.pipe(output);

    // Add main files to the archive
    archive.file(path.join(workDir, "main.tex"), { name: "main.tex" });
    archive.file(path.join(workDir, "references.bib"), {
      name: "references.bib",
    });

    // If using ITU template, include all its files
    if (templateName === "itu") {
      // Get all files in the workDir
      const files = fs.readdirSync(workDir);

      // Add all template files (except main.tex and references.bib which are already added)
      for (const file of files) {
        if (
          file !== "main.tex" &&
          file !== "references.bib" &&
          !fs.statSync(path.join(workDir, file)).isDirectory()
        ) {
          archive.file(path.join(workDir, file), { name: file });
        }
      }

      // Add fig directory if it exists
      const figDir = path.join(workDir, "fig");
      if (fs.existsSync(figDir) && fs.statSync(figDir).isDirectory()) {
        const figFiles = fs.readdirSync(figDir);
        for (const file of figFiles) {
          archive.file(path.join(figDir, file), { name: `fig/${file}` });
        }
      }
    } else {
      // For standard template, add specific template files if they exist
      if (fs.existsSync(path.join(workDir, "main.pdf"))) {
        archive.file(path.join(workDir, "main.pdf"), { name: "main.pdf" });
      }

      // Add auxiliary files that might be useful
      const auxFiles = [
        "main.aux",
        "main.bbl",
        "main.blg",
        "main.log",
        "main.toc",
        "main.lof",
        "main.lot",
      ];

      auxFiles.forEach((file) => {
        const filePath = path.join(workDir, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      });
    }

    archive.finalize();
  });
}

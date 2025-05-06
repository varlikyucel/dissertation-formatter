import { NextRequest, NextResponse } from "next/server";
import {
  generateLaTeXDocument,
  generateBibTeX,
  copyItuTemplateFiles, // We'll likely need copyTemplateFiles from compile route potentially
} from "@/lib/templates/templateService";
import { createItuContentFiles } from "../compile/route"; // Import the function if it's exported
import { Project, Block, FigureBlock } from "@/lib/types";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import archiver from "archiver";
import { WritableStreamBuffer } from "stream-buffers"; // Needs stream-buffers install
import os from "os";
import { Readable } from "stream"; // Import Readable stream type

// Directory for temporary LaTeX files
const TMP_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "tmp")
    : path.join(process.cwd(), "tmp");

// Ensure temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Helper function to copy template files (adapt from compile route if needed)
async function copyTemplateFilesOverleaf(
  workDir: string,
  templateName: string,
  project: Project
): Promise<void> {
  if (templateName === "itu") {
    // Use the enhanced ITU template handler
    copyItuTemplateFiles(workDir); // From templateService

    // Create content files for ITU template
    // We need to ensure createItuContentFiles is accessible here
    // Option 1: Move createItuContentFiles to templateService.ts
    // Option 2: Keep it in compile/route.ts and import it (needs export)
    // Let's assume we import it for now.
    try {
      // Assuming createItuContentFiles is exported from the compile route file
      // Note: This creates a dependency between API routes, might be better to refactor later
      await createItuContentFiles(workDir, project);
    } catch (e) {
      // Handle case where createItuContentFiles might not be exported or path is wrong
      console.error(
        "Could not import or run createItuContentFiles from compile route.",
        e
      );
      // Attempt to create minimal placeholders if main function fails
      const chapterBlocks = project.blocks.filter((b) => b.type === "chapter");
      for (let i = 0; i < 6; i++) {
        const chapterNum = i + 1;
        const filePath = path.join(workDir, `ch${chapterNum}.tex`);
        if (!fs.existsSync(filePath)) {
          const content = chapterBlocks[i]
            ? `\\chapter{${chapterBlocks[i].title}}

${chapterBlocks[i].content}`
            : `\\chapter{Placeholder Chapter ${chapterNum}}

Content missing.`;
          fs.writeFileSync(filePath, content);
        }
      }
      // Add other placeholders similarly if needed (ozet, summary, etc.)
      console.warn(
        "Falling back to minimal content file creation for Overleaf export."
      );
    }
  }
  // Add logic for other templates if necessary
}

// Helper function to copy figures (placeholder for now)
async function copyFigureFiles(
  workDir: string,
  project: Project
): Promise<void> {
  console.log("Copying figure files to:", workDir);
  const figuresDir = path.join(workDir, "figures");
  if (!fs.existsSync(figuresDir)) {
    fs.mkdirSync(figuresDir, { recursive: true });
  }

  const figureBlocks = project.blocks.filter(
    (block): block is FigureBlock => block.type === "figure"
  );

  for (const figure of figureBlocks) {
    if (figure.imagePath) {
      // TODO: Implement actual figure copying logic.
      // This depends heavily on how/where images are stored.
      // - If figure.imagePath is a URL (e.g., Supabase storage): Download the file.
      // - If figure.imagePath is a relative path to an upload dir: Copy from there.
      // For now, we'll just log it.
      const sourcePath = figure.imagePath; // Placeholder
      const destPath = path.join(figuresDir, path.basename(sourcePath)); // Simple basename destination
      console.warn(
        `Figure copying not implemented. Pretending to copy: ${sourcePath} to ${destPath}`
      );
      // Example (if local path):
      // if (fs.existsSync(sourcePath)) {
      //   fs.copyFileSync(sourcePath, destPath);
      //   console.log(`Copied figure: ${path.basename(sourcePath)}`);
      // } else {
      //   console.error(`Source figure not found: ${sourcePath}`);
      // }
    }
  }
}

export async function POST(request: NextRequest) {
  let workDir: string | null = null; // Initialize workDir to null

  try {
    const body = await request.json();
    const project = body.project as Project;

    if (!project) {
      return NextResponse.json(
        { error: "Project data is required" },
        { status: 400 }
      );
    }

    console.log("Starting Overleaf export for project:", project.title);

    // Create a unique working directory
    workDir = path.join(TMP_DIR, `overleaf-${uuidv4()}`);
    fs.mkdirSync(workDir, { recursive: true });
    console.log("Created temporary directory for Overleaf:", workDir);

    // Generate LaTeX document and BibTeX file
    console.log("Generating LaTeX content...");
    const latexContent = generateLaTeXDocument(project);
    const bibtexContent = generateBibTeX(project.citations);

    // Write main files to the working directory
    const mainTexFile = path.join(workDir, "main.tex");
    const bibtexFile = path.join(workDir, "tez.bib"); // Correct name for ITU

    fs.writeFileSync(mainTexFile, latexContent);
    fs.writeFileSync(bibtexFile, bibtexContent);
    console.log("LaTeX and BibTeX files written to:", workDir);

    // Copy template-specific files and create content files
    console.log("Copying template files and creating content files...");
    await copyTemplateFilesOverleaf(workDir, project.template, project);

    // Copy figure files
    console.log("Copying figure files...");
    await copyFigureFiles(workDir, project); // Add figure handling

    // Create a ZIP archive in memory
    console.log("Creating ZIP archive...");
    const output = new WritableStreamBuffer(); // Use stream-buffers
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // Pipe archive data to the buffer
    archive.pipe(output);

    // Add all files from the working directory to the archive
    // Use glob pattern to match all files and directories within workDir
    archive.directory(workDir, false); // Add directory contents directly to the root of the zip

    // Finalize the archive (important!)
    await archive.finalize();
    console.log("ZIP archive finalized.");

    // Get the buffer content when the stream finishes
    const zipBuffer = output.getContents(); // Get buffer directly

    if (!zipBuffer) {
      throw new Error("Failed to get ZIP buffer content.");
    }

    // Convert buffer to Base64
    const base64Zip = zipBuffer.toString("base64");
    console.log("ZIP archive converted to Base64.");

    // Construct the data URL
    const dataUrl = `data:application/zip;base64,${base64Zip}`;

    // Clean up the temporary directory
    if (fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory:", workDir);
    }
    workDir = null; // Reset workDir after cleanup

    // Return the data URL
    console.log("Returning Overleaf data URL.");
    return NextResponse.json({ dataUrl });
  } catch (error: any) {
    console.error("Error during Overleaf export process:", error);

    // Clean up on error
    if (workDir && fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory on error:", workDir);
    }

    return NextResponse.json(
      {
        error: "Failed to generate Overleaf export data",
        details: error.message || "Unknown error",
        stack: error.stack, // Include stack trace for debugging
      },
      { status: 500 }
    );
  }
}

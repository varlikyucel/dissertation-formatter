import { NextRequest, NextResponse } from "next/server";
import {
  generateLaTeXDocument,
  generateBibTeX,
  copyItuTemplateFiles,
  createItuContentFiles,
} from "@/lib/templates/templateService";
import { Project, Block, FigureBlock } from "@/lib/types";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import archiver from "archiver";
import { WritableStreamBuffer } from "stream-buffers";
import os from "os";
import { Readable } from "stream";

// Directory for temporary LaTeX files
const TMP_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "tmp")
    : path.join(process.cwd(), "tmp");

// Ensure temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Helper function to copy template files
async function copyTemplateFilesOverleaf(
  workDir: string,
  templateName: string,
  project: Project
): Promise<void> {
  if (templateName === "itu") {
    // Use the enhanced ITU template handler
    copyItuTemplateFiles(workDir);

    // Create content files for ITU template using the function from templateService
    await createItuContentFiles(workDir, project);
  }
  // Add logic for other templates if necessary
}

// Helper function to copy figures
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
      const sourcePath = figure.imagePath;
      const destPath = path.join(figuresDir, path.basename(sourcePath));
      console.warn(
        `Figure copying not implemented. Pretending to copy: ${sourcePath} to ${destPath}`
      );
    }
  }
}

export async function POST(request: NextRequest) {
  let workDir: string | null = null;

  try {
    console.log("Overleaf API: Received request");
    const body = await request.json();
    console.log("Overleaf API: Request body parsed", {
      hasProject: !!body.project,
      hasZipContent: !!body.zipContent,
      projectTitle: body.project?.title || body.projectName,
    });

    // Accept either project directly or expect a zipContent field from frontend
    let project: Project;
    let existingZipContent: string | null = null;

    if (body.zipContent) {
      console.log("Overleaf API: Using provided ZIP content");
      // Frontend is sending a pre-made zip file as base64
      existingZipContent = body.zipContent;
      project = { title: body.projectName || "Dissertation" } as Project;
    } else if (body.project) {
      console.log("Overleaf API: Using provided project data");
      // Frontend is sending the full project object
      project = body.project as Project;

      // Make sure we have the required properties
      if (!project.title) {
        console.log("Overleaf API: Project missing title, using default");
        project.title = "Dissertation";
      }

      if (!project.blocks) {
        console.error("Overleaf API: Project missing blocks array");
        return NextResponse.json(
          { error: "Project data is invalid - missing blocks array" },
          { status: 400 }
        );
      }

      if (!project.template) {
        console.log(
          "Overleaf API: Project missing template, using default template"
        );
        // This might cause issues depending on your template service
        // You might want to set a default template here
      }
    } else {
      console.error("Overleaf API: Missing both project data and zip content");
      return NextResponse.json(
        { error: "Missing project data or zip content" },
        { status: 400 }
      );
    }

    if (!existingZipContent) {
      console.log("Starting Overleaf export for project:", project.title);

      // Create a unique working directory
      workDir = path.join(TMP_DIR, `overleaf-${uuidv4()}`);
      fs.mkdirSync(workDir, { recursive: true });
      console.log("Created temporary directory for Overleaf:", workDir);

      try {
        // Generate LaTeX document and BibTeX file
        console.log("Generating LaTeX content...");
        const latexContent = generateLaTeXDocument(project);
        const bibtexContent = generateBibTeX(project.citations || []);

        // Write main files to the working directory
        const mainTexFile = path.join(workDir, "main.tex");
        const bibtexFile = path.join(workDir, "tez.bib");

        fs.writeFileSync(mainTexFile, latexContent);
        fs.writeFileSync(bibtexFile, bibtexContent);
        console.log("LaTeX and BibTeX files written to:", workDir);

        // Copy template-specific files and create content files
        console.log("Copying template files and creating content files...");
        await copyTemplateFilesOverleaf(workDir, project.template, project);

        // Copy figure files
        console.log("Copying figure files...");
        await copyFigureFiles(workDir, project);

        // Create a ZIP archive in memory
        console.log("Creating ZIP archive...");
        const output = new WritableStreamBuffer();
        const archive = archiver("zip", {
          zlib: { level: 9 },
        });

        // Pipe archive data to the buffer
        archive.pipe(output);

        // Add all files from the working directory to the archive
        archive.directory(workDir, false);

        // Finalize the archive
        await archive.finalize();
        console.log("ZIP archive finalized.");

        // Get the buffer content when the stream finishes
        const zipBuffer = output.getContents();

        if (!zipBuffer) {
          throw new Error("Failed to get ZIP buffer content.");
        }

        // Convert buffer to Base64
        existingZipContent = zipBuffer.toString("base64");
        console.log(
          "ZIP archive converted to Base64, length:",
          existingZipContent.length
        );
      } catch (innerError: any) {
        console.error("Error during ZIP creation:", innerError);
        throw new Error(`ZIP creation failed: ${innerError.message}`);
      }
    }

    // Construct the data URL for Overleaf
    const snip_uri = `data:application/zip;base64,${existingZipContent}`;
    console.log("Constructed snip_uri data URL, length:", snip_uri.length);

    // Return the data needed for Overleaf submission
    console.log("Returning Overleaf data.");
    return NextResponse.json({
      snip_uri: snip_uri,
      projectName: project.title || "Dissertation",
    });
  } catch (error: any) {
    console.error("Error during Overleaf export process:", error);
    console.error("Stack trace:", error.stack);

    // Clean up on error
    if (workDir && fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory on error:", workDir);
    }

    return NextResponse.json(
      {
        error: "Failed to generate Overleaf export data",
        details: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 }
    );
  } finally {
    // Clean up the temporary directory
    if (workDir && fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory:", workDir);
    }
  }
}

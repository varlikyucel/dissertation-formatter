import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

export async function GET(request: NextRequest) {
  try {
    // Create a unique working directory for this test compilation
    const workDir = path.join(TMP_DIR, uuidv4());
    fs.mkdirSync(workDir, { recursive: true });
    console.log("Created temporary directory:", workDir);

    try {
      // Create a simple test LaTeX document
      const testLatexContent = `
\\documentclass{article}
\\begin{document}
Hello World! This is a test document.
\\end{document}
`;

      // Write the LaTeX content to a file
      const mainTexFile = path.join(workDir, "test.tex");
      fs.writeFileSync(mainTexFile, testLatexContent);
      console.log("Created test LaTeX file at:", mainTexFile);

      // Log the PATH environment variable for debugging
      console.log("PATH environment:", process.env.PATH);

      // Create commands with appropriate paths for Windows
      let pdflatexCmd;
      let pdflatexPath = "";

      if (process.platform === "win32") {
        // Get MiKTeX bin path from PATH
        const mikTexPath = getMikTeXBinPath();
        console.log("Detected MiKTeX path:", mikTexPath);

        if (mikTexPath) {
          pdflatexPath = path.join(mikTexPath, "pdflatex.exe");
          pdflatexCmd = `"${pdflatexPath}" -interaction=nonstopmode -halt-on-error -output-directory="${workDir}" "${mainTexFile}"`;
        } else {
          // Fall back to regular command
          pdflatexPath = "pdflatex";
          pdflatexCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${workDir}" "${mainTexFile}"`;
        }
      } else {
        // Unix-based systems
        pdflatexPath = "pdflatex";
        pdflatexCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${workDir} ${mainTexFile}`;
      }

      console.log("Using pdflatex path:", pdflatexPath);
      console.log("Running test pdflatex command:", pdflatexCmd);

      // Check if pdflatex exists before running
      try {
        const checkCmd =
          process.platform === "win32" ? "where pdflatex" : "which pdflatex";
        const { stdout } = await execAsync(checkCmd);
        console.log("pdflatex found at:", stdout.trim());
      } catch (checkError) {
        console.error("pdflatex not found in PATH:", checkError);
        throw new Error("pdflatex executable not found in PATH");
      }

      // Run pdflatex
      try {
        const { stdout, stderr } = await execAsync(pdflatexCmd);
        console.log("Test pdflatex output:", stdout);
        if (stderr) {
          console.log("Test pdflatex stderr:", stderr);
        }
      } catch (execError: any) {
        console.error("pdflatex execution failed:", execError);

        // Check for log file to get more detailed LaTeX error
        const logPath = path.join(workDir, "test.log");
        if (fs.existsSync(logPath)) {
          const logContent = fs.readFileSync(logPath, "utf-8");
          console.log("LaTeX log file contents:", logContent);

          // Extract error message from log
          const errorMatch = logContent.match(/!(.*?)$/m);
          if (errorMatch) {
            throw new Error(`LaTeX Error: ${errorMatch[1].trim()}`);
          }
        }

        throw new Error(`pdflatex execution failed: ${execError.message}`);
      }

      // Read the compiled PDF
      const pdfPath = path.join(workDir, "test.pdf");
      if (!fs.existsSync(pdfPath)) {
        console.error("PDF file not created at:", pdfPath);

        // List directory contents for debugging
        const dirContents = fs.readdirSync(workDir);
        console.log("Directory contents:", dirContents);

        throw new Error("PDF file was not created");
      }

      console.log("PDF file created successfully at:", pdfPath);
      const pdfContent = fs.readFileSync(pdfPath);

      // Clean up
      fs.rmSync(workDir, { recursive: true, force: true });
      console.log("Cleaned up temporary directory");

      // Return PDF as response
      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="test.pdf"`,
        },
      });
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Test LaTeX compilation error:", error);
    return NextResponse.json(
      {
        error: "Failed to compile test document",
        details: error.message || "Unknown error",
        stack: error.stack,
        time: new Date().toISOString(),
      },
      { status: 500 }
    );
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

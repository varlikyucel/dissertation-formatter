import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    os: {
      platform: process.platform,
      release: os.release(),
      version: os.version(),
      arch: os.arch(),
    },
    node: {
      version: process.version,
      env: process.env.NODE_ENV,
    },
    paths: {
      cwd: process.cwd(),
      tmpDir: os.tmpdir(),
    },
    latex: {
      installed: false,
      path: null,
      version: null,
      which: null,
      where: null,
      env: null,
      error: null,
    },
    miktex: {
      detected: false,
      path: null,
      version: null,
      error: null,
    },
  };

  // Check PATH environment variable
  try {
    diagnostics.env = {
      PATH: process.env.PATH,
      HOME: process.env.HOME || process.env.USERPROFILE,
      APPDATA: process.env.APPDATA,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
    };
  } catch (e: any) {
    diagnostics.env = { error: e.message };
  }

  // Check LaTeX installation using which/where
  try {
    const command =
      process.platform === "win32" ? "where pdflatex" : "which pdflatex";
    const { stdout } = await execAsync(command);
    diagnostics.latex.installed = !!stdout.trim();
    diagnostics.latex.path = stdout.trim();

    if (process.platform === "win32") {
      diagnostics.latex.where = stdout.trim();
    } else {
      diagnostics.latex.which = stdout.trim();
    }
  } catch (e: any) {
    diagnostics.latex.error = e.message;
  }

  // Check LaTeX version
  if (diagnostics.latex.installed) {
    try {
      const { stdout } = await execAsync("pdflatex --version");
      diagnostics.latex.version = stdout.trim();
    } catch (e: any) {
      diagnostics.latex.version = `Error getting version: ${e.message}`;
    }
  }

  // Check for MiKTeX specifically on Windows
  if (process.platform === "win32") {
    try {
      // Try to find MiKTeX in common installation locations
      const commonPaths = [
        path.join(process.env.ProgramFiles || "C:\\Program Files", "MiKTeX"),
        path.join(
          process.env.ProgramFiles || "C:\\Program Files (x86)",
          "MiKTeX"
        ),
        path.join(process.env.LOCALAPPDATA || "", "Programs", "MiKTeX"),
      ];

      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          diagnostics.miktex.detected = true;
          diagnostics.miktex.path = p;
          break;
        }
      }

      // Try to get MiKTeX version
      try {
        const { stdout } = await execAsync("miktex --version");
        diagnostics.miktex.version = stdout.trim();
      } catch (miktexError) {
        // Try alternative command
        try {
          const { stdout } = await execAsync("initexmf --report");
          diagnostics.miktex.version = stdout.trim();
        } catch (e: any) {
          diagnostics.miktex.error = e.message;
        }
      }
    } catch (e: any) {
      diagnostics.miktex.error = e.message;
    }
  }

  // Check if we can write to temporary directory
  try {
    const testDir = path.join(os.tmpdir(), "latex-test-" + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, "test.txt"), "test");
    fs.unlinkSync(path.join(testDir, "test.txt"));
    fs.rmdirSync(testDir);
    diagnostics.paths.tmpDirWritable = true;
  } catch (e: any) {
    diagnostics.paths.tmpDirWritable = false;
    diagnostics.paths.tmpDirError = e.message;
  }

  // Create verification steps for the user
  const verificationSteps = [];

  if (!diagnostics.latex.installed) {
    verificationSteps.push("Install MiKTeX from https://miktex.org/download");
    verificationSteps.push("After installation, restart your computer");
    verificationSteps.push("Ensure pdflatex is in your system PATH");
  } else {
    verificationSteps.push(
      "LaTeX is installed, but there might be issues with packages or permissions"
    );
    verificationSteps.push("Try running pdflatex manually in a command prompt");
    verificationSteps.push(
      "Check that MiKTeX Package Manager is not blocked by antivirus"
    );
  }

  // Add the verification steps to the diagnostics
  diagnostics.verificationSteps = verificationSteps;

  return NextResponse.json(diagnostics);
}

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Check if LaTeX is installed
 */
async function checkLaTeXInstallation(): Promise<boolean> {
  try {
    // On Windows, use 'where' command to find pdflatex
    const command =
      process.platform === "win32" ? "where pdflatex" : "which pdflatex";
    const { stdout } = await execAsync(command);
    console.log("LaTeX check result:", stdout);
    return !!stdout.trim();
  } catch (error) {
    console.error("LaTeX installation check failed:", error);
    return false;
  }
}

export async function GET() {
  try {
    const isInstalled = await checkLaTeXInstallation();

    return NextResponse.json({
      installed: isInstalled,
      path: isInstalled ? await getLaTeXPath() : null,
    });
  } catch (error) {
    console.error("Error checking LaTeX installation:", error);
    return NextResponse.json(
      { error: "Failed to check LaTeX installation" },
      { status: 500 }
    );
  }
}

/**
 * Get the path to the LaTeX executable
 */
async function getLaTeXPath(): Promise<string> {
  try {
    const command =
      process.platform === "win32" ? "where pdflatex" : "which pdflatex";
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (error) {
    return "";
  }
}

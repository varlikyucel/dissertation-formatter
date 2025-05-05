import { NextRequest, NextResponse } from "next/server";
import {
  generateLaTeXDocument,
  generateBibTeX,
} from "@/lib/templates/templateService";
import { Project } from "@/lib/types";

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

    // Generate LaTeX document and BibTeX file
    const latexContent = generateLaTeXDocument(project);
    const bibtexContent = generateBibTeX(project.citations);

    return NextResponse.json({
      latex: latexContent,
      bibtex: bibtexContent,
    });
  } catch (error: any) {
    console.error("Error generating LaTeX preview:", error);
    return NextResponse.json(
      {
        error: "Failed to generate LaTeX preview",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

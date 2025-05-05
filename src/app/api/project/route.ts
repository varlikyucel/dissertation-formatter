import { NextRequest, NextResponse } from "next/server";
import {
  getProject,
  getProjects,
  saveProject,
  deleteProject,
  DbProject,
} from "@/lib/supabase";
import { Project } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (id) {
      // Get a specific project
      const project = await getProject(id);

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (project.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const projectData = JSON.parse(project.data) as Omit<
        Project,
        "id" | "title" | "template" | "lastModified"
      >;

      return NextResponse.json({
        id: project.id,
        title: project.title,
        template: project.template,
        lastModified: new Date(project.updated_at).getTime(),
        ...projectData,
      });
    } else {
      // Get all projects for a user
      const projects = await getProjects(userId);

      return NextResponse.json(
        projects.map((project) => ({
          id: project.id,
          title: project.title,
          template: project.template,
          lastModified: new Date(project.updated_at).getTime(),
        }))
      );
    }
  } catch (error) {
    console.error("Error fetching project(s):", error);
    return NextResponse.json(
      { error: "Failed to fetch project(s)" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project, userId } = body;

    if (!project || !userId) {
      return NextResponse.json(
        { error: "Project and userId are required" },
        { status: 400 }
      );
    }

    // Extract project metadata and prepare for storage
    const { id, title, blocks, citations, template, lastModified, ...rest } =
      project;

    const dbProject: DbProject = {
      id,
      title,
      user_id: userId,
      data: JSON.stringify({ blocks, citations, ...rest }),
      template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const savedProject = await saveProject(dbProject);

    return NextResponse.json({
      id: savedProject.id,
      title: savedProject.title,
      template: savedProject.template,
      lastModified: new Date(savedProject.updated_at).getTime(),
    });
  } catch (error) {
    console.error("Error saving project:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Project ID and User ID are required" },
        { status: 400 }
      );
    }

    // Verify the user owns the project
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await deleteProject(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

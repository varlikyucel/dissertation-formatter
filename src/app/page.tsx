"use client";

import { useEffect, useState } from "react";
import { useDocumentStore } from "@/lib/store";
import DocumentEditor from "./components/editor/DocumentEditor";

export default function Home() {
  const { project, createProject } = useDocumentStore();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");

  // Handle project creation
  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    createProject(projectName, selectedTemplate);
    setIsCreatingProject(false);
  };

  // Show project editor if a project is loaded, otherwise show the create/open screen
  if (project) {
    return <DocumentEditor />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Dissertation Formatter
        </h1>

        {isCreatingProject ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <div className="mb-4">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Dissertation"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="template"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Template
              </label>
              <select
                id="template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="standard">Standard Dissertation</option>
                <option value="itu">ITU Thesis Template</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreatingProject(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setIsCreatingProject(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
            >
              Create New Project
            </button>

            <div className="text-center text-gray-500 mt-4">
              <p>Welcome to the Dissertation Formatter</p>
              <p className="mt-2 text-sm">
                Create a new project to start building your dissertation with an
                intuitive, drag-and-drop interface. No LaTeX knowledge required!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

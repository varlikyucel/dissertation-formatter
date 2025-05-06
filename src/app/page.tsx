"use client";

import { useEffect, useState } from "react";
import { useDocumentStore } from "@/lib/store";
import { AVAILABLE_TEMPLATES } from "@/lib/types";
import DocumentEditor from "./components/editor/DocumentEditor";

export default function Home() {
  const { project, createProject } = useDocumentStore();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Get the selected template configuration
  const templateConfig = AVAILABLE_TEMPLATES.find(
    (t) => t.id === selectedTemplate
  );

  // Update language when template changes
  useEffect(() => {
    if (templateConfig) {
      setSelectedLanguage(templateConfig.defaultLanguage);
    }
  }, [selectedTemplate, templateConfig]);

  // Handle project creation
  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    createProject(projectName, selectedTemplate, selectedLanguage);
    setIsCreatingProject(false);
  };

  // Show project editor if a project is loaded, otherwise show the create/open screen
  if (project) {
    return <DocumentEditor />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dissertation Formatter
          </h1>
          <p className="text-xl text-gray-600">
            Create beautifully formatted academic documents with ease
          </p>
        </div>

        {isCreatingProject ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Project
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-5">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="My Dissertation"
                />
              </div>
              <div className="mb-5">
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {AVAILABLE_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {templateConfig &&
                templateConfig.supportedLanguages.length > 1 && (
                  <div className="mb-5">
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Language
                    </label>
                    <select
                      id="language"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {templateConfig.supportedLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang === "en"
                            ? "English"
                            : lang === "tr"
                            ? "Turkish"
                            : lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Template preview/information */}
              {templateConfig && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Template Information
                  </h3>
                  <p className="mb-1 text-gray-700">
                    <span className="font-semibold">Institution:</span>{" "}
                    {templateConfig.institution || "Generic"}
                  </p>
                  <p className="mt-3 mb-1 font-semibold text-gray-700">
                    Required Components:
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {templateConfig.requiredBlocks.map((block) => (
                      <div key={block} className="flex items-center">
                        <svg
                          className="h-4 w-4 text-blue-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600 capitalize">
                          {block.replace(/-/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateProject}
                  className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex-1 font-medium"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setIsCreatingProject(false)}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Create New Project
                </h2>
                <p className="text-gray-600 mb-4">
                  Start from scratch with a template of your choice.
                </p>
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Create New
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 duration-300">
              <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Sample Projects
                </h2>
                <p className="text-gray-600 mb-4">
                  Start with a pre-built example to explore features.
                </p>
                <button
                  onClick={() => {
                    createProject("Sample ITU Thesis", "itu-thesis", "en");
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium"
                >
                  Load Sample
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Visual Editor
              </h3>
              <p className="text-gray-600">
                Edit content with an intuitive drag-and-drop interface
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Template Support
              </h3>
              <p className="text-gray-600">
                Multiple institution templates with formatting rules
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                LaTeX Export
              </h3>
              <p className="text-gray-600">
                Export to professionally typeset LaTeX or PDF documents
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

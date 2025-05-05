"use client";

import { useState, useEffect } from "react";
import { useDocumentStore } from "@/lib/store";
import { Block } from "@/lib/types";
import axios from "axios";

interface BlockEditorProps {
  blockId: string;
}

const BlockEditor = ({ blockId }: BlockEditorProps) => {
  const { project, updateBlock } = useDocumentStore();
  const [block, setBlock] = useState<Block | null>(null);

  useEffect(() => {
    if (project && blockId) {
      const foundBlock = project.blocks.find((b) => b.id === blockId);
      if (foundBlock) {
        setBlock(foundBlock);
      }
    }
  }, [project, blockId]);

  if (!block) {
    return <div>Loading block...</div>;
  }

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBlock((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
    updateBlock(blockId, { [name]: value });
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    setBlock((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: numValue };
    });
    updateBlock(blockId, { [name]: numValue });
  };

  const handleTableChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (block.type !== "table") return;

    const newData = [...block.data];
    newData[rowIndex][colIndex] = value;

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    updateBlock(blockId, { data: newData });
  };

  const handleAddRow = () => {
    if (block.type !== "table") return;

    const numCols = block.data[0]?.length || 0;
    if (numCols === 0) return;

    const newRow = Array(numCols).fill("");
    const newData = [...block.data, newRow];

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    updateBlock(blockId, { data: newData });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (block.type !== "table" || rowIndex === 0) return; // Don't remove header row

    const newData = block.data.filter((_, index) => index !== rowIndex);

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    updateBlock(blockId, { data: newData });
  };

  const handleAddColumn = () => {
    if (block.type !== "table") return;

    const newData = block.data.map((row) => [...row, ""]);

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    updateBlock(blockId, { data: newData });
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (block.type !== "table") return;

    const newData = block.data.map((row) =>
      row.filter((_, index) => index !== colIndex)
    );

    setBlock((prev) => {
      if (!prev || prev.type !== "table") return prev;
      return { ...prev, data: newData };
    });

    updateBlock(blockId, { data: newData });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      e.target.files.length === 0 ||
      block.type !== "figure"
    )
      return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", "user123"); // This should come from auth in a real app
    formData.append("projectId", project?.id || "unknown");

    try {
      const response = await axios.post("/api/upload", formData);

      setBlock((prev) => {
        if (!prev || prev.type !== "figure") return prev;
        return { ...prev, imagePath: response.data.url };
      });

      updateBlock(blockId, { imagePath: response.data.url });
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  // Render different editors based on block type
  switch (block.type) {
    case "title-page":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Title Page</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={block.title}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={block.author}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={block.department}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              University
            </label>
            <input
              type="text"
              name="university"
              value={block.university}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="text"
              name="date"
              value={block.date}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Additional fields for ITU template */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">ITU Template Fields</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={block.studentId || ""}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <input
                type="text"
                name="program"
                value={block.program || ""}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supervisor
              </label>
              <input
                type="text"
                name="supervisor"
                value={block.supervisor || ""}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree
              </label>
              <input
                type="text"
                name="degree"
                value={block.degree || ""}
                onChange={handleTextChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      );

    case "abstract":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Abstract</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={8}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "chapter":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Chapter</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={block.title}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={12}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "section":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Section</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={block.title}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              name="level"
              value={block.level}
              onChange={handleNumberChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Section</option>
              <option value={2}>Subsection</option>
              <option value={3}>Subsubsection</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={8}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "figure":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Figure</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              name="caption"
              value={block.caption}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label (used for references)
            </label>
            <input
              type="text"
              name="label"
              value={block.label}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {block.imagePath ? (
              <div className="mt-2 relative">
                <img
                  src={block.imagePath}
                  alt={block.caption}
                  className="max-w-full h-auto mb-2 border"
                />
                <button
                  onClick={() => {
                    setBlock((prev) => {
                      if (!prev || prev.type !== "figure") return prev;
                      return { ...prev, imagePath: "" };
                    });
                    updateBlock(blockId, { imagePath: "" });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (additional notes, not rendered in LaTeX)
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={4}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "table":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Table</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              name="caption"
              value={block.caption}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label (used for references)
            </label>
            <input
              type="text"
              name="label"
              value={block.label}
              onChange={handleTextChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Data
            </label>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {block.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="p-1">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) =>
                              handleTableChange(
                                rowIndex,
                                colIndex,
                                e.target.value
                              )
                            }
                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      ))}
                      {rowIndex > 0 && (
                        <td className="p-1">
                          <button
                            onClick={() => handleRemoveRow(rowIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleAddRow}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Row
              </button>
              <button
                onClick={handleAddColumn}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Column
              </button>
              {block.data[0]?.length > 1 && (
                <button
                  onClick={() => handleRemoveColumn(block.data[0].length - 1)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove Column
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (additional notes, not rendered in LaTeX)
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={4}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "bibliography":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Bibliography</h2>
          <p className="text-gray-600">
            The bibliography will be automatically generated from your
            references. Go to the References tab to manage your citations.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content (additional notes, not rendered in LaTeX)
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={4}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "summary":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Summary</h2>
          <p className="text-gray-600 mb-2">
            This block is required for the ITU template. It should contain a
            summary of your thesis in English.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={8}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "appendices":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Appendices</h2>
          <p className="text-gray-600 mb-2">
            Use this block to add appendices to your thesis. For the ITU
            template, this will appear after the bibliography.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={8}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    case "cv":
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Curriculum Vitae</h2>
          <p className="text-gray-600 mb-2">
            This block is required for the ITU template. It should contain your
            CV in the format required by ITU.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={block.content}
              onChange={handleTextChange}
              rows={12}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="text-gray-500 p-4 text-center">Unknown block type</div>
      );
  }
};

export default BlockEditor;

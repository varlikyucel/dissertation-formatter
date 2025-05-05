"use client";

import { useState } from "react";
import { useDocumentStore } from "@/lib/store";
import { Citation } from "@/lib/types";

const CITATION_TYPES = [
  { value: "article", label: "Journal Article" },
  { value: "book", label: "Book" },
  { value: "inproceedings", label: "Conference Paper" },
  { value: "phdthesis", label: "PhD Thesis" },
  { value: "techreport", label: "Technical Report" },
  { value: "misc", label: "Miscellaneous" },
];

// Default empty citation
const getEmptyCitation = (type: Citation["type"]): Omit<Citation, "id"> => ({
  type,
  title: "",
  author: "",
  year: "",
  journal: type === "article" ? "" : undefined,
  volume: type === "article" ? "" : undefined,
  number: type === "article" ? "" : undefined,
  pages: ["article", "inproceedings", "book"].includes(type) ? "" : undefined,
  publisher: ["book", "inproceedings"].includes(type) ? "" : undefined,
  address: ["book", "inproceedings"].includes(type) ? "" : undefined,
  booktitle: type === "inproceedings" ? "" : undefined,
  school: type === "phdthesis" ? "" : undefined,
  institution: type === "techreport" ? "" : undefined,
});

// Get fields for a citation type
const getCitationFields = (type: Citation["type"]) => {
  const baseFields = ["title", "author", "year"];

  switch (type) {
    case "article":
      return [...baseFields, "journal", "volume", "number", "pages"];
    case "book":
      return [...baseFields, "publisher", "address", "pages"];
    case "inproceedings":
      return [...baseFields, "booktitle", "publisher", "address", "pages"];
    case "phdthesis":
      return [...baseFields, "school"];
    case "techreport":
      return [...baseFields, "institution"];
    case "misc":
      return baseFields;
    default:
      return baseFields;
  }
};

// Format field label for display
const formatFieldLabel = (field: string): string => {
  const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);

  switch (field) {
    case "booktitle":
      return "Conference/Book Title";
    case "journal":
      return "Journal";
    case "volume":
      return "Volume";
    case "number":
      return "Issue Number";
    case "pages":
      return "Pages";
    case "publisher":
      return "Publisher";
    case "school":
      return "University";
    case "institution":
      return "Institution";
    case "address":
      return "Address/City";
    default:
      return capitalizedField;
  }
};

const ReferenceManager = () => {
  const { project, addCitation, updateCitation, removeCitation } =
    useDocumentStore();
  const [editMode, setEditMode] = useState<"add" | "edit" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [citationData, setCitationData] = useState<Omit<Citation, "id">>(
    getEmptyCitation("article")
  );

  if (!project) {
    return <div className="text-center p-8">No project loaded</div>;
  }

  const { citations } = project;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      // Reset citation data when type changes
      setCitationData(getEmptyCitation(value as Citation["type"]));
    } else {
      setCitationData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editMode === "add") {
      addCitation(citationData);
    } else if (editMode === "edit" && selectedId) {
      updateCitation(selectedId, citationData);
    }

    resetForm();
  };

  const handleEdit = (citation: Citation) => {
    setEditMode("edit");
    setSelectedId(citation.id);
    setCitationData({
      type: citation.type,
      title: citation.title,
      author: citation.author,
      year: citation.year,
      journal: citation.journal,
      volume: citation.volume,
      number: citation.number,
      pages: citation.pages,
      publisher: citation.publisher,
      address: citation.address,
      booktitle: citation.booktitle,
      school: citation.school,
      institution: citation.institution,
    });
  };

  const resetForm = () => {
    setEditMode(null);
    setSelectedId(null);
    setCitationData(getEmptyCitation("article"));
  };

  // Get citation fields based on current type
  const fields = getCitationFields(citationData.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Bibliography References</h2>
        {!editMode && (
          <button
            onClick={() => setEditMode("add")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Citation
          </button>
        )}
      </div>

      {/* Edit/Add form */}
      {editMode && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded border space-y-4"
        >
          <h3 className="font-semibold text-lg">
            {editMode === "add" ? "Add New Citation" : "Edit Citation"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Citation Type
            </label>
            <select
              name="type"
              value={citationData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              {CITATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic fields based on citation type */}
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formatFieldLabel(field)}
              </label>
              {field === "author" ? (
                <textarea
                  name={field}
                  value={(citationData as any)[field] || ""}
                  onChange={handleChange}
                  rows={2}
                  placeholder={
                    field === "author" ? "Author1 and Author2 and Author3" : ""
                  }
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <input
                  type={field === "year" ? "number" : "text"}
                  name={field}
                  value={(citationData as any)[field] || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editMode === "add" ? "Add Citation" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Citation list */}
      {citations.length > 0 ? (
        <div className="bg-white border rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {citations.map((citation) => (
                <tr key={citation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {CITATION_TYPES.find((t) => t.value === citation.type)
                      ?.label || citation.type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {citation.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {citation.author}
                    </div>
                    {citation.journal && (
                      <div className="text-sm text-gray-500 italic">
                        {citation.journal}
                        {citation.volume && `, vol. ${citation.volume}`}
                        {citation.number && `, no. ${citation.number}`}
                      </div>
                    )}
                    {citation.booktitle && (
                      <div className="text-sm text-gray-500 italic">
                        {citation.booktitle}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {citation.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(citation)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeCitation(citation.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded border">
          No citations added yet. Add your first citation to start building your
          bibliography.
        </div>
      )}
    </div>
  );
};

export default ReferenceManager;

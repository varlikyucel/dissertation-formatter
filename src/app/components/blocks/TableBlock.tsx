import React from "react";
import { TableBlock as TableBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface TableBlockProps {
  block: TableBlockType;
  onUpdate?: (block: TableBlockType) => void;
}

export default function TableBlock({ block, onUpdate }: TableBlockProps) {
  const { isValid, errors } = validateBlock(block);

  // Display sample data if no table data exists
  const tableData =
    block.data && block.data.length > 0
      ? block.data
      : [
          ["Header 1", "Header 2", "Header 3"],
          ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
          ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
        ];

  return (
    <BaseBlock block={block} className="table-block">
      <div className="table-caption text-center mb-4">
        <p className="font-bold">
          {block.number ? `Table ${block.number}: ` : "Table: "}
          {block.caption || (
            <span className="italic text-gray-500">Enter table caption</span>
          )}
        </p>
      </div>

      <div className="table-container flex justify-center mb-4">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {tableData[0].map((cell, cellIndex) => (
                <th
                  key={cellIndex}
                  className="border border-gray-300 p-2 font-bold"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-300 p-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isValid && (
        <div className="validation-errors text-red-500 mt-4 text-center">
          {errors.map((error, index) => (
            <p key={index}>{error.message}</p>
          ))}
        </div>
      )}
    </BaseBlock>
  );
}

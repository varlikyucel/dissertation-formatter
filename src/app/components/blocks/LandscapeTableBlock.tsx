import React from "react";
import { LandscapeTableBlock as LandscapeTableBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface LandscapeTableBlockProps {
  block: LandscapeTableBlockType;
  onUpdate?: (block: LandscapeTableBlockType) => void;
}

export default function LandscapeTableBlock({
  block,
  onUpdate,
}: LandscapeTableBlockProps) {
  const { isValid, errors } = validateBlock(block);

  // Default empty table if no data
  const tableData =
    block.data && block.data.length > 0
      ? block.data
      : [
          ["", "", ""],
          ["", "", ""],
          ["", "", ""],
        ];

  return (
    <BaseBlock block={block} className="landscape-table-block">
      <div className="table-container flex flex-col items-center mb-4">
        <div
          className="overflow-x-auto w-full border p-2 mb-2"
          style={{ transform: "rotate(0deg)", maxWidth: "100%" }}
        >
          <div className="landscape-indicator text-gray-500 text-center mb-2">
            [Landscape Table]
          </div>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                {tableData[0].map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border border-gray-300 px-4 py-2 bg-gray-100"
                  >
                    {cell || `Header ${cellIndex + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {cell || `Cell ${rowIndex + 1}-${cellIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="caption text-center max-w-2xl mt-3">
          <p className="font-bold">
            {block.number ? `Table ${block.number}: ` : "Table: "}
            {block.caption || (
              <span className="italic text-gray-500">Enter table caption</span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">[Landscape orientation]</p>
        </div>
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

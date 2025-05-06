import React from "react";
import { ContinuedTableBlock as ContinuedTableBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ContinuedTableBlockProps {
  block: ContinuedTableBlockType;
  onUpdate?: (block: ContinuedTableBlockType) => void;
}

export default function ContinuedTableBlock({
  block,
  onUpdate,
}: ContinuedTableBlockProps) {
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
    <BaseBlock block={block} className="continued-table-block">
      <div className="table-container flex flex-col items-center mb-4">
        <div className="overflow-x-auto w-full border p-2 mb-2">
          {block.continuation && (
            <div className="continuation-indicator text-gray-500 text-right mb-2">
              (continued)
            </div>
          )}
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
          {block.continuation && (
            <div className="continuation-indicator text-gray-500 text-right mt-2">
              (to be continued)
            </div>
          )}
        </div>

        <div className="caption text-center max-w-2xl mt-3">
          <p className="font-bold">
            {block.number ? `Table ${block.number}: ` : "Table: "}
            {block.caption || (
              <span className="italic text-gray-500">Enter table caption</span>
            )}
            {block.continuation && " (continued)"}
          </p>
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

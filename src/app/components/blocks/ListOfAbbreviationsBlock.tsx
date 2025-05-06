import React from "react";
import { ListOfAbbreviationsBlock as ListOfAbbreviationsBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ListOfAbbreviationsBlockProps {
  block: ListOfAbbreviationsBlockType;
  onUpdate?: (block: ListOfAbbreviationsBlockType) => void;
}

export default function ListOfAbbreviationsBlock({
  block,
  onUpdate,
}: ListOfAbbreviationsBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="list-of-abbreviations-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">LIST OF ABBREVIATIONS</h2>
      </div>

      {block.abbreviations && block.abbreviations.length > 0 ? (
        <div className="abbreviations-table">
          <table className="w-full border-collapse">
            <tbody>
              {block.abbreviations.map((abbr, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-bold w-1/3">{abbr.term}</td>
                  <td className="py-2">{abbr.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          <p>
            Add your abbreviations here. Each abbreviation consists of a term
            (e.g., "ITU") and its definition (e.g., "Istanbul Technical
            University").
          </p>
          <p className="mt-2">Example:</p>
          <table className="w-full border-collapse mt-2">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-bold w-1/3">ITU</td>
                <td className="py-2">Istanbul Technical University</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold w-1/3">CPU</td>
                <td className="py-2">Central Processing Unit</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {!isValid && (
        <div className="validation-errors text-red-500 mt-4">
          {errors.map((error, index) => (
            <p key={index}>{error.message}</p>
          ))}
        </div>
      )}
    </BaseBlock>
  );
}

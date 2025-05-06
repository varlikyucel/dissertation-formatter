import React from "react";
import { ListOfSymbolsBlock as ListOfSymbolsBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface ListOfSymbolsBlockProps {
  block: ListOfSymbolsBlockType;
  onUpdate?: (block: ListOfSymbolsBlockType) => void;
}

export default function ListOfSymbolsBlock({
  block,
  onUpdate,
}: ListOfSymbolsBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="list-of-symbols-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">LIST OF SYMBOLS</h2>
      </div>

      {block.symbols && block.symbols.length > 0 ? (
        <div className="symbols-table">
          <table className="w-full border-collapse">
            <tbody>
              {block.symbols.map((symbol, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-bold text-center w-1/3 font-mono">
                    {symbol.symbol}
                  </td>
                  <td className="py-2">{symbol.definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 italic">
          <p>
            Add your mathematical symbols here. Each entry consists of a symbol
            (e.g., "α") and its definition (e.g., "alpha, thermal diffusivity").
          </p>
          <p className="mt-2">Example:</p>
          <table className="w-full border-collapse mt-2">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-bold text-center w-1/3 font-mono">
                  α
                </td>
                <td className="py-2">alpha, thermal diffusivity</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-bold text-center w-1/3 font-mono">
                  Δx
                </td>
                <td className="py-2">change in position</td>
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

import React from "react";
import { TurkishAbstractBlock as TurkishAbstractBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface TurkishAbstractBlockProps {
  block: TurkishAbstractBlockType;
  onUpdate?: (block: TurkishAbstractBlockType) => void;
}

export default function TurkishAbstractBlock({
  block,
  onUpdate,
}: TurkishAbstractBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="turkish-abstract-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">ÖZET</h2>
      </div>

      <div className="abstract-content prose max-w-none mb-8">
        {block.content || (
          <p className="italic text-gray-500">
            Özet metniniz buraya gelecektir. Özet, tezinizin kısa bir özetidir
            ve genellikle 150-300 kelime içerir. Araştırmanın amacını,
            metodolojisini, bulguları ve sonuçları içermelidir.
          </p>
        )}
      </div>

      <div className="keywords-section">
        <p className="font-bold mb-2">Anahtar Kelimeler:</p>
        <p>
          {block.keywords && block.keywords.length > 0 ? (
            block.keywords.join(", ")
          ) : (
            <span className="italic text-gray-500">
              Virgülle ayrılmış 3-5 anahtar kelime ekleyin
            </span>
          )}
        </p>
      </div>

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

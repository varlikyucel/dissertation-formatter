import React from "react";
import { BibliographyBlock as BibliographyBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface BibliographyBlockProps {
  block: BibliographyBlockType;
  onUpdate?: (block: BibliographyBlockType) => void;
}

export default function BibliographyBlock({
  block,
  onUpdate,
}: BibliographyBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="bibliography-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">REFERENCES</h2>
      </div>

      <div className="bibliography-content prose max-w-none">
        {block.content ? (
          <div dangerouslySetInnerHTML={{ __html: block.content }} />
        ) : (
          <div className="text-gray-500 italic">
            <p>
              Your bibliography will be automatically generated from your
              citations. The ITU thesis format uses a specific citation style
              based on the <code>itubib.bst</code> BibTeX style.
            </p>
            <p className="mt-4">Example references:</p>
            <ul className="pl-5 mt-2 space-y-4 list-none">
              <li>
                <p>
                  <span className="inline-block w-10">[1]</span> Smith, J.
                  (2020). "Title of the article," <em>Journal of Research</em>,
                  Vol. 15, No. 2, pp. 123-145.
                </p>
              </li>
              <li>
                <p>
                  <span className="inline-block w-10">[2]</span> Johnson, A. and
                  Williams, B. (2019). <em>Book Title</em>, Publisher, City.
                </p>
              </li>
              <li>
                <p>
                  <span className="inline-block w-10">[3]</span> Brown, C.
                  (2021). "Conference paper title,"{" "}
                  <em>Proceedings of the International Conference</em>, City,
                  Country, pp. 234-245.
                </p>
              </li>
            </ul>
          </div>
        )}
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

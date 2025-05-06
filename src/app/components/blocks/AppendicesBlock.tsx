import React from "react";
import { AppendicesBlock as AppendicesBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface AppendicesBlockProps {
  block: AppendicesBlockType;
  onUpdate?: (block: AppendicesBlockType) => void;
}

export default function AppendicesBlock({
  block,
  onUpdate,
}: AppendicesBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="appendices-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">APPENDICES</h2>
      </div>

      {block.appendices && block.appendices.length > 0 ? (
        <div className="appendices-content space-y-10">
          {block.appendices.map((appendix, index) => (
            <div key={index} className="appendix">
              <h3 className="text-lg font-bold mb-4">
                APPENDIX {appendix.letter}: {appendix.title}
              </h3>
              <div className="appendix-content prose max-w-none">
                {appendix.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic">
          <p>
            Add your appendices here. Each appendix consists of a letter (e.g.,
            "A"), a title, and content. Appendices are used for supplementary
            materials that would interrupt the flow of the main text if included
            there.
          </p>
          <p className="mt-4">Example appendix structure:</p>
          <div className="mt-4 p-4 border border-gray-200 rounded">
            <h3 className="text-lg font-bold mb-2">
              APPENDIX A: SURVEY QUESTIONS
            </h3>
            <p>
              This appendix contains the survey questions used in the
              research...
            </p>
          </div>
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

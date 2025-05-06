import React from "react";
import { TurkishTitlePageBlock as TurkishTitlePageBlockType } from "@/lib/types";
import BaseBlock from "./BaseBlock";
import { validateBlock } from "@/lib/validation";

interface TurkishTitlePageBlockProps {
  block: TurkishTitlePageBlockType;
  onUpdate?: (block: TurkishTitlePageBlockType) => void;
}

export default function TurkishTitlePageBlock({
  block,
  onUpdate,
}: TurkishTitlePageBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="turkish-title-page-block space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold uppercase">{block.title}</h1>

        <div className="author-info mt-12">
          <p className="text-lg">tarafından</p>
          <p className="text-xl mt-2">{block.author.name}</p>
          <p className="text-base mt-1">Öğrenci No: {block.author.studentId}</p>
        </div>

        <div className="department-info mt-12">
          <p className="text-base">{block.department}</p>
          <p className="text-base">{block.program}</p>
        </div>

        <div className="advisor-info mt-12">
          <p className="text-base">
            Tez Danışmanı: {block.advisor.title} {block.advisor.name}
          </p>
          {block.coAdvisor && (
            <p className="text-base mt-1">
              Eş Danışman: {block.coAdvisor.title} {block.coAdvisor.name}
            </p>
          )}
        </div>

        <div className="date-info mt-12">
          <p className="text-base">Teslim Tarihi: {block.submissionDate}</p>
          <p className="text-base mt-1">Savunma Tarihi: {block.defenseDate}</p>
        </div>
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

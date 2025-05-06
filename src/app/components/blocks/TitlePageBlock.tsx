import React from "react";
import { TitlePageBlock as TitlePageBlockType } from "@/lib/types";
import BaseBlock from "./BaseBlock";
import { validateBlock } from "@/lib/validation";

interface TitlePageBlockProps {
  block: TitlePageBlockType;
  onUpdate?: (block: TitlePageBlockType) => void;
}

export default function TitlePageBlock({
  block,
  onUpdate,
}: TitlePageBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="title-page-block space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold uppercase">{block.title}</h1>

        <div className="author-info mt-12">
          <p className="text-lg">by</p>
          <p className="text-xl mt-2">{block.author.name}</p>
          <p className="text-base mt-1">Student ID: {block.author.studentId}</p>
        </div>

        <div className="department-info mt-12">
          <p className="text-base">{block.department}</p>
          <p className="text-base">{block.program}</p>
        </div>

        <div className="advisor-info mt-12">
          <p className="text-base">
            Thesis Advisor: {block.advisor.title} {block.advisor.name}
          </p>
          {block.coAdvisor && (
            <p className="text-base mt-1">
              Co-advisor: {block.coAdvisor.title} {block.coAdvisor.name}
            </p>
          )}
        </div>

        <div className="date-info mt-12">
          <p className="text-base">Submission Date: {block.submissionDate}</p>
          <p className="text-base mt-1">Defense Date: {block.defenseDate}</p>
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

import React from "react";
import { CvBlock as CvBlockType } from "@/lib/types";
import BaseBlock from "./BaseBlock";
import { validateBlock } from "@/lib/validation";

interface CvBlockProps {
  block: CvBlockType;
  onUpdate?: (block: CvBlockType) => void;
}

export default function CvBlock({ block, onUpdate }: CvBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="cv-block">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase">CURRICULUM VITAE</h2>
      </div>

      <div className="cv-content">
        <div className="personal-info mb-8">
          <h3 className="text-lg font-bold mb-4">PERSONAL INFORMATION</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Name:</div>
            <div>{block.personalInfo?.name || "Enter your name"}</div>

            {block.personalInfo?.birthDate && (
              <>
                <div className="font-semibold">Date of Birth:</div>
                <div>{block.personalInfo.birthDate}</div>
              </>
            )}

            {block.personalInfo?.birthPlace && (
              <>
                <div className="font-semibold">Place of Birth:</div>
                <div>{block.personalInfo.birthPlace}</div>
              </>
            )}

            {block.personalInfo?.email && (
              <>
                <div className="font-semibold">Email:</div>
                <div>{block.personalInfo.email}</div>
              </>
            )}
          </div>
        </div>

        <div className="education mb-8">
          <h3 className="text-lg font-bold mb-4">EDUCATION</h3>
          {block.education && block.education.length > 0 ? (
            <ul className="space-y-4">
              {block.education.map((edu, index) => (
                <li key={index}>
                  <div className="font-semibold">{edu.year}</div>
                  <div>{edu.degree}</div>
                  <div className="text-gray-600">{edu.institution}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-500">Add your education history</p>
          )}
        </div>

        {block.publications && block.publications.length > 0 && (
          <div className="publications">
            <h3 className="text-lg font-bold mb-4">PUBLICATIONS</h3>
            <ul className="space-y-4">
              {block.publications.map((pub, index) => (
                <li key={index}>
                  <div className="font-semibold capitalize">{pub.type}:</div>
                  <div>{pub.citation}</div>
                </li>
              ))}
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

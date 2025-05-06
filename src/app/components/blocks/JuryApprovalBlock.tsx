import React from "react";
import { JuryApprovalBlock as JuryApprovalBlockType } from "@/lib/types";
import BaseBlock from "@/app/components/blocks/BaseBlock";
import { validateBlock } from "@/lib/validation";

interface JuryApprovalBlockProps {
  block: JuryApprovalBlockType;
  onUpdate?: (block: JuryApprovalBlockType) => void;
}

export default function JuryApprovalBlock({
  block,
  onUpdate,
}: JuryApprovalBlockProps) {
  const { isValid, errors } = validateBlock(block);

  return (
    <BaseBlock block={block} className="jury-approval-block">
      <div className="jury-header text-center mb-8">
        <h2 className="text-xl font-bold uppercase">JURY APPROVAL</h2>
        <p className="mt-4">Defense Date: {block.defenseDate}</p>
      </div>

      <div className="jury-members space-y-6">
        {block.juryMembers.map((member, index) => (
          <div key={index} className="jury-member border-b pb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {member.title} {member.name}
                </p>
                <p>{member.institution}</p>
                <p className="text-sm italic">
                  {member.role === "advisor"
                    ? "Thesis Advisor"
                    : member.role === "coAdvisor"
                    ? "Co-Advisor"
                    : "Jury Member"}
                </p>
              </div>
              <div className="signature-area border border-dashed w-32 h-16 flex items-center justify-center">
                {member.signature ? (
                  <span>Signed</span>
                ) : (
                  <span className="text-gray-400">No Signature</span>
                )}
              </div>
            </div>
          </div>
        ))}
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

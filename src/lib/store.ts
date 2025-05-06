import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  Block,
  Citation,
  Project,
  AVAILABLE_TEMPLATES,
  BlockType,
  MultiLineEquationBlock,
  SectionBlock,
} from "./types";
import { generateItuTemplateBlocks } from "./ituTemplate";

interface DocumentState {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  selectedBlockId: string | null;
  previewUrl: string | null;

  // Project actions
  createProject: (title: string, template: string, language?: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => Promise<Project>;
  setProjectTitle: (title: string) => void;
  setTemplate: (template: string) => void;
  setLanguage: (language: string) => void;
  setMetadata: (key: string, value: any) => void;
  resetStore: () => void;

  // Block actions
  addBlock: (blockData: Partial<Block>, type: Block["type"]) => string;
  updateBlock: (id: string, data: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  selectBlock: (id: string | null) => void;

  // Citation actions
  addCitation: (citationData: Omit<Citation, "id">) => string;
  updateCitation: (id: string, data: Partial<Citation>) => void;
  removeCitation: (id: string) => void;

  // Compilation
  setPreviewUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      project: null,
      isLoading: false,
      error: null,
      selectedBlockId: null,
      previewUrl: null,

      // Project actions
      createProject: (title, template, language) => {
        // Find the template configuration
        const templateConfig = AVAILABLE_TEMPLATES.find(
          (t) => t.id === template
        );

        if (!templateConfig) {
          console.error(`Template ${template} not found`);
          return;
        }

        // Use provided language or default from template
        const docLanguage = language || templateConfig.defaultLanguage;

        // Initialize empty metadata object with keys from template config
        const metadata: Record<string, any> = {};
        templateConfig.metadataFields.forEach((field) => {
          if (field.key === "submissionDate") {
            metadata[field.key] = "22 September 2024";
          } else if (field.key === "defenseDate") {
            metadata[field.key] = "21 December 2024";
          } else if (field.key === "juryMembers" && template === "itu") {
            metadata[field.key] = [
              {
                name: "Prof. Dr. Name SURNAME",
                university: "Istanbul Technical University",
                role: "Advisor",
              },
              {
                name: "Assoc. Prof. Dr. Name SURNAME",
                university: "Istanbul Technical University",
                role: "Co-advisor",
              },
              {
                name: "Prof. Dr. Name SURNAME",
                university: "Yıldız Technical University",
                role: "Member",
              },
              {
                name: "Prof. Dr. Name SURNAME",
                university: "Boğaziçi University",
                role: "Member",
              },
              {
                name: "Prof. Dr. Name SURNAME",
                university: "Gebze Institute of Technology",
                role: "Member",
              },
              {
                name: "Assoc. Prof. Dr. Name SURNAME",
                university: "Şişli Etfal Teaching Hospital",
                role: "Member",
              },
              {
                name: "Assoc. Prof. Dr. Name SURNAME",
                university: "Bilkent University",
                role: "Member",
              },
            ];
          } else {
            metadata[field.key] =
              field.type === "select" && field.options ? field.options[0] : "";
          }
        });

        // For ITU template, use the specialized template generator
        let initialBlocks: Block[] = [];

        if (template === "itu") {
          // Use our specialized ITU template generator
          initialBlocks = generateItuTemplateBlocks();
        } else {
          // Get the complete structure for other templates (required + default blocks)
          const templateBlocks = [
            ...new Set([
              ...templateConfig.requiredBlocks,
              ...templateConfig.defaultBlocks,
            ]),
          ];

          // Predefined document structure order - this dictates the logical order of components
          const blockOrderTemplate = [
            "title-page",
            "turkish-title-page",
            "jury-approval",
            "declaration",
            "dedication",
            "foreword",
            "table-of-contents",
            "list-of-tables",
            "list-of-figures",
            "list-of-abbreviations",
            "list-of-symbols",
            "abstract",
            "turkish-abstract",
            "chapter",
            "section",
            "figure",
            "subfigure",
            "landscape-figure",
            "table",
            "landscape-table",
            "continued-table",
            "inline-equation",
            "display-equation",
            "multi-line-equation",
            "bibliography",
            "appendices",
            "cv",
          ];

          // Sort blocks according to the predefined order
          templateBlocks.sort((a, b) => {
            const indexA = blockOrderTemplate.indexOf(a);
            const indexB = blockOrderTemplate.indexOf(b);
            return indexA - indexB;
          });

          const hasChapter = templateBlocks.includes("chapter");

          // Add blocks in the correct order
          templateBlocks.forEach((blockType, index) => {
            // Create a unique block ID
            const id = uuidv4();

            // Create default block with common properties
            const baseBlock = {
              id,
              type: blockType,
              order: index,
              content: "",
              visible: true,
            };

            // Different block types need different type assertions
            let newBlock: Partial<Block>;

            // Handle each block type with appropriate type assertion
            switch (blockType) {
              case "multi-line-equation":
                newBlock = {
                  ...baseBlock,
                  type: "multi-line-equation" as const,
                  equations: ["E = mc^2"], // Default equation
                };
                break;
              default:
                // Use type assertion to ensure TypeScript understands this is safe
                newBlock = { ...baseBlock } as Partial<Block>;
                break;
            }

            // Add special handling for chapters - add multiple if needed
            if (blockType === "chapter" && hasChapter) {
              // For chapters, add an introduction and several content chapters
              const chapterCount = 6; // Number of chapters to create by default for ITU
              let currentOrder = index;

              for (let i = 0; i < chapterCount; i++) {
                // Give appropriate chapter titles
                let chapterTitle = "";
                let chapterContent = "";
                const sectionsToAdd = [];

                if (i === 0) {
                  // Chapter 1: Introduction
                  chapterTitle = "Introduction";
                  chapterContent =
                    "Introduce your research topic, the problem statement, and the significance of your work.";
                  sectionsToAdd.push(
                    {
                      title: "Purpose of Thesis",
                      level: 2,
                      content:
                        "Explain the main purpose and goals of your thesis.",
                    },
                    {
                      title: "Literature Review",
                      level: 2,
                      content:
                        "Brief overview of relevant literature and research background.",
                    },
                    {
                      title: "Hypothesis",
                      level: 2,
                      content:
                        "Present your research hypothesis and questions.",
                    }
                  );
                } else if (i === 1) {
                  // Chapter 2: Literature Review
                  chapterTitle = "Literature Review";
                  chapterContent =
                    "Review the existing literature related to your research topic.";
                  sectionsToAdd.push(
                    {
                      title: "Previous Studies",
                      level: 2,
                      content:
                        "Detailed analysis of previous relevant studies in the field.",
                    },
                    {
                      title: "Theoretical Framework",
                      level: 2,
                      content:
                        "Discussion of the theoretical framework guiding your research.",
                      subsections: [
                        {
                          title: "Primary Theories",
                          level: 3,
                          content:
                            "Overview of the primary theories relevant to your study.",
                        },
                        {
                          title: "Applied Models",
                          level: 3,
                          content:
                            "Discussion of relevant applied models in the field.",
                        },
                      ],
                    }
                  );
                } else if (i === 2) {
                  // Chapter 3: Integrated Data
                  chapterTitle = "Integrated Data";
                  chapterContent =
                    "Description of the data sources and integration methods.";
                  sectionsToAdd.push(
                    {
                      title: "Data Sources",
                      level: 2,
                      content:
                        "Description of primary and secondary data sources.",
                    },
                    {
                      title: "Data Collection Methods",
                      level: 2,
                      content:
                        "Detailed explanation of data collection procedures.",
                    },
                    {
                      title: "Integration Techniques",
                      level: 2,
                      content:
                        "Methods used to integrate data from multiple sources.",
                    }
                  );
                  // Add a sample table in this chapter
                  sectionsToAdd.push({
                    isTable: true,
                    caption: "Sample Data Characteristics",
                    label: "tab:data",
                    data: [
                      ["Parameter", "Value", "Unit"],
                      ["Sample Size", "1024", "count"],
                      ["Time Range", "2020-2024", "years"],
                      ["Frequency", "Monthly", ""],
                      ["Coverage", "Regional", ""],
                    ],
                  });
                } else if (i === 3) {
                  // Chapter 4: Flow Prediction
                  chapterTitle = "Flow Prediction";
                  chapterContent =
                    "Describe the flow prediction models and approaches.";
                  sectionsToAdd.push(
                    {
                      title: "Methodology",
                      level: 2,
                      content:
                        "Detailed description of the methodological approach.",
                      subsections: [
                        {
                          title: "Statistical Methods",
                          level: 3,
                          content:
                            "Description of statistical methods employed in the study.",
                        },
                        {
                          title: "Computational Approach",
                          level: 3,
                          content:
                            "Overview of computational techniques and algorithms used.",
                        },
                      ],
                    },
                    {
                      title: "Model Implementation",
                      level: 2,
                      content: "Steps taken to implement the predictive model.",
                    }
                  );
                  // Add a sample figure and equation in this chapter
                  sectionsToAdd.push({
                    isFigure: true,
                    caption: "Flow Prediction Model Architecture",
                    label: "fig:flow-model",
                    content:
                      "Diagram showing the architecture of the flow prediction model.",
                    imagePath: "/templates/itu/fig/sekil1.png",
                  });
                  sectionsToAdd.push({
                    isEquation: true,
                    content: "F = \\alpha \\cdot Q + \\beta \\cdot P",
                    label: "eq:flow-model",
                    numbered: true,
                  });
                } else if (i === 4) {
                  // Chapter 5: Results and Discussion
                  chapterTitle = "Results and Discussion";
                  chapterContent =
                    "Present and discuss the findings of your research.";
                  sectionsToAdd.push(
                    {
                      title: "Experimental Results",
                      level: 2,
                      content: "Presentation of primary experimental results.",
                    },
                    {
                      title: "Statistical Analysis",
                      level: 2,
                      content: "Statistical analysis of the obtained results.",
                    },
                    {
                      title: "Model Evaluation",
                      level: 2,
                      content: "Evaluation of model performance and accuracy.",
                    },
                    {
                      title: "Comparative Analysis",
                      level: 2,
                      content:
                        "Comparison with existing approaches in the literature.",
                    }
                  );
                  // Add sample figures and tables in this chapter
                  sectionsToAdd.push({
                    isFigure: true,
                    caption: "Performance Comparison Between Models",
                    label: "fig:model-comparison",
                    content:
                      "Graph showing performance metrics for different models.",
                    imagePath: "/templates/itu/fig/sekil2.png",
                  });
                  sectionsToAdd.push({
                    isTable: true,
                    caption: "Summary of Performance Metrics",
                    label: "tab:metrics",
                    data: [
                      ["Model", "Accuracy", "Precision", "Recall", "F1-Score"],
                      ["Proposed Model", "92.3%", "91.7%", "93.1%", "92.4%"],
                      ["Baseline Model", "85.6%", "84.2%", "86.1%", "85.1%"],
                      [
                        "Literature Model A",
                        "88.4%",
                        "87.9%",
                        "89.2%",
                        "88.5%",
                      ],
                      [
                        "Literature Model B",
                        "86.9%",
                        "85.3%",
                        "87.5%",
                        "86.4%",
                      ],
                    ],
                  });
                } else if (i === 5) {
                  // Chapter 6: Conclusions
                  chapterTitle = "Conclusions";
                  chapterContent =
                    "Summarize your findings, discuss implications, and suggest future research directions.";
                  sectionsToAdd.push(
                    {
                      title: "Summary of Findings",
                      level: 2,
                      content: "Comprehensive summary of research findings.",
                    },
                    {
                      title: "Contributions",
                      level: 2,
                      content:
                        "Description of the main contributions of this thesis.",
                    },
                    {
                      title: "Limitations",
                      level: 2,
                      content:
                        "Discussion of limitations and constraints of the study.",
                    },
                    {
                      title: "Future Work",
                      level: 2,
                      content: "Suggestions for future research directions.",
                    }
                  );
                } else {
                  chapterTitle = `Chapter ${i + 1}`;
                  chapterContent = `Content for Chapter ${i + 1}`;
                }

                // Create the chapter block
                const chapterBlock = {
                  ...newBlock,
                  id: uuidv4(),
                  order: currentOrder++,
                  type: blockType,
                  title: chapterTitle,
                  content: chapterContent,
                  chapterNumber: i + 1,
                };

                initialBlocks.push(chapterBlock as Block);

                // Add a few direct paragraph blocks to the chapter
                if (chapterContent && chapterContent.length > 30) {
                  // Create 2-3 paragraphs from the chapter content
                  const paragraphs = chapterContent.split(/\.\s+/);
                  if (paragraphs.length > 1) {
                    const numParagraphs = Math.min(paragraphs.length, 3);
                    for (let p = 0; p < numParagraphs; p++) {
                      if (paragraphs[p].length < 15) continue; // Skip very short paragraphs

                      const paragraphBlock = {
                        id: uuidv4(),
                        type: "paragraph" as BlockType,
                        order: currentOrder++,
                        content: paragraphs[p].trim() + ".",
                        visible: true,
                        parentId: chapterBlock.id, // Direct child of chapter
                      };
                      initialBlocks.push(paragraphBlock as Block);
                    }
                  }
                }

                // Add sections, tables, figures to this chapter
                if (sectionsToAdd.length > 0) {
                  for (const sectionData of sectionsToAdd) {
                    if (sectionData.isTable) {
                      // Add a table
                      const tableBlock = {
                        id: uuidv4(),
                        type: "table" as BlockType,
                        order: currentOrder++,
                        content: `Table related to ${chapterTitle}`,
                        caption: sectionData.caption,
                        label: sectionData.label,
                        data: sectionData.data,
                        headerRow: true,
                        visible: true,
                        parentId: chapterBlock.id,
                      };
                      initialBlocks.push(tableBlock as Block);
                    } else if (sectionData.isFigure) {
                      // Add a figure
                      const figureBlock = {
                        id: uuidv4(),
                        type: "figure" as BlockType,
                        order: currentOrder++,
                        content: sectionData.content,
                        caption: sectionData.caption,
                        label: sectionData.label,
                        imagePath:
                          sectionData.imagePath ||
                          "/templates/itu/fig/sekil3.png",
                        visible: true,
                        parentId: chapterBlock.id,
                      };
                      initialBlocks.push(figureBlock as Block);
                    } else if (sectionData.isEquation) {
                      // Add an equation
                      const equationBlock = {
                        id: uuidv4(),
                        type: "equation" as BlockType,
                        order: currentOrder++,
                        content: sectionData.content,
                        label: sectionData.label,
                        numbered: sectionData.numbered,
                        visible: true,
                        parentId: chapterBlock.id,
                      };
                      initialBlocks.push(equationBlock as Block);
                    } else {
                      // Add a section
                      const sectionBlock = {
                        id: uuidv4(),
                        type: "section" as BlockType,
                        order: currentOrder++,
                        title: sectionData.title,
                        level: sectionData.level,
                        content: sectionData.content,
                        numbered: true,
                        visible: true,
                        parentId: chapterBlock.id,
                      };
                      initialBlocks.push(sectionBlock as Block);

                      // Add paragraphs to the section (for demonstration)
                      if (
                        sectionData.content &&
                        sectionData.content.length > 50
                      ) {
                        // Split the content into paragraphs
                        const contentParagraphs =
                          sectionData.content.split(/\.\s+/);
                        if (contentParagraphs.length > 1) {
                          contentParagraphs.forEach(
                            (paragraphContent, pIndex) => {
                              // Skip very short paragraphs
                              if (paragraphContent.length < 20) return;

                              const paragraphBlock = {
                                id: uuidv4(),
                                type: "paragraph" as BlockType,
                                order: currentOrder++,
                                content: paragraphContent.trim() + ".",
                                visible: true,
                                parentId: sectionBlock.id,
                              };
                              initialBlocks.push(paragraphBlock as Block);
                            }
                          );
                        } else {
                          // If there's only one paragraph, create at least two paragraphs
                          // to demonstrate the hierarchy better
                          const paraContent = sectionData.content;
                          const midPoint = Math.floor(paraContent.length / 2);
                          const firstSentence = paraContent.substring(
                            0,
                            midPoint
                          );
                          const secondSentence =
                            paraContent.substring(midPoint);

                          // Add two paragraphs
                          const paragraphBlock1 = {
                            id: uuidv4(),
                            type: "paragraph" as BlockType,
                            order: currentOrder++,
                            content: firstSentence.trim() + ".",
                            visible: true,
                            parentId: sectionBlock.id,
                          };
                          initialBlocks.push(paragraphBlock1 as Block);

                          const paragraphBlock2 = {
                            id: uuidv4(),
                            type: "paragraph" as BlockType,
                            order: currentOrder++,
                            content: secondSentence.trim() + ".",
                            visible: true,
                            parentId: sectionBlock.id,
                          };
                          initialBlocks.push(paragraphBlock2 as Block);
                        }
                      }

                      // Add subsections if they exist
                      if (sectionData.subsections) {
                        for (const subsectionData of sectionData.subsections) {
                          const subsectionBlock = {
                            id: uuidv4(),
                            type: "section" as BlockType,
                            order: currentOrder++,
                            title: subsectionData.title,
                            level: subsectionData.level,
                            content: subsectionData.content,
                            numbered: true,
                            visible: true,
                            parentId: sectionBlock.id,
                          };
                          initialBlocks.push(subsectionBlock as Block);
                        }
                      }
                    }
                  }
                }
              }
            }

            initialBlocks.push(newBlock as Block);
          });
        }

        const timestamp = Date.now();
        const newProject: Project = {
          id: uuidv4(),
          title,
          blocks: initialBlocks,
          citations: [],
          template,
          language: docLanguage,
          metadata,
          lastModified: timestamp,
          created: timestamp,
          version: "1.0.0",
        };
        set({
          project: newProject,
          selectedBlockId: initialBlocks[0]?.id || null,
        });
      },

      loadProject: (project) => {
        // Ensure the project has all required fields
        const updatedProject = {
          ...project,
          language: project.language || "en",
          metadata: project.metadata || {},
          created: project.created || project.lastModified || Date.now(),
          version: project.version || "1.0.0",
        };
        set({ project: updatedProject });
      },

      saveProject: async () => {
        const { project } = get();
        if (!project) throw new Error("No project to save");

        const updatedProject = {
          ...project,
          lastModified: Date.now(),
        };

        set({ project: updatedProject });
        return updatedProject;
      },

      setProjectTitle: (title) => {
        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: { ...state.project, title },
          };
        });
      },

      setTemplate: (template) => {
        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: { ...state.project, template },
          };
        });
      },

      setLanguage: (language) => {
        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: { ...state.project, language },
          };
        });
      },

      setMetadata: (key, value) => {
        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: {
              ...state.project,
              metadata: {
                ...state.project.metadata,
                [key]: value,
              },
            },
          };
        });
      },

      resetStore: () => {
        set({
          project: null,
          isLoading: false,
          error: null,
          selectedBlockId: null,
          previewUrl: null,
        });
      },

      // Block actions
      addBlock: (blockData, type) => {
        const id = uuidv4();
        const { project } = get();

        if (!project) throw new Error("No active project");

        const newBlock = {
          id,
          type,
          content: "",
          order: project.blocks.length,
          ...blockData,
        } as Block;

        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: {
              ...state.project,
              blocks: [...state.project.blocks, newBlock],
              lastModified: Date.now(),
            },
          };
        });

        return id;
      },

      updateBlock: (id, data) => {
        set((state) => {
          if (!state.project) return state;

          const blocks = state.project.blocks.map((block) =>
            block.id === id ? ({ ...block, ...data } as Block) : block
          );

          return {
            ...state,
            project: {
              ...state.project,
              blocks,
              lastModified: Date.now(),
            },
          };
        });
      },

      removeBlock: (id) => {
        set((state) => {
          if (!state.project) return state;

          const blocks = state.project.blocks
            .filter((block) => block.id !== id)
            .map((block, index) => ({ ...block, order: index }));

          return {
            ...state,
            project: {
              ...state.project,
              blocks,
              lastModified: Date.now(),
            },
          };
        });
      },

      reorderBlocks: (startIndex, endIndex) => {
        set((state) => {
          if (!state.project) return state;

          const blocks = [...state.project.blocks];
          const [removed] = blocks.splice(startIndex, 1);
          blocks.splice(endIndex, 0, removed);

          // Update order property of each block
          let reorderedBlocks = blocks.map((block, index) => ({
            ...block,
            order: index,
          }));

          // Now handle section hierarchy adjustments
          if (removed.type === "section") {
            const movedSection = removed as SectionBlock;
            const sectionsOnly = reorderedBlocks.filter(
              (b) => b.type === "section" || b.type === "chapter"
            );
            const movedSectionIndex = sectionsOnly.findIndex(
              (b) => b.id === movedSection.id
            );

            // Find the sections/chapters that come before and after the moved section
            const sectionBefore =
              movedSectionIndex > 0
                ? sectionsOnly[movedSectionIndex - 1]
                : null;
            const sectionAfter =
              movedSectionIndex < sectionsOnly.length - 1
                ? sectionsOnly[movedSectionIndex + 1]
                : null;

            // Get all direct children of the moved section
            const directChildren = reorderedBlocks.filter(
              (b) =>
                b.type === "section" &&
                (b as SectionBlock).parentId === movedSection.id
            );

            // Case 1: Section is moved before its parent - make it a sibling of the parent
            const currentParentId = movedSection.parentId;
            if (currentParentId) {
              const parentBlock = reorderedBlocks.find(
                (b) => b.id === currentParentId
              );
              const parentIndex = sectionsOnly.findIndex(
                (b) => b.id === currentParentId
              );

              if (parentBlock && parentIndex > movedSectionIndex) {
                // Section is now before its parent, make it a sibling of the parent
                const parentLevel =
                  parentBlock.type === "chapter"
                    ? 2
                    : (parentBlock as SectionBlock).level;
                const parentParentId =
                  parentBlock.type === "chapter"
                    ? undefined
                    : (parentBlock as SectionBlock).parentId;

                // Section becomes sibling of parent (same level as parent, same parent as parent)
                reorderedBlocks = reorderedBlocks.map((b) =>
                  b.id === movedSection.id
                    ? ({
                        ...b,
                        level: parentLevel,
                        parentId: parentParentId,
                      } as Block)
                    : b
                );
              }
            }

            // Case 2: Section is placed inside a new parent section
            if (sectionBefore && movedSection.level > 2) {
              const potentialNewParent = sectionBefore;
              const newParentLevel =
                potentialNewParent.type === "chapter"
                  ? 1
                  : (potentialNewParent as SectionBlock).level;

              // If section level is more than 1 greater than the previous section's level,
              // adjust it to be a proper child (exactly 1 level deeper)
              if (movedSection.level > newParentLevel + 1) {
                const newLevel = newParentLevel + 1;
                reorderedBlocks = reorderedBlocks.map((b) =>
                  b.id === movedSection.id
                    ? ({
                        ...b,
                        level: newLevel,
                        parentId: potentialNewParent.id,
                      } as Block)
                    : b
                );

                // Also adjust any children of this section recursively
                const adjustChildLevels = (
                  parentId: string,
                  levelDifference: number
                ) => {
                  const children = reorderedBlocks.filter(
                    (b) =>
                      b.type === "section" &&
                      (b as SectionBlock).parentId === parentId
                  );

                  children.forEach((child) => {
                    if (child.type === "section") {
                      const childSection = child as SectionBlock;
                      const newChildLevel = Math.min(
                        Math.max(childSection.level + levelDifference, 2),
                        5
                      ) as 2 | 3 | 4 | 5;

                      // Update this child's level
                      reorderedBlocks = reorderedBlocks.map((b) =>
                        b.id === child.id
                          ? ({ ...b, level: newChildLevel } as Block)
                          : b
                      );

                      // Recursively adjust this child's children
                      adjustChildLevels(child.id, levelDifference);
                    }
                  });
                };

                // Start recursive adjustment for children
                adjustChildLevels(
                  movedSection.id,
                  newLevel - movedSection.level
                );
              }
            }

            // Case 3: Section level is too high to be after a lower-level section (needs to move up)
            // e.g., a level 4 subsection can't come right after a level 2 section without a level 3 in between
            if (sectionBefore && sectionBefore.type === "section") {
              const prevSectionLevel = (sectionBefore as SectionBlock).level;

              // If this is a subsection that's now positioned after a section of 2+ levels higher,
              // adjust its level to be one level deeper than the previous section
              if (movedSection.level > prevSectionLevel + 1) {
                const newLevel = prevSectionLevel + 1;
                const levelDifference = newLevel - movedSection.level;

                // Update this section's level
                reorderedBlocks = reorderedBlocks.map((b) =>
                  b.id === movedSection.id
                    ? ({
                        ...b,
                        level: newLevel,
                        parentId: sectionBefore.id,
                      } as Block)
                    : b
                );

                // Recursively adjust all child sections
                const adjustChildLevels = (
                  parentId: string,
                  levelDifference: number
                ) => {
                  const children = reorderedBlocks.filter(
                    (b) =>
                      b.type === "section" &&
                      (b as SectionBlock).parentId === parentId
                  );

                  children.forEach((child) => {
                    if (child.type === "section") {
                      const childSection = child as SectionBlock;
                      const newChildLevel = Math.min(
                        Math.max(childSection.level + levelDifference, 2),
                        5
                      ) as 2 | 3 | 4 | 5;

                      // Update this child's level
                      reorderedBlocks = reorderedBlocks.map((b) =>
                        b.id === child.id
                          ? ({ ...b, level: newChildLevel } as Block)
                          : b
                      );

                      // Recursively adjust this child's children
                      adjustChildLevels(child.id, levelDifference);
                    }
                  });
                };

                // Start recursive adjustment for children
                adjustChildLevels(movedSection.id, levelDifference);
              }
            }
          }

          return {
            ...state,
            project: {
              ...state.project,
              blocks: reorderedBlocks,
              lastModified: Date.now(),
            },
          };
        });
      },

      selectBlock: (id) => {
        set({ selectedBlockId: id });
      },

      // Citation actions
      addCitation: (citationData: Omit<Citation, "id">) => {
        const id = uuidv4();
        // Be more explicit to satisfy the type checker
        const citation: Citation = {
          id,
          type: citationData.type,
          title: citationData.title,
          author: citationData.author,
          year: citationData.year,
          ...citationData, // Spread remaining optional fields
        };

        set((state) => {
          if (!state.project) return state;
          return {
            ...state,
            project: {
              ...state.project,
              citations: [...state.project.citations, citation],
              lastModified: Date.now(),
            },
          };
        });

        return id;
      },

      updateCitation: (id, data) => {
        set((state) => {
          if (!state.project) return state;

          const citations = state.project.citations.map((citation) =>
            citation.id === id ? { ...citation, ...data } : citation
          );

          return {
            ...state,
            project: {
              ...state.project,
              citations,
              lastModified: Date.now(),
            },
          };
        });
      },

      removeCitation: (id) => {
        set((state) => {
          if (!state.project) return state;

          const citations = state.project.citations.filter(
            (citation) => citation.id !== id
          );

          return {
            ...state,
            project: {
              ...state.project,
              citations,
              lastModified: Date.now(),
            },
          };
        });
      },

      // Compilation
      setPreviewUrl: (previewUrl) => {
        set({ previewUrl });
      },

      setError: (error) => {
        set({ error });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: "dissertation-store",
      // Only persist the project data
      partialize: (state) => ({ project: state.project }),
    }
  )
);

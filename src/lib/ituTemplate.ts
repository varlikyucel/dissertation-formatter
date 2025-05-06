import { Block, BlockType } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate starter blocks for the ITU template in the proper order
 */
export function generateItuTemplateBlocks(): Block[] {
  const blocks: Block[] = [];
  let currentOrder = 0;

  // Front Matter
  blocks.push(createTitlePageBlock(currentOrder++));
  blocks.push(createTurkishTitlePageBlock(currentOrder++));
  blocks.push(createJuryApprovalBlock(currentOrder++));
  blocks.push(createDeclarationBlock(currentOrder++));
  blocks.push(createDedicationBlock(currentOrder++));
  blocks.push(createForewordBlock(currentOrder++));

  // Table of Contents & Lists
  blocks.push(createTableOfContentsBlock(currentOrder++));
  blocks.push(createListOfFiguresBlock(currentOrder++));
  blocks.push(createListOfTablesBlock(currentOrder++));
  blocks.push(createListOfAbbreviationsBlock(currentOrder++));
  blocks.push(createListOfSymbolsBlock(currentOrder++));

  // Abstracts
  blocks.push(createAbstractBlock(currentOrder++));
  blocks.push(createTurkishAbstractBlock(currentOrder++));

  // Chapters
  const chapterCount = 6;
  for (let i = 0; i < chapterCount; i++) {
    const chapterBlock = createChapterBlock(currentOrder++, i + 1);
    blocks.push(chapterBlock);

    // Add sections to chapters
    if (i === 0) {
      // Introduction
      const section1 = createSectionBlock(
        currentOrder++,
        "Purpose of Thesis",
        2,
        chapterBlock.id
      );
      blocks.push(section1);

      // Add subsection example to first section
      const subsection1 = createSectionBlock(
        currentOrder++,
        "Third level title: Only first letter capital",
        3,
        section1.id
      );
      blocks.push(subsection1);

      // Add subsubsection example
      const subsubsection1 = createSectionBlock(
        currentOrder++,
        "Fourth level title: Only first letter capital",
        4,
        subsection1.id
      );
      blocks.push(subsubsection1);

      // Add fifth level heading example
      const level5Section = createSectionBlock(
        currentOrder++,
        "Fifth level title: No numbering after fourth level titles",
        5,
        subsubsection1.id
      );
      blocks.push(level5Section);

      // Add second section
      const section2 = createSectionBlock(
        currentOrder++,
        "Literature Review",
        2,
        chapterBlock.id
      );
      blocks.push(section2);

      // Add third section
      const section3 = createSectionBlock(
        currentOrder++,
        "Hypothesis",
        2,
        chapterBlock.id
      );
      blocks.push(section3);

      // Add example figure to this chapter
      const figure1 = createFigureBlock(currentOrder++, chapterBlock.id);
      blocks.push(figure1);

      // Add example table to this chapter
      const table1 = createTableBlock(currentOrder++, chapterBlock.id);
      blocks.push(table1);
    } else if (i === 1) {
      // Literature Review chapter
      const section1 = createSectionBlock(
        currentOrder++,
        "Previous Studies",
        2,
        chapterBlock.id
      );
      blocks.push(section1);

      const section2 = createSectionBlock(
        currentOrder++,
        "Theoretical Framework",
        2,
        chapterBlock.id
      );
      blocks.push(section2);
    } else if (i === 2) {
      // Methods chapter - add example equation blocks
      const section1 = createSectionBlock(
        currentOrder++,
        "Research Design",
        2,
        chapterBlock.id
      );
      blocks.push(section1);

      // Add inline equation
      const inlineEq = createInlineEquationBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(inlineEq);

      // Add display equation
      const displayEq = createDisplayEquationBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(displayEq);

      // Add multi-line equation
      const multiEq = createMultiLineEquationBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(multiEq);

      // Add subfigure
      const subfig = createSubfigureBlock(currentOrder++, chapterBlock.id);
      blocks.push(subfig);

      // Add landscape figure
      const landFig = createLandscapeFigureBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(landFig);

      // Add landscape table
      const landTable = createLandscapeTableBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(landTable);

      // Add continued table
      const contTable = createContinuedTableBlock(
        currentOrder++,
        chapterBlock.id
      );
      blocks.push(contTable);
    }
  }

  // Back Matter
  blocks.push(createBibliographyBlock(currentOrder++));
  blocks.push(createAppendicesBlock(currentOrder++));
  blocks.push(createCvBlock(currentOrder++));

  return blocks;
}

// Functions to create each block type with proper initial content

function createTitlePageBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "title-page",
    order,
    content: "",
    visible: true,
    title: "ITU THESIS TEMPLATE ENG (NUM) -- 1st LINE OF THESIS TITLE",
    author: {
      name: "Name SURNAME",
      studentId: "123123123",
    },
    department: "Department of Civil Engineering",
    program: "Structure Engineering Programme",
    advisor: {
      name: "Name SURNAME",
      title: "Prof. Dr.",
      institution: "Istanbul Technical University",
    },
    coAdvisor: {
      name: "Name SURNAME",
      title: "Assoc. Prof. Dr.",
      institution: "Istanbul Technical University",
    },
    submissionDate: "22 September 2024",
    defenseDate: "21 December 2024",
  } as Block;
}

function createTurkishTitlePageBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "turkish-title-page",
    order,
    content: "",
    visible: true,
    title: "ITU TEZ ŞABLONU ENG -- TEZ BAŞLIĞININ 1. SATIRI",
    author: {
      name: "Ad SOYAD",
      studentId: "123123123",
    },
    department: "İnşaat Mühendisliği Anabilim Dalı",
    program: "Yapı Mühendisliği Programı",
    advisor: {
      name: "Ad SOYAD",
      title: "Prof. Dr.",
      institution: "İstanbul Teknik Üniversitesi",
    },
    coAdvisor: {
      name: "Ad SOYAD",
      title: "Doç. Dr.",
      institution: "İstanbul Teknik Üniversitesi",
    },
    submissionDate: "22 Eylül 2024",
    defenseDate: "21 Aralık 2024",
  } as Block;
}

function createJuryApprovalBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "jury-approval",
    order,
    content: "",
    visible: true,
    juryMembers: [
      {
        name: "Name SURNAME",
        title: "Prof. Dr.",
        institution: "Istanbul Technical University",
        role: "advisor",
      },
      {
        name: "Name SURNAME",
        title: "Assoc. Prof. Dr.",
        institution: "Istanbul Technical University",
        role: "coAdvisor",
      },
      {
        name: "Name SURNAME",
        title: "Prof. Dr.",
        institution: "Yıldız Technical University",
        role: "member",
      },
      {
        name: "Name SURNAME",
        title: "Prof. Dr.",
        institution: "Boğaziçi University",
        role: "member",
      },
      {
        name: "Name SURNAME",
        title: "Prof. Dr.",
        institution: "Gebze Institute of Technology",
        role: "member",
      },
    ],
    defenseDate: "21 December 2024",
  } as Block;
}

function createDeclarationBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "declaration",
    order,
    content:
      "I hereby declare that all information in this document has been obtained and presented in accordance with academic rules and ethical conduct...",
    visible: true,
    signature: "",
    date: "21 December 2024",
  } as Block;
}

function createDedicationBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "dedication",
    order,
    content: "To my spouse and children,",
    visible: true,
  } as Block;
}

function createForewordBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "foreword",
    order,
    content:
      "I would like to express my deep appreciation to my thesis advisor, Prof. Dr. Name SURNAME for his/her guidance, encouragement and support throughout my research...",
    visible: true,
    date: "December 2024",
    signature: "Name SURNAME",
  } as Block;
}

function createTableOfContentsBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "table-of-contents",
    order,
    content: "",
    visible: true,
    autoGenerated: true,
  } as Block;
}

function createListOfFiguresBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "list-of-figures",
    order,
    content: "",
    visible: true,
    autoGenerated: true,
  } as Block;
}

function createListOfTablesBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "list-of-tables",
    order,
    content: "",
    visible: true,
    autoGenerated: true,
  } as Block;
}

function createListOfAbbreviationsBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "list-of-abbreviations",
    order,
    content: "",
    visible: true,
    abbreviations: [
      { term: "ITU", definition: "Istanbul Technical University" },
      { term: "e.g.", definition: "exempli gratia (for example)" },
      { term: "i.e.", definition: "id est (that is)" },
      { term: "et al.", definition: "et alii (and others)" },
      { term: "etc.", definition: "et cetera (and so forth)" },
    ],
  } as Block;
}

function createListOfSymbolsBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "list-of-symbols",
    order,
    content: "",
    visible: true,
    symbols: [
      { symbol: "E", definition: "Energy" },
      { symbol: "m", definition: "Mass" },
      { symbol: "c", definition: "Speed of light in vacuum" },
      { symbol: "F", definition: "Force" },
      { symbol: "\\alpha", definition: "Alpha" },
      { symbol: "\\beta", definition: "Beta" },
      { symbol: "\\gamma", definition: "Gamma" },
      { symbol: "\\Delta", definition: "Delta" },
    ],
  } as Block;
}

function createAbstractBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "abstract",
    order,
    content:
      "The abstract should be a concise summary of your thesis, typically 150-300 words. It should include the purpose of the research, methodology, findings, and conclusions. For English theses, the English abstract should be 1-3 pages long.",
    visible: true,
    keywords: ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  } as Block;
}

function createTurkishAbstractBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "turkish-abstract",
    order,
    content:
      "Özet, tezinizin kısa bir özetidir ve genellikle 150-300 kelime içerir. Araştırmanın amacını, metodolojisini, bulguları ve sonuçları içermelidir. İngilizce hazırlanmış tezlerde Türkçe özet (genişletilmiş Türkçe özet) 3-5 sayfa arasında olmalıdır.",
    visible: true,
    keywords: [
      "anahtarkelime1",
      "anahtarkelime2",
      "anahtarkelime3",
      "anahtarkelime4",
      "anahtarkelime5",
    ],
  } as Block;
}

function createChapterBlock(order: number, number: number): Block {
  let title = "";
  let content = "";

  switch (number) {
    case 1:
      title = "INTRODUCTION";
      content =
        "First level titles must be in capitals and bold, and placed on an odd page in the direction of reading.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent imperdiet, nisi nec aliquam cursus, dui turpis mollis nisl, ac consequat tellus sapien sit amet magna.";
      break;
    case 2:
      title = "LITERATURE REVIEW";
      content =
        "This chapter provides a comprehensive overview of the existing literature related to the research topic.";
      break;
    case 3:
      title = "THEORETICAL FRAMEWORK";
      content =
        "This chapter describes the theoretical framework that guides this research.";
      break;
    case 4:
      title = "METHODOLOGY";
      content =
        "This chapter explains the research methodology, data collection, and analysis techniques.";
      break;
    case 5:
      title = "RESULTS AND DISCUSSION";
      content =
        "This chapter presents the findings of the research and discusses their implications.";
      break;
    case 6:
      title = "CONCLUSIONS AND RECOMMENDATIONS";
      content =
        "This chapter summarizes the main findings, draws conclusions, and provides recommendations for future research.";
      break;
    default:
      title = `CHAPTER ${number}`;
      content = "Chapter content.";
  }

  return {
    id: uuidv4(),
    type: "chapter",
    order,
    content,
    visible: true,
    title,
    number,
  } as Block;
}

function createSectionBlock(
  order: number,
  title: string,
  level: number,
  parentId: string
): Block {
  return {
    id: uuidv4(),
    type: "section",
    order,
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent imperdiet, nisi nec aliquam cursus, dui turpis mollis nisl, ac consequat tellus sapien sit amet magna.",
    visible: true,
    title,
    level: level as any,
    parentId,
  } as Block;
}

function createFigureBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "figure",
    order,
    content: "",
    visible: true,
    caption: "Model structures",
    label: "fig:ch1-1",
    imagePath: "./fig/sekil1", // This would need to be a real path in the actual app
    number: "1.1",
    parentId,
  } as Block;
}

function createTableBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "table",
    order,
    content: "",
    visible: true,
    caption: "Table captions must be ended with a full stop.",
    label: "table1_ex",
    data: [
      ["Column A", "Column B", "Column C", "Column D"],
      ["Row A", "Row A", "Row A", "Row A"],
      ["Row B", "Row B", "Row B", "Row B"],
      ["Row C", "Row C", "Row C", "Row C"],
    ],
    number: "1.1",
    parentId,
  } as Block;
}

function createInlineEquationBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "inline-equation",
    order,
    content: "Example of an inline equation in text: $E = mc^2$",
    visible: true,
    equation: "E = mc^2",
    parentId,
  } as Block;
}

function createDisplayEquationBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "display-equation",
    order,
    content: "",
    visible: true,
    equation: "F = ma",
    number: "3.1",
    parentId,
  } as Block;
}

function createMultiLineEquationBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "multi-line-equation",
    order,
    content: "",
    visible: true,
    equations: [
      "f(x) = ax^2 + bx + c",
      "\\frac{\\partial f}{\\partial x} = 2ax + b",
      "\\frac{\\partial^2 f}{\\partial x^2} = 2a",
    ],
    numbers: ["3.2", "3.3", "3.4"],
    parentId,
  } as Block;
}

function createSubfigureBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "subfigure",
    order,
    content: "",
    visible: true,
    caption: "Sample subfigures showing different aspects of the model.",
    label: "fig:subfigures",
    subfigures: [
      {
        imagePath: "./fig/subfig1",
        caption: "First model component",
        label: "fig:subfig-a",
      },
      {
        imagePath: "./fig/subfig2",
        caption: "Second model component",
        label: "fig:subfig-b",
      },
    ],
    number: "3.1",
    parentId,
  } as Block;
}

function createLandscapeFigureBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "landscape-figure",
    order,
    content: "",
    visible: true,
    caption: "Large diagram showing the complete system architecture.",
    label: "fig:landscape",
    imagePath: "./fig/landscape",
    number: "3.2",
    parentId,
  } as Block;
}

function createLandscapeTableBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "landscape-table",
    order,
    content: "",
    visible: true,
    caption: "Comprehensive data from all experimental trials.",
    label: "tab:landscape",
    data: [
      [
        "Trial",
        "Parameter 1",
        "Parameter 2",
        "Parameter 3",
        "Parameter 4",
        "Parameter 5",
        "Parameter 6",
        "Result",
      ],
      [
        "1",
        "Value 1.1",
        "Value 1.2",
        "Value 1.3",
        "Value 1.4",
        "Value 1.5",
        "Value 1.6",
        "Result 1",
      ],
      [
        "2",
        "Value 2.1",
        "Value 2.2",
        "Value 2.3",
        "Value 2.4",
        "Value 2.5",
        "Value 2.6",
        "Result 2",
      ],
      [
        "3",
        "Value 3.1",
        "Value 3.2",
        "Value 3.3",
        "Value 3.4",
        "Value 3.5",
        "Value 3.6",
        "Result 3",
      ],
    ],
    number: "3.1",
    parentId,
  } as Block;
}

function createContinuedTableBlock(order: number, parentId: string): Block {
  return {
    id: uuidv4(),
    type: "continued-table",
    order,
    content: "",
    visible: true,
    caption: "Continued data from experimental trials.",
    label: "tab:continued",
    data: [
      ["Trial", "Parameter 1", "Parameter 2", "Parameter 3", "Result"],
      ["4", "Value 4.1", "Value 4.2", "Value 4.3", "Result 4"],
      ["5", "Value 5.1", "Value 5.2", "Value 5.3", "Result 5"],
      ["6", "Value 6.1", "Value 6.2", "Value 6.3", "Result 6"],
    ],
    number: "3.2",
    continuation: true,
    parentId,
  } as Block;
}

function createBibliographyBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "bibliography",
    order,
    content: "",
    visible: true,
    style: "itu",
  } as Block;
}

function createAppendicesBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "appendices",
    order,
    content: "",
    visible: true,
    appendices: [
      {
        letter: "A",
        title: "ADDITIONAL RESULTS",
        content:
          "This appendix contains additional results that were not included in the main text.",
      },
      {
        letter: "B",
        title: "QUESTIONNAIRE",
        content: "This appendix contains the questionnaire used in the study.",
      },
    ],
  } as Block;
}

function createCvBlock(order: number): Block {
  return {
    id: uuidv4(),
    type: "cv",
    order,
    content: "",
    visible: true,
    personalInfo: {
      name: "Name SURNAME",
      birthDate: "01.01.1990",
      birthPlace: "Istanbul, Turkey",
      email: "example@mail.com",
    },
    education: [
      {
        degree: "B.Sc.",
        institution:
          "Istanbul Technical University, Faculty of Engineering, Department of Civil Engineering",
        year: "2012",
      },
      {
        degree: "M.Sc.",
        institution:
          "Istanbul Technical University, Faculty of Engineering, Department of Civil Engineering",
        year: "2014",
      },
    ],
    publications: [
      {
        type: "journal",
        citation:
          "Surname, N., Ganapuram, S., Hamidov, A., Demirel, M. C., Bozkurt, E., Kındap, U., Newton, A. (2007). Erasmus Mundus Scholar's Perspective On Water And Coastal Management Education In Europe. International Journal of Example, 10(2), 15-25.",
      },
      {
        type: "conference",
        citation:
          "Surname, N., Ganapuram, S., Hamidov, A., Demirel, M. C., Bozkurt, E., Kındap, U., Newton, A. (2007). Erasmus Mundus Scholar's Perspective On Water And Coastal Management Education In Europe. International Congress - River Basin Management, March 22-24, 2007 Antalya, Turkey.",
      },
    ],
  } as Block;
}

# ITU Thesis Template

This is the official ITU (Istanbul Technical University) thesis template integrated into the Dissertation Formatter application. This template follows the ITU thesis guidelines and formatting requirements.

## Complete Template Integration

The complete ITU Thesis Template has been integrated into this application. The template includes:

1. **Class File (`itutez.cls`)**: The main LaTeX class file for ITU theses
2. **Bibliography Style (`itubib.bst`)**: The bibliography style for ITU theses
3. **Chapter Templates**: Pre-structured chapter files
4. **Supporting Files**: All additional files required by the template

## Required Blocks

When using the ITU template, make sure to include the following blocks in your document:

1. **Title Page** - Contains all the basic information about your thesis (title, author, student ID, department, etc.)
2. **Abstract** - A brief summary of your thesis in Turkish
3. **Summary** - A brief summary of your thesis in English
4. **Chapters** - The main content of your thesis (will be placed in ch1.tex, ch2.tex, etc.)
5. **Bibliography** - References cited in your thesis
6. **Appendices** - Additional material (optional)
7. **CV** - Your curriculum vitae

## Special Fields

The ITU template requires additional fields in the Title Page block:

- **Student ID** - Your university ID number
- **Program** - Your graduate program name
- **Supervisor** - Your thesis advisor's name and title
- **Degree** - The degree you're pursuing (default: Master of Science)

## How the Template Works

When you use the ITU template, the application:

1. Uses the original `tez.tex` as the main LaTeX file
2. Places your abstract in `ozet.tex`
3. Places your summary in `summary.tex`
4. Places your CV in `ozgecmis.tex`
5. Places your appendices in `ekler.tex`
6. Creates chapter files (ch1.tex, ch2.tex, etc.) based on your chapter blocks
7. Replaces key fields in the template with your metadata (title, author, etc.)

## Compilation and Export

When you compile or export your document:

1. All template files are copied to the compilation directory
2. Your content is integrated with the template
3. The LaTeX compilation process runs to generate a PDF
4. For exports, all template files and your content are included in the ZIP file

This ensures that your thesis follows the official ITU thesis format without requiring you to manually edit LaTeX files.

## Recommended Workflow

1. Select "ITU Thesis Template" when creating a new project
2. Add the Title Page block and fill in all required information
3. Add Abstract, Summary, Chapter, Bibliography, and CV blocks
4. Fill in your content in each block
5. Use the Compile button to preview your thesis
6. Export the final version when complete

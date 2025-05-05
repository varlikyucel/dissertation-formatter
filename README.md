# Dissertation Formatter

A web application that helps graduate students transform university-provided LaTeX templates into structured, well-formatted documents through an intuitive page-builder interface. By combining a block-based editor in React with a compilation pipeline, the app abstracts away LaTeX intricacies into simple drag-and-drop controls and real-time previews.

## Features

- **Block-Based Editing**: Build your dissertation as a sequence of semantic blocks (Title Page, Abstract, Chapter, Section, Figure, Table, Bibliography)
- **Drag-and-Drop Reordering**: Rearrange chapters, sections, and other elements visually
- **Citation Manager**: CRUD interface for BibTeX entries; automatically injects references into your document
- **Live Preview**: One-click compile of your current draft to PDF (via pdflatex and bibtex), displayed instantly
- **Project Persistence & Export**: Save/load projects, and export a ZIP containing .tex, .bib, images, and the compiled PDF

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **PDF Generation**: LaTeX (pdflatex, bibtex)
- **PDF Viewing**: React-PDF

## Prerequisites

- Node.js 18+ and npm
- LaTeX distribution installed on your system (e.g., TeX Live, MiKTeX)
- Supabase account for project database

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/dissertation-formatter.git
   cd dissertation-formatter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Create the necessary tables in Supabase:

   - `projects` table with columns:
     - id (uuid, primary key)
     - title (text)
     - user_id (text)
     - data (json)
     - created_at (timestamp with timezone)
     - updated_at (timestamp with timezone)
     - template (text)

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up the environment variables (Supabase credentials)
3. Deploy

Note: For the LaTeX compilation to work in a serverless environment, you'll need to use Vercel Functions with the "Texas" runtime that supports LaTeX, or alternatively use a separate Docker container service for the LaTeX compilation.

## Usage

1. Create a new project by providing a title
2. Add blocks to your document using the "Add Block" buttons
3. Edit block content in the right panel
4. Reorder blocks by dragging and dropping
5. Manage citations in the References tab
6. Click "Compile" to generate a PDF preview
7. Export the complete project as a ZIP for backup or external editing

## License

MIT

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Block, Citation, Project } from "./types";

interface DocumentState {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  selectedBlockId: string | null;
  previewUrl: string | null;

  // Project actions
  createProject: (title: string, template: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => Promise<Project>;
  setProjectTitle: (title: string) => void;
  setTemplate: (template: string) => void;

  // Block actions
  addBlock: (blockData: Partial<Block>, type: Block["type"]) => string;
  updateBlock: (id: string, data: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  selectBlock: (id: string | null) => void;

  // Citation actions
  addCitation: (citation: Omit<Citation, "id">) => string;
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
      createProject: (title, template) => {
        const newProject: Project = {
          id: uuidv4(),
          title,
          blocks: [],
          citations: [],
          template,
          lastModified: Date.now(),
        };
        set({ project: newProject });
      },

      loadProject: (project) => {
        set({ project });
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
          const reorderedBlocks = blocks.map((block, index) => ({
            ...block,
            order: index,
          }));

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
      addCitation: (citationData) => {
        const id = uuidv4();
        const citation: Citation = {
          id,
          ...citationData,
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

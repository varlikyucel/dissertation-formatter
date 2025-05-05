import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type DbProject = {
  id: string;
  title: string;
  user_id: string;
  data: string; // JSON string containing the entire project
  created_at: string;
  updated_at: string;
  template: string;
};

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as DbProject[];
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DbProject;
}

export async function saveProject(project: DbProject) {
  const { data, error } = await supabase
    .from("projects")
    .upsert({
      id: project.id,
      title: project.title,
      user_id: project.user_id,
      data: project.data,
      updated_at: new Date().toISOString(),
      template: project.template,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbProject;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw error;
  return true;
}

import { supabase } from "../supabase";

export interface Dataset {
  id: string;
  name: string;
  lastUpdated: string;
  size: string;
  type: string;
  description?: string;
  source?: string;
  format?: string;
}

export async function getDatasets() {
  const { data, error } = await supabase.from("datasets").select("*");

  if (error) throw error;
  return data as Dataset[];
}

export async function getDatasetById(id: string) {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Dataset;
}

export async function createDataset(datasetData: Omit<Dataset, "id">) {
  const { data, error } = await supabase
    .from("datasets")
    .insert([datasetData])
    .select();

  if (error) throw error;
  return data[0] as Dataset;
}

export async function updateDataset(id: string, updates: Partial<Dataset>) {
  const { data, error } = await supabase
    .from("datasets")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0] as Dataset;
}

export async function deleteDataset(id: string) {
  const { error } = await supabase.from("datasets").delete().eq("id", id);

  if (error) throw error;
  return true;
}

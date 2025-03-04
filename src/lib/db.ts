import { supabase } from "./supabase";

// Officers
export async function getOfficers() {
  const { data, error } = await supabase.from("officers").select("*");

  if (error) throw error;
  return data;
}

export async function getOfficerById(id: string) {
  const { data, error } = await supabase
    .from("officers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createOfficer(officerData: any) {
  const { data, error } = await supabase
    .from("officers")
    .insert([officerData])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateOfficer(id: string, updates: any) {
  const { data, error } = await supabase
    .from("officers")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

// Stations
export async function getStations() {
  const { data, error } = await supabase.from("stations").select("*");

  if (error) throw error;
  return data;
}

export async function getStationById(id: string) {
  const { data, error } = await supabase
    .from("stations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createStation(stationData: any) {
  const { data, error } = await supabase
    .from("stations")
    .insert([stationData])
    .select();

  if (error) throw error;
  return data[0];
}

// Cases
export async function getCases() {
  const { data, error } = await supabase.from("cases").select("*");

  if (error) throw error;
  return data;
}

export async function getCaseById(id: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCase(caseData: any) {
  const { data, error } = await supabase
    .from("cases")
    .insert([caseData])
    .select();

  if (error) throw error;
  return data[0];
}

// Reports
export async function getReports() {
  const { data, error } = await supabase.from("reports").select("*");

  if (error) throw error;
  return data;
}

export async function createReport(reportData: any) {
  const { data, error } = await supabase
    .from("reports")
    .insert([reportData])
    .select();

  if (error) throw error;
  return data[0];
}

// Crime Statistics
export async function getCrimeStats(timeRange?: string) {
  let query = supabase.from("crime_statistics").select("*");

  if (timeRange) {
    // Add time range filter logic here
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Datasets
export async function getDatasets() {
  const { data, error } = await supabase.from("datasets").select("*");

  if (error) throw error;
  return data;
}

export async function getDatasetById(id: string) {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDataset(datasetData: any) {
  const { data, error } = await supabase
    .from("datasets")
    .insert([datasetData])
    .select();

  if (error) throw error;
  return data[0];
}

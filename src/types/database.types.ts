export interface Officer {
  id: string;
  name: string;
  badge: string;
  rank: string;
  department: string;
  status: "active" | "on-leave" | "suspended";
  performance: number;
  joinDate: string;
  user_id?: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  district: string;
  officers: number;
  vehicles: number;
  status: "active" | "inactive" | "maintenance";
}

export interface Case {
  id: string;
  title: string;
  status: "open" | "closed" | "pending";
  dateCreated: string;
  lastUpdated: string;
  description: string;
  assignedOfficers: string[];
}

export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: string;
  dateCollected: string;
  location: string;
  status: string;
  description: string;
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  description: string;
  lastKnownLocation: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  description: string;
  incidentDate: string;
  location: string;
  involvedParties?: string;
  evidenceRefs?: string;
  officerId: string;
  departmentId: string;
  submittedDate: string;
  status: string;
}

export interface CrimeStat {
  id: string;
  date: string;
  category: string;
  count: number;
  region: string;
  timeOfDay?: string;
}

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

export interface Profile {
  id: string;
  role: "admin" | "officer" | "analyst";
  created_at: string;
}

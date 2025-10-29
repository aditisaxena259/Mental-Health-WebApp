export type Role = "student" | "admin" | "counselor";

export type ComplaintType =
  | "roommate"
  | "plumbing"
  | "cleanliness"
  | "electricity"
  | "Lost and Found"
  | "Other Issues";

export type ComplaintStatus = "open" | "inprogress" | "resolved";

export type ApologyType = "outing" | "misconduct" | "miscellaneous";
export type ApologyStatus = "submitted" | "reviewed" | "accepted" | "rejected";

export interface LoginResponse {
  message: string;
  token: string;
  role: Role;
}

export interface Complaint {
  id: string;
  title: string;
  type: ComplaintType;
  status: ComplaintStatus;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComplaintsListResponse {
  count: number;
  data: Complaint[];
}

export interface StatusSummary {
  open: number;
  inprogress: number;
  resolved: number;
  total: number;
}

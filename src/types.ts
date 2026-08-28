export interface Source {
  name: string;
  url: string;
  logoUrl?: string; // Optional custom logo, otherwise domain favicon fallback used
}

export interface Paper {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "counter-terrorism" | "military" | "crime";
  status: "pending" | "approved" | "rejected";
  authorId: string;
  authorEmail: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sources: Source[];
  rejectionReason?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

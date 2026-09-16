export type Role = "ADMIN" | "AGENT";

export type ContactType = "BUYER" | "SELLER" | "TENANT" | "OWNER";

export type LeadSource =
  | "NINETYNINE_ACRES"
  | "MAGICBRICKS"
  | "HOUSING_COM"
  | "REFERRAL"
  | "WALK_IN"
  | "OTHER";

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "SITE_VISIT"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type PropertyType = "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL";

export type PropertyStatus = "AVAILABLE" | "HOLD" | "SOLD" | "RENTED";

export type TaskStatus = "PENDING" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  type: ContactType;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  price: number;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  photoUrls: string[];
  ownerId: string | null;
  owner?: Contact | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  contactId: string;
  contact: Contact;
  source: LeadSource;
  stage: LeadStage;
  assignedAgentId: string | null;
  assignedAgent?: User | null;
  interestedPropertyId: string | null;
  interestedProperty?: Property | null;
  budget: number | null;
  notes: string | null;
  lastActivityAt: string;
  createdAt: string;
  needsFollowUp?: boolean;
}

export interface Task {
  id: string;
  leadId: string;
  lead?: Lead;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
}

export const LEAD_STAGES: LeadStage[] = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site Visit",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  NINETYNINE_ACRES: "99acres",
  MAGICBRICKS: "MagicBricks",
  HOUSING_COM: "Housing.com",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

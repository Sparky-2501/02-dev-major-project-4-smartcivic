import type { Database } from "@/integrations/supabase/types";

type AuthorityDomain = Database["public"]["Enums"]["authority_domain"];

export const categoryToDomain: Record<string, AuthorityDomain> = {
  "Pothole": "road_department",
  "Road Crack": "road_department",
  "Road Damage": "road_department",
  "Garbage Overflow": "garbage_management",
  "Garbage": "garbage_management",
  "Littering": "garbage_management",
  "Water Leakage": "water_supply",
  "Water Pipe": "water_supply",
  "Broken Streetlight": "electricity",
  "Power Outage": "electricity",
  "Traffic Obstruction": "traffic_department",
  "Traffic Signal": "traffic_department",
  "Traffic": "traffic_department",
  "Stray Animals": "animal_control",
  "Public Infrastructure": "public_infrastructure",
};

export const domainLabels: Record<AuthorityDomain, string> = {
  road_department: "Road Department",
  garbage_management: "Garbage Management",
  water_supply: "Water Supply",
  electricity: "Electricity",
  traffic_department: "Traffic Department",
  animal_control: "Animal Control",
  public_infrastructure: "Public Infrastructure",
};

export const statusLabels: Record<string, { label: string; class: string }> = {
  reported: { label: "Reported", class: "bg-destructive/10 text-destructive border-destructive/20" },
  in_progress: { label: "In Progress", class: "bg-warning/10 text-warning border-warning/20" },
  resolved: { label: "Resolved", class: "bg-success/10 text-success border-success/20" },
};

import { ReactNode } from "react";

export type UserRole = 'user' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LocationResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  items?: string[]; // Inventory list
  ownerId?: string; // ID of the vendor who owns this outlet
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface Category {
    id: string;
    label: string;
    icon: ReactNode;
}
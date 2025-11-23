import React from 'react';
import { Carrot, Apple, Wheat } from 'lucide-react';
import { Category } from './types';

// Default map center (VIT Bhopal University)
export const DEFAULT_CENTER: [number, number] = [23.0774, 76.8513];
export const DEFAULT_ZOOM = 16;

// South-West and North-East corners of Madhya Pradesh (Approximate with buffer)
export const MP_BOUNDS: [[number, number], [number, number]] = [
    [20.0, 73.0],  // South West
    [28.0, 84.0]   // North East
];

export const CATEGORIES: Category[] = [
    { id: 'vegetables', label: 'Vegetables', icon: <Carrot size={16} className="text-orange-500" /> },
    { id: 'fruits', label: 'Fruits', icon: <Apple size={16} className="text-red-500" /> },
    { id: 'grains', label: 'Grains', icon: <Wheat size={16} className="text-yellow-600" /> },
];

// Mock recent history for the sidebar
export const RECENT_SEARCHES = [
    { id: 1, name: "Ramu Fresh Vegetables", location: "Gate 1, VIT Bhopal", type: "vendor" },
    { id: 2, name: "Sehore Grain Market", location: "Kothri Kalan", type: "store" },
];
import type { Character } from "@/characters/types";

export type ShotStatus = "draft" | "queued" | "in_progress" | "completed" | "failed";

export interface Project {
  id: string;
  title: string;
  description: string;
  aspectRatio: string;
  visualStyle: string;
  defaultResolution: string;
  createdAt: number;
  updatedAt: number;
}

export interface Scene {
  id: string;
  projectId: string;
  number: number;
  title: string;
  summary: string;
  location: string;
  timeOfDay: string;
  mood: string;
  characterIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ShotCharacterAssignment {
  characterId: string;
  selectedLookStateId: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  number: string;
  title: string;
  description: string;
  shotType: string;
  cameraMovement: string;
  lens: string;
  duration: number;
  modelId: string;
  characterAssignments: ShotCharacterAssignment[];
  status: ShotStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectDraft extends Omit<Project, "id" | "createdAt" | "updatedAt"> {}
export interface SceneDraft extends Omit<Scene, "id" | "createdAt" | "updatedAt"> {}
export interface ShotDraft extends Omit<Shot, "id" | "createdAt" | "updatedAt"> {}

export interface PromptCharacter extends Character {
  selectedLookStateId: string;
}

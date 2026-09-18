import { create } from "zustand";
import { persist } from "zustand/middleware";

import { browserStorage } from "@/generation/stores/browser-storage";

import type { Project, ProjectDraft, Scene, SceneDraft, Shot, ShotDraft } from "./types";

interface ProjectState {
  projects: Project[];
  scenes: Scene[];
  shots: Shot[];
  activeProjectId: string | null;
  createProject: (draft: ProjectDraft) => string;
  updateProject: (id: string, patch: Partial<ProjectDraft>) => void;
  deleteProject: (id: string) => void;
  selectActiveProject: (id: string | null) => void;
  createScene: (draft: SceneDraft) => string;
  updateScene: (id: string, patch: Partial<SceneDraft>) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (projectId: string, orderedIds: string[]) => void;
  createShot: (draft: ShotDraft) => string;
  updateShot: (id: string, patch: Partial<ShotDraft>) => void;
  deleteShot: (id: string) => void;
  duplicateShot: (id: string) => string | null;
  reorderShots: (sceneId: string, orderedIds: string[]) => void;
  addDemoProject: (characterId: string, lookStateId?: string) => string;
}

function idFor(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stamp<T extends { updatedAt: number }, P extends Partial<Omit<T, "updatedAt">>>(value: T, patch: P): T {
  return { ...value, ...patch, updatedAt: Date.now() };
}

export const useProjects = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [], scenes: [], shots: [], activeProjectId: null,
      createProject: (draft) => {
        const id = idFor("project");
        const now = Date.now();
        set((state) => ({ projects: [{ ...draft, id, createdAt: now, updatedAt: now }, ...state.projects], activeProjectId: id }));
        return id;
      },
      updateProject: (id, patch) => set((state) => ({ projects: state.projects.map((item) => item.id === id ? stamp(item, patch) : item) })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((item) => item.id !== id), scenes: state.scenes.filter((item) => item.projectId !== id), shots: state.shots.filter((shot) => state.scenes.find((scene) => scene.id === shot.sceneId)?.projectId !== id), activeProjectId: state.activeProjectId === id ? state.projects.find((item) => item.id !== id)?.id ?? null : state.activeProjectId })),
      selectActiveProject: (id) => set({ activeProjectId: id }),
      createScene: (draft) => {
        const id = idFor("scene");
        const now = Date.now();
        set((state) => ({ scenes: [...state.scenes, { ...draft, id, createdAt: now, updatedAt: now }] }));
        return id;
      },
      updateScene: (id, patch) => set((state) => ({ scenes: state.scenes.map((item) => item.id === id ? stamp(item, patch) : item) })),
      deleteScene: (id) => set((state) => ({ scenes: state.scenes.filter((item) => item.id !== id), shots: state.shots.filter((shot) => shot.sceneId !== id) })),
      reorderScenes: (projectId, orderedIds) => set((state) => {
        const order = new Map(orderedIds.map((id, index) => [id, index]));
        return { scenes: state.scenes.map((scene) => order.has(scene.id) ? { ...scene, number: (order.get(scene.id) ?? 0) + 1, updatedAt: Date.now() } : scene).sort((a, b) => a.projectId === projectId && b.projectId === projectId ? a.number - b.number : 0) };
      }),
      createShot: (draft) => {
        const id = idFor("shot");
        const now = Date.now();
        set((state) => ({ shots: [...state.shots, { ...draft, id, createdAt: now, updatedAt: now }] }));
        return id;
      },
      updateShot: (id, patch) => set((state) => ({ shots: state.shots.map((item) => item.id === id ? stamp(item, patch) : item) })),
      deleteShot: (id) => set((state) => ({ shots: state.shots.filter((item) => item.id !== id) })),
      duplicateShot: (id) => {
        const original = useProjects.getState().shots.find((item) => item.id === id);
        if (!original) return null;
        const newId = idFor("shot");
        const now = Date.now();
        set((state) => ({ shots: [...state.shots, { ...original, id: newId, number: `${original.number} copy`, title: `${original.title} copy`, status: "draft", createdAt: now, updatedAt: now }] }));
        return newId;
      },
      reorderShots: (sceneId, orderedIds) => set((state) => {
        const order = new Map(orderedIds.map((id, index) => [id, index]));
        return { shots: state.shots.map((shot) => order.has(shot.id) ? { ...shot, number: `${(order.get(shot.id) ?? 0) + 1}`, updatedAt: Date.now() } : shot).sort((a, b) => a.sceneId === sceneId && b.sceneId === sceneId ? Number.parseInt(a.number, 10) - Number.parseInt(b.number, 10) : 0) };
      }),
      addDemoProject: (characterId, lookStateId = "") => {
        const projectId = idFor("project");
        const sceneId = idFor("scene");
        const now = Date.now();
        const shots: Shot[] = [
          { id: idFor("shot"), sceneId, number: "1A", title: "Palace exterior", description: "A wide establishing view of the palace before the news arrives.", shotType: "Wide", cameraMovement: "Slow push in", lens: "35mm", duration: 5, modelId: "seedance-2.5", characterAssignments: [{ characterId, selectedLookStateId: lookStateId }], status: "draft", createdAt: now, updatedAt: now },
          { id: idFor("shot"), sceneId, number: "1B", title: "David seated", description: "David sits in the royal chamber, listening.", shotType: "Medium", cameraMovement: "Static", lens: "50mm", duration: 4, modelId: "seedance-2.5", characterAssignments: [{ characterId, selectedLookStateId: lookStateId }], status: "draft", createdAt: now, updatedAt: now },
          { id: idFor("shot"), sceneId, number: "1C", title: "Messenger approaches", description: "A messenger crosses the room toward David.", shotType: "Tracking", cameraMovement: "Lateral track", lens: "50mm", duration: 5, modelId: "seedance-2.5", characterAssignments: [{ characterId, selectedLookStateId: lookStateId }], status: "draft", createdAt: now, updatedAt: now },
          { id: idFor("shot"), sceneId, number: "1D", title: "David reacts", description: "Close on David absorbing the impossible news.", shotType: "Close-up", cameraMovement: "Slow push in", lens: "85mm", duration: 4, modelId: "seedance-2.5", characterAssignments: [{ characterId, selectedLookStateId: lookStateId }], status: "draft", createdAt: now, updatedAt: now },
        ];
        const project: Project = { id: projectId, title: "2 Samuel", description: "A cinematic character-driven study of David's reign.", aspectRatio: "2.39:1", visualStyle: "Naturalistic biblical epic, tactile light, restrained camera", defaultResolution: "1080p", createdAt: now, updatedAt: now };
        const scene: Scene = { id: sceneId, projectId, number: 3, title: "David Receives the News", summary: "A messenger brings the news that changes the court.", location: "Royal palace chamber", timeOfDay: "Late afternoon", mood: "Held breath and dread", characterIds: [characterId], createdAt: now, updatedAt: now };
        set((state) => ({ projects: [project, ...state.projects], scenes: [...state.scenes, scene], shots: [...state.shots, ...shots], activeProjectId: projectId }));
        return projectId;
      },
    }),
    { name: "saga.projects.v1", storage: browserStorage(), partialize: (state) => ({ projects: state.projects, scenes: state.scenes, shots: state.shots, activeProjectId: state.activeProjectId }) },
  ),
);

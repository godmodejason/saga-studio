import { buildCharacterContinuityPrompt } from "@/characters/prompt";
import type { Character } from "@/characters/types";

import type { Project, Scene, Shot } from "./types";

export function buildShotPrompt(project: Project, scene: Scene, shot: Shot, characters: Character[]): string {
  const assigned = shot.characterAssignments.map((assignment) => {
    const character = characters.find((item) => item.id === assignment.characterId);
    const look = character?.lookStates.find((item) => item.id === assignment.selectedLookStateId);
    return character && look ? buildCharacterContinuityPrompt(character, look) : null;
  }).filter((prompt): prompt is string => prompt !== null);
  const characterSection = assigned.length > 0 ? ` Character continuity: ${assigned.join(" ")}` : "";
  return `Create a ${shot.shotType || "cinematic"} shot for ${project.title}. Visual style: ${project.visualStyle || "cinematic realism"}. Scene: ${scene.location || "established location"}, ${scene.timeOfDay || "established time"}, with a ${scene.mood || "focused"} mood. Shot description: ${shot.description || shot.title || "a purposeful cinematic moment"}. Camera movement: ${shot.cameraMovement || "natural movement"}; lens: ${shot.lens || "cinematic lens"}; duration: ${shot.duration || 0} seconds. ${characterSection}`.trim();
}

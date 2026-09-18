import type { Character, CharacterLookState } from "./types";

function phrase(value: string, fallback: string): string {
  return value.trim() || fallback;
}

export function buildCharacterContinuityPrompt(
  character: Character,
  lookState: CharacterLookState,
): string {
  const dna = character.dna;
  const age = lookState.age > 0 ? `approximately ${lookState.age} years old` : "the selected age";
  const lock = character.identityLocked
    ? "Maintain the established identity"
    : "Use the established identity as the foundation";
  const appearance = [
    phrase(dna.facialDescription, "the established facial structure"),
    phrase(dna.eyeColor, "the established eye color"),
    phrase(dna.skinTone, "the established skin tone"),
    phrase(dna.distinctiveFeatures, "the same recognizable distinctive features"),
  ].join(", ");
  const changes = [
    `Present ${character.name} at ${age}`,
    lookState.hairstyle.trim() && `with ${lookState.hairstyle.trim()} hair`,
    lookState.hairColor.trim() && `in ${lookState.hairColor.trim()} hair color`,
    lookState.beard.trim() && `with ${lookState.beard.trim()}`,
    lookState.wardrobe.trim() && `wearing ${lookState.wardrobe.trim()}`,
    lookState.makeup.trim() && `and ${lookState.makeup.trim()} makeup`,
    lookState.injuries.trim() && `with ${lookState.injuries.trim()}`,
    lookState.physicalCondition.trim() && `His physical condition is ${lookState.physicalCondition.trim()}`,
  ].filter((part): part is string => Boolean(part));
  const notes = lookState.notes.trim() ? ` ${lookState.notes.trim()}` : "";
  return `${lock} of ${character.name}: ${appearance}. ${changes.join(", ")}.${notes} Keep the result unmistakably the same person while allowing the selected Look State to change age, styling, wardrobe, and physical condition.`;
}

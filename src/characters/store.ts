import { create } from "zustand";
import { persist } from "zustand/middleware";

import { browserStorage } from "@/generation/stores/browser-storage";

import type {
  Character,
  CharacterDraft,
  CharacterLookState,
  CharacterReferenceImage,
  LookStateDraft,
} from "./types";

interface CharacterState {
  characters: Character[];
  createCharacter: (draft: CharacterDraft) => string;
  updateCharacter: (id: string, patch: Partial<CharacterDraft>) => void;
  deleteCharacter: (id: string) => void;
  addLookState: (characterId: string, draft: LookStateDraft) => string | null;
  updateLookState: (characterId: string, lookStateId: string, patch: Partial<LookStateDraft>) => void;
  deleteLookState: (characterId: string, lookStateId: string) => void;
  selectActiveLookState: (characterId: string, lookStateId: string) => void;
  toggleIdentityLock: (characterId: string) => void;
  addReferenceImage: (characterId: string, image: Omit<CharacterReferenceImage, "id" | "createdAt">) => void;
  removeReferenceImage: (characterId: string, imageId: string) => void;
  addDemoCharacter: () => string;
}

export const emptyDna = (): Character["dna"] => ({
  facialDescription: "",
  skinTone: "",
  eyeColor: "",
  distinctiveFeatures: "",
  bodyFrame: "",
  identityNotes: "",
});

function idFor(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function touch(character: Character, patch: Partial<Character>): Character {
  return { ...character, ...patch, updatedAt: Date.now() };
}

export const useCharacters = create<CharacterState>()(
  persist(
    (set) => ({
      characters: [],
      createCharacter: (draft) => {
        const id = idFor("character");
        const now = Date.now();
        const lookStates = draft.lookStates ?? [];
        const character: Character = {
          ...draft,
          id,
          referenceImages: draft.referenceImages ?? [],
          lookStates,
          activeLookStateId: draft.activeLookStateId ?? lookStates[0]?.id ?? null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ characters: [character, ...state.characters] }));
        return id;
      },
      updateCharacter: (id, patch) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === id ? touch(character, patch) : character,
          ),
        })),
      deleteCharacter: (id) =>
        set((state) => ({ characters: state.characters.filter((character) => character.id !== id) })),
      addLookState: (characterId, draft) => {
        const lookState: CharacterLookState = { ...draft, id: idFor("look") };
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id !== characterId
              ? character
              : touch(character, {
                  lookStates: [...character.lookStates, lookState],
                  activeLookStateId: character.activeLookStateId ?? lookState.id,
                }),
          ),
        }));
        return lookState.id;
      },
      updateLookState: (characterId, lookStateId, patch) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id !== characterId
              ? character
              : touch(character, {
                  lookStates: character.lookStates.map((lookState) =>
                    lookState.id === lookStateId ? { ...lookState, ...patch } : lookState,
                  ),
                }),
          ),
        })),
      deleteLookState: (characterId, lookStateId) =>
        set((state) => ({
          characters: state.characters.map((character) => {
            if (character.id !== characterId) return character;
            const lookStates = character.lookStates.filter((lookState) => lookState.id !== lookStateId);
            return touch(character, {
              lookStates,
              activeLookStateId:
                character.activeLookStateId === lookStateId ? lookStates[0]?.id ?? null : character.activeLookStateId,
            });
          }),
        })),
      selectActiveLookState: (characterId, lookStateId) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === characterId && character.lookStates.some((lookState) => lookState.id === lookStateId)
              ? touch(character, { activeLookStateId: lookStateId })
              : character,
          ),
        })),
      toggleIdentityLock: (characterId) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === characterId ? touch(character, { identityLocked: !character.identityLocked }) : character,
          ),
        })),
      addReferenceImage: (characterId, image) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === characterId
              ? touch(character, {
                  referenceImages: [...character.referenceImages, { ...image, id: idFor("reference"), createdAt: Date.now() }],
                })
              : character,
          ),
        })),
      removeReferenceImage: (characterId, imageId) =>
        set((state) => ({
          characters: state.characters.map((character) =>
            character.id === characterId
              ? touch(character, { referenceImages: character.referenceImages.filter((image) => image.id !== imageId) })
              : character,
          ),
        })),
      addDemoCharacter: () => {
        const davidId = idFor("character");
        const now = Date.now();
        const lookStates: CharacterLookState[] = [
          { id: idFor("look"), name: "Young Shepherd", age: 17, wardrobe: "simple shepherd clothing", hairstyle: "medium dark curls", hairColor: "dark brown", beard: "none", makeup: "none", injuries: "none", physicalCondition: "healthy and sun-browned", notes: "" },
          { id: idFor("look"), name: "Warrior", age: 25, wardrobe: "battle clothing", hairstyle: "dark curls", hairColor: "dark brown", beard: "short beard", makeup: "none", injuries: "minor healed scratches", physicalCondition: "dusty and battle-worn", notes: "" },
          { id: idFor("look"), name: "King", age: 35, wardrobe: "deep-blue royal robe with gold trim", hairstyle: "dark curls", hairColor: "dark brown", beard: "trimmed", makeup: "none", injuries: "none", physicalCondition: "composed and healthy", notes: "" },
          { id: idFor("look"), name: "Older King", age: 60, wardrobe: "deep-blue royal robe with gold trim", hairstyle: "dark curls", hairColor: "partially gray", beard: "gray", makeup: "none", injuries: "none", physicalCondition: "older and weathered", notes: "" },
        ];
        const character: Character = {
          id: davidId,
          name: "David",
          role: "Shepherd, warrior, and king",
          description: "A single identity shown across four chapters of a life.",
          identityLocked: true,
          referenceImages: [],
          dna: {
            facialDescription: "strong Middle Eastern facial structure",
            skinTone: "warm olive skin",
            eyeColor: "dark eyes",
            distinctiveFeatures: "same recognizable facial features as the supplied references",
            bodyFrame: "lean, athletic body frame",
            identityNotes: "Preserve the recognizable person while allowing the selected life stage and styling to change.",
          },
          lookStates,
          activeLookStateId: lookStates[0]!.id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ characters: [character, ...state.characters] }));
        return davidId;
      },
    }),
    {
      name: "saga.characters.v1",
      storage: browserStorage(),
      partialize: (state) => ({ characters: state.characters }),
    },
  ),
);

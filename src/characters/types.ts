export interface CharacterDna {
  facialDescription: string;
  skinTone: string;
  eyeColor: string;
  distinctiveFeatures: string;
  bodyFrame: string;
  identityNotes: string;
}

export interface CharacterReferenceImage {
  id: string;
  url: string;
  name: string;
  createdAt: number;
}

export interface CharacterLookState {
  id: string;
  name: string;
  age: number;
  wardrobe: string;
  hairstyle: string;
  hairColor: string;
  beard: string;
  makeup: string;
  injuries: string;
  physicalCondition: string;
  notes: string;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  identityLocked: boolean;
  referenceImages: CharacterReferenceImage[];
  dna: CharacterDna;
  lookStates: CharacterLookState[];
  activeLookStateId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type CharacterDraft = Omit<
  Character,
  "id" | "createdAt" | "updatedAt" | "referenceImages" | "lookStates" | "activeLookStateId"
> & {
  referenceImages?: CharacterReferenceImage[];
  lookStates?: CharacterLookState[];
  activeLookStateId?: string | null;
};

export type LookStateDraft = Omit<CharacterLookState, "id">;

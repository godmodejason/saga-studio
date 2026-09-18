"use client";

import { useEffect, useState } from "react";

import { buildCharacterContinuityPrompt } from "@/characters/prompt";
import { emptyDna, useCharacters } from "@/characters/store";
import type { Character, CharacterDna, CharacterLookState } from "@/characters/types";

import { CloseIcon, PlusIcon } from "./icons";

const emptyLook = (): Omit<CharacterLookState, "id"> => ({
  name: "New Look State",
  age: 0,
  wardrobe: "",
  hairstyle: "",
  hairColor: "",
  beard: "",
  makeup: "",
  injuries: "",
  physicalCondition: "",
  notes: "",
});

function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number";
}) {
  return (
    <label className="saga-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function CharacterCard({ character, selected, onSelect }: { character: Character; selected: boolean; onSelect: () => void }) {
  const look = character.lookStates.find((item) => item.id === character.activeLookStateId);
  const reference = character.referenceImages[0];
  return (
    <button type="button" className="saga-character-card" data-selected={selected} onClick={onSelect}>
      <span className="saga-character-art">
        {reference ? <img src={reference.url} alt="" /> : <span>{character.name.slice(0, 1).toUpperCase()}</span>}
      </span>
      <span className="saga-character-card-copy">
        <strong>{character.name || "Untitled character"}</strong>
        <span>{character.role || "No role yet"}</span>
        <small>{look?.name ?? "No Look State selected"}</small>
      </span>
      <span className="saga-lock-mark">{character.identityLocked ? "LOCKED" : "OPEN"}</span>
    </button>
  );
}

export function CharacterLibrary({ onBack }: { onBack: () => void }) {
  const characters = useCharacters((state) => state.characters);
  const createCharacter = useCharacters((state) => state.createCharacter);
  const updateCharacter = useCharacters((state) => state.updateCharacter);
  const deleteCharacter = useCharacters((state) => state.deleteCharacter);
  const addLookState = useCharacters((state) => state.addLookState);
  const updateLookState = useCharacters((state) => state.updateLookState);
  const deleteLookState = useCharacters((state) => state.deleteLookState);
  const selectActiveLookState = useCharacters((state) => state.selectActiveLookState);
  const toggleIdentityLock = useCharacters((state) => state.toggleIdentityLock);
  const addReferenceImage = useCharacters((state) => state.addReferenceImage);
  const removeReferenceImage = useCharacters((state) => state.removeReferenceImage);
  const addDemoCharacter = useCharacters((state) => state.addDemoCharacter);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [referenceUrl, setReferenceUrl] = useState("");

  useEffect(() => {
    if (selectedId && characters.some((character) => character.id === selectedId)) return;
    setSelectedId(characters[0]?.id ?? null);
  }, [characters, selectedId]);

  const character = characters.find((item) => item.id === selectedId) ?? null;
  const activeLook = character?.lookStates.find((item) => item.id === character.activeLookStateId) ?? null;

  function createNewCharacter() {
    const id = createCharacter({
      name: "New Character",
      role: "",
      description: "",
      identityLocked: true,
      dna: emptyDna(),
    });
    setSelectedId(id);
    setCreating(false);
  }

  function addLook() {
    if (!character) return;
    const id = addLookState(character.id, emptyLook());
    if (id) selectActiveLookState(character.id, id);
  }

  function addReference() {
    if (!character || !referenceUrl.trim()) return;
    addReferenceImage(character.id, { url: referenceUrl.trim(), name: "Character reference" });
    setReferenceUrl("");
  }

  return (
    <div className="saga-library">
      <header className="saga-library-header">
        <div>
          <button type="button" className="saga-back" onClick={onBack}>Back to Studio</button>
          <p className="saga-eyebrow">SAGA / CHARACTER SYSTEM</p>
          <h1>Character Library</h1>
          <p>Preserve identity. Change the life around it.</p>
        </div>
        <button type="button" className="saga-primary" onClick={() => setCreating(true)}><PlusIcon size={15} /> Create Character</button>
      </header>

      {creating && (
        <div className="saga-create-bar">
          <strong>Start a character record</strong>
          <span>Begin with an identity anchor, then shape the looks.</span>
          <button type="button" className="saga-primary" onClick={createNewCharacter}>Create</button>
          <button type="button" className="saga-icon-button" aria-label="Cancel" onClick={() => setCreating(false)}><CloseIcon size={14} /></button>
        </div>
      )}

      <div className="saga-library-layout">
        <aside className="saga-character-list">
          <div className="saga-section-kicker"><span>CHARACTERS</span><span>{characters.length.toString().padStart(2, "0")}</span></div>
          {characters.map((item) => <CharacterCard key={item.id} character={item} selected={item.id === selectedId} onSelect={() => setSelectedId(item.id)} />)}
          {characters.length === 0 && (
            <div className="saga-empty-library">
              <p>No characters yet.</p>
              <button type="button" className="saga-text-button" onClick={() => addDemoCharacter()}>Load David demo</button>
            </div>
          )}
        </aside>

        {character ? (
          <main className="saga-character-detail">
            <div className="saga-detail-head">
              <div>
                <input className="saga-title-input" value={character.name} aria-label="Character name" onChange={(event) => updateCharacter(character.id, { name: event.target.value })} />
                <Field label="Role" value={character.role} onChange={(value) => updateCharacter(character.id, { role: value })} />
              </div>
              <div className="saga-detail-actions">
                <button type="button" className="saga-lock-toggle" data-locked={character.identityLocked} onClick={() => toggleIdentityLock(character.id)}>{character.identityLocked ? "Identity Lock ON" : "Identity Lock OFF"}</button>
                <button type="button" className="saga-danger-button" onClick={() => { deleteCharacter(character.id); setSelectedId(null); }}>Delete</button>
              </div>
            </div>
            <Field label="Character description" value={character.description} multiline onChange={(value) => updateCharacter(character.id, { description: value })} />

            <section className="saga-panel saga-dna-panel">
              <div className="saga-panel-heading"><div><p className="saga-eyebrow">PERSISTENT IDENTITY</p><h2>CHARACTER DNA</h2></div><span className="saga-dna-badge">Preserved when Identity Lock is ON</span></div>
              <p className="saga-panel-copy">These traits anchor the recognizable person. Age, clothes, hair, beard, makeup, injuries, and physical condition belong in Look States below.</p>
              <div className="saga-field-grid">
                {(Object.keys(character.dna) as Array<keyof CharacterDna>).map((key) => (
                  <Field key={key} label={key.replace(/([A-Z])/g, " $1")} value={character.dna[key]} multiline onChange={(value) => updateCharacter(character.id, { dna: { ...character.dna, [key]: value } })} />
                ))}
              </div>
              <div className="saga-reference-row">
                <div><strong>Reference images</strong><span>Metadata only for this MVP. Generation remains unchanged.</span></div>
                <div className="saga-reference-add"><input placeholder="Paste image URL" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} /><button type="button" className="saga-secondary" onClick={addReference}>Add reference</button></div>
              </div>
              {character.referenceImages.length > 0 && <ul className="saga-reference-list">{character.referenceImages.map((image) => <li key={image.id}><img src={image.url} alt="" /><span>{image.name}</span><button type="button" className="saga-icon-button" aria-label={`Remove ${image.name}`} onClick={() => removeReferenceImage(character.id, image.id)}><CloseIcon size={12} /></button></li>)}</ul>}
            </section>

            <section className="saga-panel saga-look-panel">
              <div className="saga-panel-heading"><div><p className="saga-eyebrow">CONTROLLED VARIATION</p><h2>LOOK STATES</h2></div><button type="button" className="saga-secondary" onClick={addLook}><PlusIcon size={14} /> Add Look State</button></div>
              <p className="saga-panel-copy">Select a saved appearance to change age, styling, and condition while the underlying identity stays connected.</p>
              {character.lookStates.length > 0 ? (
                <div className="saga-look-tabs">{character.lookStates.map((look) => <button type="button" key={look.id} data-active={look.id === character.activeLookStateId} onClick={() => selectActiveLookState(character.id, look.id)}><strong>{look.name}</strong><span>{look.age > 0 ? `${look.age} years` : "Age unset"}</span></button>)}</div>
              ) : <div className="saga-look-empty">Add the first Look State to define a changeable appearance.</div>}
              {activeLook && <LookEditor character={character} look={activeLook} updateLookState={updateLookState} deleteLookState={deleteLookState} />}
            </section>
          </main>
        ) : (
          <div className="saga-no-selection"><span>01</span><h2>Your characters live here.</h2><p>Create a character or load the David demo to see identity and looks together.</p></div>
        )}
      </div>
    </div>
  );
}

function LookEditor({ character, look, updateLookState, deleteLookState }: { character: Character; look: CharacterLookState; updateLookState: (characterId: string, lookStateId: string, patch: Partial<CharacterLookState>) => void; deleteLookState: (characterId: string, lookStateId: string) => void }) {
  const set = (key: keyof CharacterLookState, value: string) => updateLookState(character.id, look.id, { [key]: key === "age" ? Number(value) || 0 : value });
  return (
    <div className="saga-look-editor">
      <div className="saga-look-editor-head"><Field label="Look State name" value={look.name} onChange={(value) => set("name", value)} /><button type="button" className="saga-danger-button" onClick={() => deleteLookState(character.id, look.id)}>Delete look</button></div>
      <div className="saga-field-grid">
        <Field label="Age" type="number" value={look.age || ""} onChange={(value) => set("age", value)} />
        <Field label="Wardrobe" value={look.wardrobe} onChange={(value) => set("wardrobe", value)} />
        <Field label="Hairstyle" value={look.hairstyle} onChange={(value) => set("hairstyle", value)} />
        <Field label="Hair color" value={look.hairColor} onChange={(value) => set("hairColor", value)} />
        <Field label="Beard" value={look.beard} onChange={(value) => set("beard", value)} />
        <Field label="Makeup" value={look.makeup} onChange={(value) => set("makeup", value)} />
        <Field label="Injuries" value={look.injuries} onChange={(value) => set("injuries", value)} />
        <Field label="Physical condition" value={look.physicalCondition} onChange={(value) => set("physicalCondition", value)} />
        <Field label="Notes" value={look.notes} multiline onChange={(value) => set("notes", value)} />
      </div>
      <div className="saga-prompt-preview"><span>CONTINUITY PROMPT</span><p>{buildCharacterContinuityPrompt(character, look)}</p></div>
    </div>
  );
}

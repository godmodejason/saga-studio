# SAGA Studio MVP

SAGA Studio's core filmmaking workflow is:

`Project → Character → Scene → Shot → Identity Lock → Generate → Storyboard`

## Workflow

- **Project**: Create the container for a film, its script, references, and
  generated media.
- **Character**: Define the people who appear in the story and reuse them
  across scenes and shots.
- **Scene**: Organize a moment from the script with its location, action,
  lighting, and participating characters.
- **Shot**: Turn a scene beat into a specific visual setup: framing, camera,
  movement, duration, and prompt.
- **Identity Lock**: Apply the selected character identity to a shot so the
  generated result stays recognizably consistent.
- **Generate**: Submit the shot to the existing Higgsfield generation system,
  then retain the result and its settings in generation history.
- **Storyboard**: Arrange generated shots in story order for review and
  iteration.

## Character System

### Character DNA

Character DNA is persistent identity information. It includes the face,
recognizable features, reference images, skin tone, and general body frame.
DNA should remain stable when a character is reused across the project.

### Look States

Look States are changeable attributes layered onto Character DNA for a scene or
shot. They include age, wardrobe, hairstyle, hair color, beard, injuries,
makeup, and physical condition.

A Look State can change from shot to shot without changing the underlying
Character DNA. Identity Lock preserves the DNA while applying the selected Look
State to generation.

## Existing Systems

This MVP workflow builds on the existing Higgsfield API generation system,
model catalog, gallery, upload system, and generation history. Those systems
remain available as the implementation grows toward project, character, scene,
and storyboard management.
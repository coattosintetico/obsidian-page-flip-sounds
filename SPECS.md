# Page Flip Sounds Plugin - Specifications

## Overview

An Obsidian plugin that plays page flip sounds when performing specific navigation actions.

## Supported Actions (Triggers)

1. **Opening a note** - When a note is opened
2. **Creating a new note** - When a new note is created
3. **Switching tabs** - When clicking any tab (including already-open notes)
4. **Clicking internal links** - When following a `[[wiki-link]]`
5. **Daily notes navigation** - When moving between daily notes via:
   - Commands (Open next/previous daily note)
   - Calendar plugin clicks

## Sound System

### Sound Pools

Two distinct sound pools:

| Pool | Name | Used For | Variants |
|------|------|----------|----------|
| A | Page Flip | Open note, switch tabs, internal links, daily notes | Multiple sounds (randomized) |
| B | New Note | Create new note only | Can be single or multiple |

When a pool has multiple sounds, one is randomly selected each time.

### Audio Format

- **Format**: OGG
- Built-in sounds ship with the plugin
- Sounds play with overlap allowed (no debouncing)

### Custom Sounds

Users can override default sounds by specifying a vault folder path with this structure:

```
<custom-folder>/
  page-flip/       # Pool A sounds
    sound1.ogg
    sound2.ogg
    ...
  new-note/        # Pool B sounds
    sound1.ogg
    ...
```

**Fallback behavior**: If custom folder is configured but files are missing:
- Show a warning notice to the user
- Fall back to built-in sounds

## Settings

### Controls

| Setting | Type | Description |
|---------|------|-------------|
| Master enable | Toggle | Enable/disable all sounds |
| Volume | Slider | Global volume control (affects all sounds) |
| Open note | Toggle | Enable sound on note open |
| Create note | Toggle | Enable sound on note creation |
| Switch tabs | Toggle | Enable sound on tab switch |
| Internal links | Toggle | Enable sound on link click |
| Daily notes | Toggle | Enable sound on daily note navigation |
| Custom sounds folder | Text | Path to vault folder with custom sounds |

### Preview

Each sound pool has a "Test sound" button in settings to preview without performing actions.

## Technical Requirements

- **Platform**: Desktop only (`isDesktopOnly: true` in manifest)
- **Mobile**: Not supported

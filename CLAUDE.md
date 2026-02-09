# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install              # Install dependencies
npm run dev              # Development build with watch mode
npm run build            # Production build (includes type checking)
npm run generate-sounds  # Regenerate sounds.generated.ts from OGG files
npm run lint             # Run ESLint
```

## Architecture

Obsidian plugin that plays page flip sounds on navigation actions (desktop only).

**Source structure:**
- `src/main.ts` - Plugin entry point, event handlers for detecting navigation actions
- `src/settings.ts` - Settings interface (`PageFlipSoundsSettings`), settings tab with toggles and preview buttons
- `src/audio.ts` - Sound playback utilities, custom sound loading from vault folders
- `src/sounds.generated.ts` - Auto-generated base64-encoded sounds (do not edit manually)

**Assets:**
- `assets/sounds/page-flip/*.ogg` - Page flip sound pool (randomized selection)
- `assets/sounds/new-note/*.ogg` - New note sound pool
- `scripts/generate-sounds.mjs` - Converts OGG files to base64 TypeScript module

**Sound pools:**
- Pool A ("page-flip"): open note, switch tabs, internal links, daily notes
- Pool B ("new-note"): create new note only

**Key detection mechanisms:**
- `active-leaf-change` event for tab switches and note opens
- `vault.on("create")` to track newly created files
- DOM click listener with `a.internal-link` selector for link clicks
- Command patching (`app.commands.executeCommandById`) for daily note commands

## Adding New Sounds

1. Add `.ogg` files to `assets/sounds/page-flip/` or `assets/sounds/new-note/`
2. Run `npm run generate-sounds` to regenerate the TypeScript module
3. Rebuild with `npm run build`

## Release Process

1. Update `version` in `manifest.json` (SemVer, no `v` prefix)
2. Update `versions.json` with version → minAppVersion mapping
3. Create GitHub release with tag matching version exactly
4. Attach `main.js`, `manifest.json`

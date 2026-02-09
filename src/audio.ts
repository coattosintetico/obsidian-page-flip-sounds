import { Notice, Vault } from "obsidian";
import { PAGE_FLIP_SOUNDS, NEW_NOTE_SOUNDS } from "./sounds.generated";

export type SoundPool = "page-flip" | "new-note";

interface CustomSounds {
    pageFlip: string[];
    newNote: string[];
}

let customSounds: CustomSounds | null = null;
let customSoundsPath: string | null = null;

function base64ToDataUrl(base64: string): string {
    return `data:audio/ogg;base64,${base64}`;
}

function pickRandom<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function loadCustomSounds(vault: Vault, folderPath: string): Promise<void> {
    if (!folderPath) {
        customSounds = null;
        customSoundsPath = null;
        return;
    }

    if (folderPath === customSoundsPath && customSounds !== null) {
        return;
    }

    const pageFlipDir = `${folderPath}/page-flip`;
    const newNoteDir = `${folderPath}/new-note`;

    const loaded: CustomSounds = {
        pageFlip: [],
        newNote: [],
    };

    let warnings: string[] = [];

    try {
        const pageFlipFolder = vault.getFolderByPath(pageFlipDir);
        if (pageFlipFolder) {
            const files = pageFlipFolder.children
                .filter(f => f.name.endsWith('.ogg'))
                .sort((a, b) => a.name.localeCompare(b.name));

            for (const file of files) {
                if ('extension' in file) {
                    const data = await vault.readBinary(file as any);
                    const base64 = arrayBufferToBase64(data);
                    loaded.pageFlip.push(base64ToDataUrl(base64));
                }
            }
        } else {
            warnings.push(`page-flip folder not found at ${pageFlipDir}`);
        }
    } catch (e) {
        warnings.push(`Error loading page-flip sounds: ${e}`);
    }

    try {
        const newNoteFolder = vault.getFolderByPath(newNoteDir);
        if (newNoteFolder) {
            const files = newNoteFolder.children
                .filter(f => f.name.endsWith('.ogg'))
                .sort((a, b) => a.name.localeCompare(b.name));

            for (const file of files) {
                if ('extension' in file) {
                    const data = await vault.readBinary(file as any);
                    const base64 = arrayBufferToBase64(data);
                    loaded.newNote.push(base64ToDataUrl(base64));
                }
            }
        } else {
            warnings.push(`new-note folder not found at ${newNoteDir}`);
        }
    } catch (e) {
        warnings.push(`Error loading new-note sounds: ${e}`);
    }

    if (warnings.length > 0) {
        new Notice(`Page Flip Sounds: ${warnings.join("; ")}. Falling back to built-in sounds.`);
    }

    customSounds = loaded;
    customSoundsPath = folderPath;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
}

export function clearCustomSounds(): void {
    customSounds = null;
    customSoundsPath = null;
}

function getSoundUrl(pool: SoundPool): string | undefined {
    if (pool === "page-flip") {
        if (customSounds && customSounds.pageFlip.length > 0) {
            return pickRandom(customSounds.pageFlip);
        }
        const base64 = pickRandom(PAGE_FLIP_SOUNDS);
        return base64 ? base64ToDataUrl(base64) : undefined;
    } else {
        if (customSounds && customSounds.newNote.length > 0) {
            return pickRandom(customSounds.newNote);
        }
        const base64 = pickRandom(NEW_NOTE_SOUNDS);
        return base64 ? base64ToDataUrl(base64) : undefined;
    }
}

export function playSound(pool: SoundPool, volume: number): void {
    const url = getSoundUrl(pool);
    if (!url) return;

    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
        // Ignore play errors (e.g., user hasn't interacted with page yet)
    });
}

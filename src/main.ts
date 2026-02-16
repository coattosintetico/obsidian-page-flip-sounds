import { Plugin, TFile, WorkspaceLeaf, MarkdownView } from "obsidian";
import { DEFAULT_SETTINGS, PageFlipSoundsSettings, PageFlipSoundsSettingTab } from "./settings";
import { playSound, loadCustomSounds } from "./audio";

export default class PageFlipSoundsPlugin extends Plugin {
    settings: PageFlipSoundsSettings;

    private lastActiveLeaf: WorkspaceLeaf | null = null;
    private lastFilePath: string | null = null;
    private recentlyCreatedFiles: Set<string> = new Set();
    private isInternalLinkNavigation = false;
    private isDailyNoteNavigation = false;
    async onload() {
        await this.loadSettings();

        if (this.settings.customSoundsFolder) {
            await loadCustomSounds(this.app.vault, this.settings.customSoundsFolder);
        }

        this.addSettingTab(new PageFlipSoundsSettingTab(this.app, this));

        // Track file creation
        this.registerEvent(
            this.app.vault.on("create", (file) => {
                if (file instanceof TFile && file.extension === "md") {
                    this.recentlyCreatedFiles.add(file.path);
                    // Clear after a short delay
                    setTimeout(() => {
                        this.recentlyCreatedFiles.delete(file.path);
                    }, 1000);
                }
            })
        );

        // Track active leaf changes (covers tab switches)
        this.registerEvent(
            this.app.workspace.on("active-leaf-change", (leaf) => {
                if (!this.settings.enabled || !leaf) return;

                const view = leaf.view instanceof MarkdownView ? leaf.view : null;
                const filePath = view?.file?.path ?? null;
                const isNewLeaf = leaf !== this.lastActiveLeaf;
                const isNewFile = filePath !== this.lastFilePath;
                const prevFilePath = this.lastFilePath;

                this.lastActiveLeaf = leaf;
                this.lastFilePath = filePath;

                // No change in leaf or file, skip
                if (!isNewLeaf && !isNewFile) return;

                // Skip file-resolve events on the same leaf. Plugins like
                // Calendar fire two leaf changes: first with no file (view
                // still loading), then with the resolved file. The sound
                // already played on the first (new-leaf) event, so suppress
                // the second (same-leaf, file-resolved) event.
                if (!isNewLeaf && isNewFile && prevFilePath === null) return;

                // Check if this is a recently created file
                if (filePath && this.recentlyCreatedFiles.has(filePath)) {
                    if (this.settings.onCreateNote) {
                        playSound("new-note", this.settings.volume);
                    }
                    this.recentlyCreatedFiles.delete(filePath);
                    return;
                }

                // Check if this is daily note navigation
                if (this.isDailyNoteNavigation) {
                    this.isDailyNoteNavigation = false;
                    if (this.settings.onDailyNote) {
                        playSound("page-flip", this.settings.volume);
                    }
                    return;
                }

                // Check if this is internal link navigation (file changed in same leaf)
                if (this.isInternalLinkNavigation) {
                    this.isInternalLinkNavigation = false;
                    if (this.settings.onInternalLink) {
                        playSound("page-flip", this.settings.volume);
                    }
                    return;
                }

                // Tab switch (leaf changed) or opening note via other means
                if (isNewLeaf && this.settings.onSwitchTab) {
                        playSound("page-flip", this.settings.volume);
                } else if (isNewFile && this.settings.onOpenNote) {
                        playSound("page-flip", this.settings.volume);
                }
            })
        );

        // Track internal link clicks
        this.registerDomEvent(document, "click", (evt: MouseEvent) => {
            if (!this.settings.enabled) return;

            const target = evt.target as HTMLElement;
            const link = target.closest("a.internal-link");
            if (link) {
                this.isInternalLinkNavigation = true;
                // Reset flag after a short delay if navigation didn't happen
                setTimeout(() => {
                    this.isInternalLinkNavigation = false;
                }, 200);
            }
        }, { capture: true });

        // Hook into daily notes commands
        this.patchDailyNotesCommands();
    }

    private patchDailyNotesCommands() {
        // We need to detect when daily note navigation commands are used
        // This includes both core daily notes and calendar plugin clicks

        const dailyNoteCommandIds = [
            "daily-notes:goto-next",
            "daily-notes:goto-prev",
            "daily-notes", // open today
        ];

        // Access the commands API (not fully typed in obsidian.d.ts)
        const commands = (this.app as any).commands;
        if (!commands?.executeCommandById) return;

        // Patch command execution to detect daily note navigation
        const originalExecuteCommandById = commands.executeCommandById.bind(commands);
        commands.executeCommandById = (commandId: string) => {
            if (this.settings.enabled && dailyNoteCommandIds.some(id => commandId.includes(id))) {
                this.isDailyNoteNavigation = true;
                setTimeout(() => {
                    this.isDailyNoteNavigation = false;
                }, 100);
            }
            return originalExecuteCommandById(commandId);
        };

        // Clean up on unload
        this.register(() => {
            commands.executeCommandById = originalExecuteCommandById;
        });
    }

    onunload() {
        this.lastActiveLeaf = null;
        this.lastFilePath = null;
        this.recentlyCreatedFiles.clear();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PageFlipSoundsSettings>);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

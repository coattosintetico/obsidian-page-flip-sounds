import { App, PluginSettingTab, Setting } from "obsidian";
import type PageFlipSoundsPlugin from "./main";
import { playSound, loadCustomSounds, clearCustomSounds } from "./audio";

export interface PageFlipSoundsSettings {
    enabled: boolean;
    volume: number;
    onOpenNote: boolean;
    onCreateNote: boolean;
    onSwitchTab: boolean;
    onInternalLink: boolean;
    onDailyNote: boolean;
    onCheckbox: boolean;
    customSoundsFolder: string;
}

export const DEFAULT_SETTINGS: PageFlipSoundsSettings = {
    enabled: true,
    volume: 0.5,
    onOpenNote: true,
    onCreateNote: true,
    onSwitchTab: true,
    onInternalLink: true,
    onDailyNote: true,
    onCheckbox: true,
    customSoundsFolder: "",
};

export class PageFlipSoundsSettingTab extends PluginSettingTab {
    plugin: PageFlipSoundsPlugin;

    constructor(app: App, plugin: PageFlipSoundsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Enable sounds")
            .setDesc("Master toggle for all page flip sounds")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.enabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Volume")
            .setDesc("Global volume for all sounds")
            .addSlider(slider => slider
                .setLimits(0, 1, 0.05)
                .setValue(this.plugin.settings.volume)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.volume = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl("h3", { text: "Actions" });

        new Setting(containerEl)
            .setName("Open note")
            .setDesc("Play sound when opening a note")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onOpenNote)
                .onChange(async (value) => {
                    this.plugin.settings.onOpenNote = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Create note")
            .setDesc("Play sound when creating a new note")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onCreateNote)
                .onChange(async (value) => {
                    this.plugin.settings.onCreateNote = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Switch tabs")
            .setDesc("Play sound when switching between tabs")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onSwitchTab)
                .onChange(async (value) => {
                    this.plugin.settings.onSwitchTab = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Internal links")
            .setDesc("Play sound when clicking internal links")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onInternalLink)
                .onChange(async (value) => {
                    this.plugin.settings.onInternalLink = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Daily notes")
            .setDesc("Play sound when navigating between daily notes")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onDailyNote)
                .onChange(async (value) => {
                    this.plugin.settings.onDailyNote = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName("Checkbox toggle")
            .setDesc("Play sound when toggling checkboxes in reading view")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.onCheckbox)
                .onChange(async (value) => {
                    this.plugin.settings.onCheckbox = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl("h3", { text: "Custom sounds" });

        new Setting(containerEl)
            .setName("Custom sounds folder")
            .setDesc("Path to a folder in your vault containing custom sounds (leave empty to use built-in sounds). Folder should contain 'page-flip', 'new-note', and/or 'checkbox' subfolders with .ogg files.")
            .addText(text => text
                .setPlaceholder("e.g., assets/sounds")
                .setValue(this.plugin.settings.customSoundsFolder)
                .onChange(async (value) => {
                    this.plugin.settings.customSoundsFolder = value.trim();
                    await this.plugin.saveSettings();
                    if (value.trim()) {
                        await loadCustomSounds(this.app.vault, value.trim());
                    } else {
                        clearCustomSounds();
                    }
                }));

        containerEl.createEl("h3", { text: "Preview" });

        new Setting(containerEl)
            .setName("Test page flip sound")
            .setDesc("Play a random sound from the page flip pool")
            .addButton(button => button
                .setButtonText("Test")
                .onClick(() => {
                    playSound("page-flip", this.plugin.settings.volume);
                }));

        new Setting(containerEl)
            .setName("Test new note sound")
            .setDesc("Play a random sound from the new note pool")
            .addButton(button => button
                .setButtonText("Test")
                .onClick(() => {
                    playSound("new-note", this.plugin.settings.volume);
                }));

        new Setting(containerEl)
            .setName("Test checkbox sound")
            .setDesc("Play a random sound from the checkbox pool")
            .addButton(button => button
                .setButtonText("Test")
                .onClick(() => {
                    playSound("checkbox", this.plugin.settings.volume);
                }));
    }
}

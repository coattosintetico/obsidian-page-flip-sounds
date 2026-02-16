PLUGIN_NAME := page-flip-sounds

ifndef OBSIDIAN_VAULT
$(error OBSIDIAN_VAULT is not set. Export it or pass it: make install OBSIDIAN_VAULT=/path/to/vault)
endif

PLUGIN_DIR := $(OBSIDIAN_VAULT)/.obsidian/plugins/$(PLUGIN_NAME)

.PHONY: build install

build:
	npm run build

install: build
	mkdir -p "$(PLUGIN_DIR)"
	cp main.js manifest.json "$(PLUGIN_DIR)/"
	@echo "Installed to $(PLUGIN_DIR)"

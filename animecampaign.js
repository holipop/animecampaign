// Anime Campaign for Foundry VTT
// by Holipop


import * as config from './module/config.js'
import * as Utils from './module/Utils.js'
import * as ChatMessage from './module/ChatMessage.js'
import * as List from './module/List.js'
import * as Macro from './module/Macro.js'
import * as Settings from './module/Settings.js'
import * as Migrate from './module/Migrate.js'

import ACActor from './module/documents/ACActor.js'
import ACItem from './module/documents/ACItem.js'

import CharacterData from './module/data-models/CharacterData.js'
import FeatureData from './module/data-models/FeatureData.js'
import Stat from './module/data-models/Stat.js'
import Section from './module/data-models/Section.js'
import Category from './module/data-models/Category.js'

import CharacterSheet from './module/applications/CharacterSheet.js'
import FeatureSheet from './module/applications/FeatureSheet.js'
import ACDialog from './module/applications/ACDialog.js'
import StatConfig from './module/applications/StatConfig.js'

import CharacterSheetV2 from './module/applications/CharacterSheetV2.js'

import ButtonComponent from './module/components/ButtonComponent.js'
import TextSelectComponent from './module/components/TextSelectComponent.js'

globalThis.AC = {
    Actor: ACActor,
    Item: ACItem,
    CharacterData,
    FeatureData,
    Stat,
    Section,
    Category,
    CharacterSheet,
    FeatureSheet,
    Dialog: ACDialog,
    StatConfig,
    Macro: { ...Macro },
    List: { ...List },
    Utils: { ...Utils },
}

Hooks.once('init', () => {
    Utils.log(config.AC.ascii);
    Utils.log('Initializing Anime Campaign System!');

    CONFIG.AC = config.AC;
    game.AC = AC

    CONFIG.Actor.documentClass = ACActor;
    CONFIG.Actor.dataModels["Character"] = CharacterData;

    CONFIG.Item.documentClass = ACItem;
    CONFIG.Item.dataModels["Feature"] = FeatureData;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheetV2, { 
        types: ["Character"],
        makeDefault: true 
    });
    Actors.registerSheet("animecampaign", CharacterSheet, { 
        types: ["Character"]
    });

    /* Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheet, { 
        types: ["Feature"],
        makeDefault: true 
    }); */

    Settings.register();

    const partials = {
        "stat-list": "systems/animecampaign/templates/stat-list.hbs",

        "character.summary": "systems/animecampaign/templates/character/summary.hbs",
        "character.main-stats": "systems/animecampaign/templates/character/main-stats.hbs",
        "character.nav": "systems/animecampaign/templates/character/nav.hbs",
        "character.kit": "systems/animecampaign/templates/character/kit.hbs",

        "feature.details": "systems/animecampaign/templates/feature/details.hbs",
    }
    loadTemplates(partials);

    customElements.define("ac-button", ButtonComponent)
    customElements.define("ac-text-select", TextSelectComponent)
})

Hooks.on('ready', () => {
    // !!! Remove post v1.0
    const currentVersion = game.settings.get('animecampaign', 'systemMigrationVersion');

    // If this is a brand new world, skip migration.
    const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
    if ( !currentVersion && totalDocuments === 0 ) { 
        return game.settings.set("animecampaign", "systemMigrationVersion", game.system.version);
    }

    /* if (currentVersion == "") {
        if (!game.user.isGM) {
            ui.notifications.warn(game.i18n.localize("AC.MIGRATION.WarnForGM"));
            return;
        }
        Migrate.toV1();
    } */

    game.settings.set("animecampaign", "systemMigrationVersion", game.system.version);

    const NEEDS_MIGRATION_VERSION = "v0.1";
})

// (Copied from DnD5e)
Hooks.on("canvasInit", gameCanvas => {
    gameCanvas.grid.diagonalRule = game.settings.get("animecampaign", "diagonalMovement");
    foundry.grid.SquareGrid.prototype.measureDistances = Utils.measureDistances;
});

Hooks.on('renderChatMessage', ChatMessage.activateListeners)
Hooks.on('hotbarDrop', Macro.createMacro)
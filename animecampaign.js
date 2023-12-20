// Anime Campaign for Foundry VTT
// by Holipop


import * as config from './module/config.js'
import * as Utils from './module/Utils.js'
import * as Roll from './module/Roll.js'
import * as List from './module/List.js'
import * as Macro from './module/Macro.js'
import * as Settings from './module/Settings.js'
import * as Migrate from './module/Migrate.js'

import ACActor from './module/documents/ACActor.js'
import CharacterData from './module/data-models/CharacterData.js'
import CharacterSheet from './module/sheets/CharacterSheet.js'

import ACItem from './module/documents/ACItem.js'
import FeatureData from './module/data-models/FeatureData.js'
import FeatureSheet from './module/sheets/FeatureSheet.js'

import Stat from './module/data-models/Stat.js'
import Section from './module/data-models/Section.js'
import Category from './module/data-models/Category.js'

globalThis.AC = {
    Actor: ACActor,
    Item: ACItem,
    CharacterData,
    CharacterSheet,
    FeatureData,
    FeatureSheet,
    Stat,
    Section,
    Category,
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
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheet, { makeDefault: true });

    Utils.preloadHandlebarsTemplates();
    Settings.register();
})

Hooks.on('ready', () => {
    // !!! Remove post v1.0
    const currentVersion = game.settings.get('animecampaign', 'systemMigrationVersion');

    // If this is a brand new world, skip migration.
    const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
    if ( !currentVersion && totalDocuments === 0 ) { 
        return game.settings.set("animecampaign", "systemMigrationVersion", game.system.version);
    }

    if (currentVersion == "") {
        if (!game.user.isGM) {
            ui.notifications.warn(game.i18n.localize("AC.MIGRATION.WarnForGM"));
            return;
        }
        Migrate.toV1();
    }

    const NEEDS_MIGRATION_VERSION = "v0.1";
})

// (Copied from DnD5e)
Hooks.on("canvasInit", gameCanvas => {
    gameCanvas.grid.diagonalRule = game.settings.get("animecampaign", "diagonalMovement");
    SquareGrid.prototype.measureDistances = Utils.measureDistances;
});

Hooks.on('renderChatMessage', Roll.listeners)
Hooks.on('hotbarDrop', Macro.createMacro)
// Anime Campaign for Foundry VTT
// by Holipop


import * as Utils from './module/Utils.js'
import * as ChatMessage from './module/ChatMessage.js'
import * as List from './module/List.js'
import * as Macro from './module/Macro.js'
import * as Settings from './module/Settings.js'
import * as Migrate from './module/Migrate.js'

import * as config from './module/config.js'
import * as Description from "./module/Description.js"

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

import CharacterSheetV2 from './module/applications-v2/CharacterSheetV2.js'
import FeatureSheetV2 from './module/applications-v2/FeatureSheetV2.js'

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
    /* Actors.registerSheet("animecampaign", CharacterSheet, { 
        types: ["Character"]
    }); */

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheetV2, { 
        types: ["Feature"],
        makeDefault: true 
    });

    Settings.register();

    const partials = {
        "generic.nav": "systems/animecampaign/templates/generic/nav.hbs",
        "generic.details": "systems/animecampaign/templates/generic/details.hbs",

        "character.summary": "systems/animecampaign/templates/character-v2/summary.hbs",
        "character.stats": "systems/animecampaign/templates/character-v2/stats.hbs",
        "character.kit": "systems/animecampaign/templates/character-v2/kit.hbs",
        "character.feature-entry": "systems/animecampaign/templates/character-v2/feature-entry.hbs",

        "feature.summary": "systems/animecampaign/templates/feature-v2/summary.hbs",
        "feature.stats": "systems/animecampaign/templates/feature-v2/stats.hbs",
    }
    loadTemplates(partials);
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

Hooks.on('renderChatMessage', (message, html, data) => {

    const messageElement = html[0].querySelector(".JS-ChatMessage")
    if (!messageElement) return

    // Expand roll tooltip on click
    const roll = messageElement.querySelector(".JS-ExpandTooltip")
    if (roll) {
        const tooltip = messageElement.querySelector("div.dice-tooltip")

        roll.addEventListener("click", event => {
            const display = tooltip.style.display
            tooltip.style.display = (display) ? "" : "block"
        })
    }
    
    const content = messageElement.querySelector(".JS-Content")
    Description.attachSections(content)

})


Hooks.on('hotbarDrop', Macro.createMacro)
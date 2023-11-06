// AC FVTT
import * as AC from './module/AC.js'
import * as config from './module/config.js'
import * as Roll from './module/Roll.js'
import * as List from './module/List.js'
import * as Macro from './module/Macro.js'

import ACActor from './module/documents/ACActor.js'
import CharacterData from './module/data-models/CharacterData.js'
import CharacterSheet from './module/sheets/CharacterSheet.js'

import ACItem from './module/documents/ACItem.js'
import FeatureData from './module/data-models/FeatureData.js'
import FeatureSheet from './module/sheets/FeatureSheet.js'

Hooks.once('init', () => {
    AC.log(config.animecampaign.ascii);
    AC.log('Initializing Anime Campaign System!');

    CONFIG.Actor.documentClass = ACActor;
    CONFIG.Actor.dataModels["Character"] = CharacterData;

    CONFIG.Item.documentClass = ACItem;
    CONFIG.Item.dataModels["Feature"] = FeatureData;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheet, { makeDefault: true });

    AC.preloadHandlebarsTemplates();
})

Hooks.once('ready', () => {
    game.animecampaign = {
        ...game.system,
        macros: { ...Macro },
        list: { ...List },
        AC: { ...AC },
    }
})

Hooks.once('i18nInit', () => {
    CONFIG.animecampaign = config.animecampaign;
    AC.settings();
})

// (Copied from DnD5e)
Hooks.on("canvasInit", gameCanvas => {
    gameCanvas.grid.diagonalRule = game.settings.get("animecampaign", "diagonalMovement");
    SquareGrid.prototype.measureDistances = AC.measureDistances;
});

Hooks.on('renderChatMessage', (message, html, data) => Roll.listeners(message, html, data))
Hooks.on('hotbarDrop', (hotbar, data, slot) => Macro.createMacro(data, slot))
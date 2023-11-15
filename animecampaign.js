// Anime Campaign for Foundry VTT
// by Holipop

import * as config from './module/config.js'
import * as Utils from './module/Utils.js'
import * as Roll from './module/Roll.js'
import * as List from './module/List.js'
import * as Macro from './module/Macro.js'
import * as Settings from './module/Settings.js'

import ACActor from './module/documents/ACActor.js'
import CharacterData from './module/data-models/CharacterData.js'
import CharacterSheet from './module/sheets/CharacterSheet.js'

import ACItem from './module/documents/ACItem.js'
import FeatureData from './module/data-models/FeatureData.js'
import FeatureSheet from './module/sheets/FeatureSheet.js'

Hooks.once('init', () => {
    Utils.log(config.AC.ascii);
    Utils.log('Initializing Anime Campaign System!');

    CONFIG.AC = config.AC;

    game.AC = {
        ...game.system,
        Macro: { ...Macro },
        List: { ...List },
        Utils: { ...Utils },
    }

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

// (Copied from DnD5e)
Hooks.on("canvasInit", gameCanvas => {
    gameCanvas.grid.diagonalRule = game.settings.get("animecampaign", "diagonalMovement");
    SquareGrid.prototype.measureDistances = Utils.measureDistances;
});

Hooks.on('renderChatMessage', (message, html, data) => Roll.listeners(message, html, data))
Hooks.on('hotbarDrop', (hotbar, data, slot) => Macro.createMacro(data, slot))
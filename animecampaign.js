// AC FVTT
import * as AC from './module/helper/AC.js'
import * as config from './module/config.js'

import * as Document from "./module/Document.js"
import * as Sheet from "./module/Sheet.js"

import CharacterData from './module/data-models/CharacterData.js'

import FeatureData from './module/data-models/FeatureData.js'

// Fires right before Foundry starts initialization steps.
Hooks.once('init', () => {
    AC.log('Initializing Anime Campaign System!');

    CONFIG.Actor.documentClass = Document.ACActor;
    CONFIG.Actor.dataModels["Character"] = CharacterData;

    CONFIG.Item.documentClass = Document.ACItem;
    CONFIG.Item.dataModels["Feature"] = FeatureData;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", Sheet.CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", Sheet.FeatureSheet, { makeDefault: true });

    AC.preloadHandlebarsTemplates();
})

// Fires once localization translations have been loaded and are ready for use.
Hooks.once('i18nInit', () => {
    CONFIG.animecampaign = config.animecampaign;
})

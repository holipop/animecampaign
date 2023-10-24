// AC FVTT
import * as AC from './module/AC.js'
import * as config from './module/config.js'

import * as Data from './module/Data.js'
import * as Document from "./module/Document.js"

import ACActor from './module/_documents/ACActor.js';
import CharacterData from './module/_data-models/CharacterData.js';
import CharacterSheet from './module/sheets/CharacterSheet.js';

import ACItem from './module/_documents/ACItem.js';
import FeatureData from './module/_data-models/FeatureData.js';
import FeatureSheet from './module/sheets/FeatureSheet.js';

// Fires right before Foundry starts initialization steps.
Hooks.once('init', () => {
    AC.log('Initializing Anime Campaign System!');

    CONFIG.Actor.documentClass = Document.ACActor;
    CONFIG.Actor.dataModels["Character"] = Data.Character;

    CONFIG.Item.documentClass = Document.ACItem;
    CONFIG.Item.dataModels["Feature"] = Data.Feature;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", FeatureSheet, { makeDefault: true });

    AC.preloadHandlebarsTemplates();
})

// Fires once localization translations have been loaded and are ready for use.
Hooks.once('i18nInit', () => {
    CONFIG.animecampaign = config.animecampaign;
})

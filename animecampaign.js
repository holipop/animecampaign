// AC FVTT
import * as AC from './module/AC.js'
import * as config from './module/config.js'

import ACActor from './module/documents/ACActor.js'
import CharacterData from './module/data-models/CharacterData.js'
import CharacterSheet from './module/sheets/CharacterSheet.js'

import ACItem from './module/documents/ACItem.js'
import FeatureData from './module/data-models/FeatureData.js'
import FeatureSheet from './module/sheets/FeatureSheet.js'

// Fires right before Foundry starts initialization steps.
Hooks.once('init', () => {
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

// Fires once localization translations have been loaded and are ready for use.
Hooks.once('i18nInit', () => {
    CONFIG.animecampaign = config.animecampaign;
})

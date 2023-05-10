import { animecampaign } from "./module/config.js";

import ACActorSheet from "./module/sheets/ACActorSheet.js";
import { CharacterData } from "./module/ACActor.js";

import ACItemSheet from "./module/sheets/ACItemSheet.js";
import { KitPieceData } from "./module/ACItem.js";

//
//  Preloads the filepaths for the Handlebars partials.
//
async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/animecampaign/templates/sheets/partials/character-summary.hbs",
        "systems/animecampaign/templates/sheets/partials/character-stats.hbs",
        "systems/animecampaign/templates/sheets/partials/kit.hbs",
        "systems/animecampaign/templates/sheets/partials/kit-piece-card.hbs",
        "systems/animecampaign/templates/sheets/partials/upgrades.hbs",
        "systems/animecampaign/templates/sheets/partials/biography.hbs"
    ];

    //? A Foundry helper function. (Not really sure what it does but it works)
    return loadTemplates(templatePaths);
}

//
//  All of our code that runs on initialization.
//
Hooks.once("init", () => {
    console.log("Anime Campaign | Initializing Anime Campaign System");

    //  Adding our localization object to Foundry's CONFIG object.
    CONFIG.animecampaign = animecampaign;

    //  Assigning Character and Kit Piece schema.
    CONFIG.Actor.systemDataModels["Character"] = CharacterData;
    CONFIG.Item.systemDataModels["Kit Piece"] = KitPieceData;

    // Unregistering the default entity sheets & registering our own.
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", ACActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", ACItemSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
})
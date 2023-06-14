import { animecampaign } from "./module/config.js";
import AC from "./module/AC.js";

import CharacterSheet from "./module/sheets/CharacterSheet.js";
import { CharacterData } from "./module/CharacterData.js";

import ACItem from "./module/ACItem.js";
import KitPieceSheet from "./module/sheets/KitPieceSheet.js";
import { KitPieceData } from "./module/KitPieceData.js";

//  Preloads the filepaths for the Handlebars partials.
//*     () : Promise<Function[]>
async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/animecampaign/templates/sheets/partials/character-summary.hbs",
        "systems/animecampaign/templates/sheets/partials/stats.hbs",
        "systems/animecampaign/templates/sheets/partials/kit.hbs",
        "systems/animecampaign/templates/sheets/partials/upgrades.hbs",
        "systems/animecampaign/templates/sheets/partials/biography.hbs"
    ];

    return loadTemplates(templatePaths);
}

//  All of our code that runs on initialization.
Hooks.once("init", () => {
    AC.log("Initializing Anime Campaign System");
    
    //  Adding our localization object to Foundry's CONFIG object.
    CONFIG.animecampaign = animecampaign;

    //  Redefining the default document classes.
    CONFIG.Item.documentClass = ACItem;

    //  Assigning Character and Kit Piece schema.
    CONFIG.Actor.systemDataModels["Character"] = CharacterData;
    CONFIG.Item.systemDataModels["Kit Piece"] = KitPieceData;

    //  Unregistering the default document sheets & registering our own.
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", KitPieceSheet, { makeDefault: true });

    preloadHandlebarsTemplates();

    //  Adding our custom Handlebars helpers.
    Handlebars.registerHelper(AC.hbsHelpers);
})
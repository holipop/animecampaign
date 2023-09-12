// Helper and Config 
import AC from "./module/AC.js";
import { animecampaign } from "./module/config.js";
import { RolledItem } from "./module/RolledItem.js";

// Documents
import ACActor from "./module/documents/ACActor.js";
import ACItem from "./module/documents/ACItem.js";

// Data Models
import { CharacterData } from "./module/data-models/CharacterData.js";
import { KitPieceData } from "./module/data-models/KitPieceData.js";

// Applications
import CharacterSheet from "./module/sheets/CharacterSheet.js";
import KitPieceSheet from "./module/sheets/KitPieceSheet.js";

/** Preloads any .hbs files to be used as partials.
 * @async
 * @returns {Promise<Function[]>}
 */
async function preloadHandlebarsTemplates() {
    // Whenever you create a new .hbs in the "partials" folder, put the filepath here.
    const templatePaths = [
        "systems/animecampaign/templates/sheets/partials/character-summary.hbs",
        "systems/animecampaign/templates/sheets/partials/sections.hbs",
        "systems/animecampaign/templates/sheets/partials/kit.hbs",
        "systems/animecampaign/templates/sheets/partials/upgrades.hbs",
        "systems/animecampaign/templates/sheets/partials/biography.hbs",
    ];

    return loadTemplates(templatePaths);
}

// All of our code that runs on initialization.
Hooks.once("init", () => {
    AC.log("Initializing Anime Campaign System");

    // Adding the localization object to Foundry's CONFIG object.
    CONFIG.animecampaign = animecampaign;

    // Assigning diagonal rule.
    SquareGrid.prototype.measureDistances = AC.measureDistances;

    // Assigning Fonts
    CONFIG.fontDefinitions = { ...CONFIG.fontDefinitions, ...AC.fonts };
    CONFIG.defaultFontFamily = 'Arial';

    // Redefining the default document classes.
    CONFIG.Actor.documentClass = ACActor;
    CONFIG.Item.documentClass = ACItem;

    // Assigning Character and Kit Piece schema.
    CONFIG.Actor.dataModels["Character"] = CharacterData;
    CONFIG.Item.dataModels["Kit Piece"] = KitPieceData;

    // Unregistering the default document sheets & registering our own.
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", CharacterSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", KitPieceSheet, { makeDefault: true });

    preloadHandlebarsTemplates();

    // Adding our custom Handlebars helpers.
    Handlebars.registerHelper(AC.hbsHelpers);
})

// All of the code that runs for chat messages.
Hooks.on('renderChatMessage', (_app, _html, _data) => {
    RolledItem.addChatListeners(_html);
})
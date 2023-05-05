import { animecampaign } from "./module/config.js";
import ACItemSheet from "./module/sheets/ACItemSheet.js";
import ACActorSheet from "./module/sheets/ACActorSheet.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/animecampaign/templates/sheets/partials/character-summary.hbs",
        "systems/animecampaign/templates/sheets/partials/character-stats.hbs",
        "systems/animecampaign/templates/sheets/partials/kit.hbs",
        "systems/animecampaign/templates/sheets/partials/upgrades.hbs",
        "systems/animecampaign/templates/sheets/partials/biography.hbs"
    ];
    return loadTemplates(templatePaths);
}

Hooks.once("init", () => {
    console.log("Anime Campaign | Initializing Anime Campaign System");

    CONFIG.animecampaign = animecampaign;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("animecampaign", ACActorSheet, { makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", ACItemSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
})
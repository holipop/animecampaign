import { animecampaign } from "./module/config.js";
import ACItemSheet from "./module/sheets/ACItemSheet.js";

Hooks.once("init", function() {
    console.log("Anime Campaign | Initialising Anime Campaign System");

    CONFIG.animecampaign = animecampaign;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("animecampaign", ACItemSheet, { makeDefault: true });
});
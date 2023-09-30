import lang from "../lang/en.json" assert { type: 'json' };
import { facadeObject } from "./AC.js";

// An object containing language localization paths.
export const animecampaign = facadeObject(lang).animecampaign;

animecampaign.colors = ['red', 'blue', 'yellow', 'green', 'orange', 'cyan', 'purple', 'grey'];
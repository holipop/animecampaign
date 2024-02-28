import * as Utils from "../Utils.js";
import SheetMixin from "./SheetMixin.js";

/**
 * The application for Characters.
 */
export default class CharacterSheet extends SheetMixin(ActorSheet) {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 650,
            height: 550,
            classes: ["animecampaign", "sheet", "actor"],
            template: 'systems/animecampaign/templates/character-sheet.hbs',
        });

        return options;
    }

    /** The path to the background .svg file.
     * @returns {String}
     */
    get svgBackground () {
        return "systems/animecampaign/assets/space/MoonDraft.svg#moon-draft"
    }

    /** The text displayed in the background.
     * @returns {String}
     */
    get svgText () {
        return "character"
    }

    /** The set of colors derived from this actor's color.
     * @returns {*}
     */
    get palette () {
        const primary = this.object.system.color
        const [h, s, l] = Utils.hexToHSL(primary)
        const secondary = Utils.HSLToHex(h, s * .66, 66)

        console.log({ primary, secondary })

        return { primary, secondary }
    }

    /** Fetches the context for this application's template.
     * @returns {*}
     */
    async getData () {
        return {
            ...super.getData(),
            ...this.object,
            config: CONFIG.AC,
            palette: this.palette,

            svg: {
                bg: this.svgBackground,
                text: this.svgText,
            },
        }
    }

}
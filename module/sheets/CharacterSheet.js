import * as Utils from "../Utils.js";
import * as List from "../List.js"
import SheetMixin from "./SheetMixin.js"
//import CategoryConfig from "./CategoryConfig.js";

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
            template: 'systems/animecampaign/templates/sheets/character-sheet.hbs',
            scrollY: ["section.scrollable"],
        });

        options.dragDrop = [
            { dragSelector: "[data-kit] [data-feature]", dropSelector: null },
            { dragSelector: "[data-kit] [data-category]", dropSelector: null },
            { dragSelector: "[data-tracker-list] [data-tracker]", dropSelector: null },
        ];

        options.tabs = [
            { navSelector: "[data-nav]", contentSelector: "[data-content]", initial: "" },
        ];

        return options;
    }


    //** DATA PREPERATION */

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        return {
            ...super.getData(),
            config: CONFIG.AC,

            color: this.object.system.color,

            svg: {
                bg: this.svgBackground,
                text: this.svgText,
            },
        }
    }

}
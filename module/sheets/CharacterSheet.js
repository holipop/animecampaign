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
            template: 'systems/animecampaign/templates/character/character-sheet.hbs',
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

    /** The list of color stats of this character.
     * @returns {Stat[]}
     */
    get colorStats () {
        return Object.values(this.object.system._stats).filter(el => el !== null)
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
            stats: this.colorStats, //! bandaid from v1

            svg: {
                bg: this.svgBackground,
                text: this.svgText,
            },
        }
    }

    /** Hook up event listeners between for Characters.
     * @param {*} html 
     * @override
     */
    activateListeners (html) {
        super.activateListeners(html)

        // TODO: Clean these up, they look fucking gross.

        // Dynamically change the little stamina bar.
        let staminaRatio = this.object.system.staminaRatio
        if (staminaRatio >= 1) {
            staminaRatio = 1
        } else if (staminaRatio <= 0) {
            staminaRatio = 0
        }
        staminaRatio *= 100
        html.find('[data-stam-bar]').height(`${staminaRatio}%`);

        // Only show the class level badge only if number is valid AND an epithet user.
        if (this.object.system.classLevel === "" || this.object.system.type !== "epithet") {
            html.find('[data-prof-class]').hide()
        }

        html.find('[data-stat-delete]').on('click', this.onStatDelete.bind(this))
    }

    /** Delete a color stat from the stat list.
     * @param {Event} event 
     */
    onStatDelete (event) {
        const index = $(event.target).closest('[data-stat-delete]').data("stat-delete")
        const color = this.colorStats[index].color

        console.log(color)
        this.object.update({ [`system._stats.${color}`]: null })
    }

}
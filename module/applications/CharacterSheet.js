import * as Utils from "../Utils.js";
import ACDialog from "./ACDialog.js";
import StatConfig from "./StatConfig.js";
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
        //! bandaid from v1
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
            stats: this.colorStats, 

            svg: {
                bg: this.svgBackground,
                text: this.svgText,
            },
        }
    }

    /** Hook up event listeners for Characters.
     * @param {jQuery} html 
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
        html.find('[data-stat-edit]').on('click', this.onStatEdit.bind(this))
        html.find('[data-stat-add]').on('click', this.onStatAdd.bind(this))
    }

    /** Delete a color stat from the stat list.
     * @param {Event} event 
     */
    onStatDelete (event) {
        const index = $(event.target).closest('[data-stat]').data("stat")
        const { tag, color } = this.colorStats[index]

        ACDialog.confirm({
            title: game.i18n.format("AC.DIALOG.DeleteColorStat.Title", { 
                tag: tag.toUpperCase(), 
                name: this.object.name
            }),
            content: game.i18n.format("AC.DIALOG.DeleteColorStat.Content", {
                tag: tag.toUpperCase(), 
                color: color.toUpperCase()
            }),
            yes: () => this.object.update({ [`system._stats.${color}`]: null }),
            no: () => { },
            defaultYes: true
        });
    }

    /** Invoke the Stat Configuration dialog.
     * @param {Event} event 
     */
    onStatEdit (event) {
        const index = $(event.target).closest('[data-stat]').data("stat")
        const stat = this.colorStats[index];

        const config = new StatConfig({ 
            ...stat,
            parent: this.object
        }, {
            title: game.i18n.format("AC.DIALOG.EditStat.Title", { 
                tag: stat.tag.toUpperCase(),
                name: this.object.name
            })
        })
        config.render(true)
        
    }

    /** Add the first available color stat to the list.
     */
    onStatAdd () {
        const [color] = Object
            .entries(this.object.system._stats)
            .find(([_, stat]) => stat === null) // If the value is null, get the key

        const config = new StatConfig({ 
            color,
            parent: this.object
        }, {
            title: game.i18n.format("AC.DIALOG.AddStat.Title", { name: this.object.name })
        })
        config.render(true)

        //this.object.update({ [`system._stats.${color}`]: { tag: "new stat", color } })
    }

}
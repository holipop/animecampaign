import { uniformObject } from "../AC.js";

// The application for Characters.
export default class CharacterSheet extends ActorSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"],
            template: 'systems/animecampaign/templates/sheets/character-sheet.hbs',
            /* tabs: [{
                navSelector: ".tabs", 
                contentSelector: ".content", 
                initial: "kit", 
            }], */
            scrollY: ["section.scrollable"]
        });
    }

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.system = this.object.system;
        data.documentName = this.object.documentName;

        return data;
    }


    //* EVENT LISTENERS */
    //* --------------- */ 

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {
        this.addColorStat(html);
        this.deleteColorStat(html);

        super.activateListeners(html);
    }

    /** Occupies a color stat by finding the first null stat. Does nothing if all stats 
     *  are occupied.
     * @param {*} html 
     */
    addColorStat (html) {
        const add = html.find("[data-add]");
        const stats = this.object.system.stats;
        const blankStats = uniformObject(Object.keys(stats), null);

        // TODO: Remove the button when all stats are occupied.

        add.on('click', () => {
            for (const stat in stats) {
                if (stats[stat] == null) {
                    this.object.update({ [`system.stats.${stat}`]: { color: stat } })
                    return;
                }
            }
        });
    }

    /** Sets a color stat to null.
     * @param {*} html 
     */
    deleteColorStat (html) {
        const del = html.find("[data-delete]");

        del.on('click', event => {
            const stat = $(event.target).data('delete');
            this.object.update({ [`system.stats.${stat}`]: null });
        });
    }

    
    //* FORM SUBMISSION */
    //* --------------- */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = this.updateColorStats(data);

        super._updateObject(event, data);
    }

    /** Checks the color property of the stats and ensures they're assigned to its 
     *  matching key.
     * @param {Object} data 
     * @returns {Object}
     */
    updateColorStats (data) {
        const stats = getProperty(expandObject(data), 'system.stats');
        const colorKeys = Object.keys(CONFIG.animecampaign.colorStat);
        const blankStats = uniformObject(colorKeys, null)

        for (const stat in stats) {
            blankStats[stats[stat].color] = stats[stat];
        }

        const updatedData = mergeObject(data, { system: { stats: blankStats } });

        return flattenObject(updatedData);
    }
}

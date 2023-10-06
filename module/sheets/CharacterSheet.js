import { uniformObject } from "../AC.js";
import { SheetMixin } from "./SheetMixin.js";

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


    //* DATA PREPARATION */
    //* ---------------- */

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.system = this.object.system;
        data.documentName = this.object.documentName;
        data.statList = data.system.usedStats;
        data.categorizedFeatures = data.system.categorizedFeatures;

        return data;
    }
 

    //* EVENT LISTENERS */
    //* --------------- */ 

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {
        // Global
        this.submitOnEnter(html);
        this.resizeTextArea(html);
        this.matchColor(html);
        this.contrastColor(html);
        this.collapse(html);

        // Summary
        this.resizeName(html);

        // Color Stats
        this.disableStatOptions(html);
        this.setColorStatView(html);
        this.addColorStat(html);
        this.deleteColorStat(html);

        // Category
        this.createCategory(html);
        this.deleteCategory(html);

        // Feature
        this.viewFeature(html);

        super.activateListeners(html);
    }

    /** Disables the options of the color selection that are occupied by other stats.
     * @param {*} html 
     */
    disableStatOptions (html) {
        const stats = this.object.system.stats;
        const colorKeys = CONFIG.animecampaign.colors;
        const populatedColors = colorKeys.filter(element => stats[element] != null);

        populatedColors.forEach(element => {
            const color = html.find(`[data-color-stat=${element}]`);

            color.each((index, element) => {
                const isSelected = $(element).attr('selected')

                if (!isSelected) $(element).attr('disabled', 'true');
            });
        });
    }

    /** Sets the view of the color stat.
     * @param {*} html 
     */
    setColorStatView (html) {
        const view = html.find('[data-view-stat]');
        const stat = html.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = this.object.system.usedStats[key].view;
            const selected = $(element).find(`[data-view-stat=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const setting = $(event.target).data('view-stat');
            const key = $(event.target).parents('[data-stat]').data('stat');
            const stat = this.object.system.stats[key];

            stat.view = setting;

            this.object.update({ [`system.stats.${key}`]: stat });
        });
    }

    /** Occupies a color stat by finding the first null stat. Removes the button if all stats are occupied.
     * @param {*} html 
     */
    addColorStat (html) {
        const add = html.find("[data-add-stat]");
        const stats = this.object.system.stats;
        const areAllStatsPopulated = Object.values(stats).every(element => element != null);

        if (areAllStatsPopulated) add.hide();
        else add.show();

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
        const del = html.find('[data-delete-stat]');

        del.on('click', event => {
            const key = $(event.target).data('delete-stat');
            this.object.update({ [`system.stats.${key}`]: null });
        });
    }

    /** Creates a new category given a name via a dialog.
     * @param {*} html 
     */
    createCategory (html) {
        const add = html.find('[data-create-category]');

        add.on('click', () => {
            const dialog = new Dialog({
                title: `Create New Category: ${this.object.name}`,
                content: CONFIG.animecampaign.textInputDialogContent('Name', 'New Category'),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Create New Category",
                        callback: html => {
                            const name = html.find('[name="name"]').val() || "new category";
    
                            this.object.update({ 'system.categories': { [name]: [] } });
                        }
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }

    /** Deletes a category given its index via a dialog.
     * @param {*} html 
     */
    deleteCategory (html) {
        const del = html.find('[data-delete-category]');

        del.on('click', event => {
            const category = $(event.target).data('delete-category');
            
            Dialog.confirm({
                title: `Delete Category [${category.toUpperCase()}]: ${this.object.name}`,
                content: 
                    `<p>Delete the "${category.toUpperCase()}" category?</p>
                    <p><b>Warning: This will delete all kit features within this category.</b><p>`,
                yes: () => {
                    const features = this.object.system.categorizedFeatures[category];
                    const ids = [];

                    features.forEach(feature => ids.push(feature._id));

                    this.object.update({ 'system.categories': { [`-=${category}`]: null } });
                    this.object.deleteEmbeddedDocuments('Item', ids);
                },
                no: () => {},
                defaultYes: false,
            });
        });
    }

    /** Renders a kit feature's sheet.
     * @param {*} html 
     */
    viewFeature (html) {
        const view = html.find('[data-view-feature]');

        view.on('click', event => {
            const id = $(event.target).data('view-feature');
            const feature = this.object.getEmbeddedDocument('Item', id);

            feature.sheet.render(true);
        })
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

    /** Checks the color property of the stats and ensures they're assigned to its matching key.
     * @param {Object} data 
     * @returns {Object}
     */
    updateColorStats (data) {
        const statChanges = getProperty(expandObject(data), 'system.stats');
        const blankStats = uniformObject(CONFIG.animecampaign.colors, null)

        for (const stat in statChanges) {
            blankStats[statChanges[stat].color] = statChanges[stat];
        }

        const updatedData = mergeObject(data, { system: { stats: blankStats } });

        return flattenObject(updatedData);
    }
}

// Composites mixins with this class.
Object.assign(CharacterSheet.prototype, SheetMixin);

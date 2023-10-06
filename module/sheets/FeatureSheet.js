import { SheetMixin } from "./SheetMixin.js";

// The application for Kit Features.
export default class FeatureSheet extends ItemSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            template: 'systems/animecampaign/templates/sheets/feature-sheet.hbs',
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
        data.statList = data.system.stats;

        // Prepared Data
        data.categories = this.categories();

        return data;
    }

    /** Returns an array of available categories to select, including the default ones.
     * @returns {string[]}
     */
    categories () {
        const defaultCategories = Object.keys(CONFIG.animecampaign.defaultCategories);
        const currentCategory = this.object.system.category;
        const categories = new Set([...defaultCategories, currentCategory])

        if (this.isOwned) {
            
        }
        
        return [...categories];
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

        // Summary
        this.resizeName(html);

        // Stats
        this.setStatView(html);
        this.addStat(html);
        this.deleteStat(html);

        super.activateListeners(html);
    }
    
    /** Sets the view of the stat.
     * @param {*} html 
     */
    setStatView (html) {
        const view = html.find('[data-view-stat]');
        const stat = html.find('[data-stat]');
        const stats = this.object.system.stats;

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = this.object.system.stats[key].view;
            const selected = $(element).find(`[data-view-stat=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const value = $(event.target).data('view-stat');
            const key = $(event.target).parents('[data-stat]').data('stat');
            const stat = stats[key].toObject();

            stat.view = value;
            stats[key] = stat;

            this.object.update({ 'system.stats': stats });
        });
    }

    /** Adds a stat to the end of the stats list.
     * @param {*} html 
     */
    addStat (html) {
        const add = html.find('[data-add-stat]');
        const stats = this.object.system.stats;

        add.on('click', () => {
            stats.push({});
            this.object.update({ 'system.stats': stats });
        })
    }

    /** Deletes a stat given its index.
     * @param {*} html 
     */
    deleteStat (html) {
        const del = html.find('[data-delete-stat]');
        const stats = this.object.system.stats;

        del.on('click', event => {
            const index = $(event.target).data('delete-stat');
            stats.splice(index, 1);

            this.object.update({ 'system.stats': stats });
        });
    }


    //* FORM SUBMISSION */
    //* --------------- */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = this.updateStatList(data);

        super._updateObject(event, data);
    }

    /** Ensures no data is lost when the stats array is updated.
     * @param {Object} data 
     * @returns {Object}
     */
    updateStatList (data) {
        const statChanges = getProperty(expandObject(data), 'system.stats');
        const stats = Object.fromEntries(this.object.system.stats.entries());

        mergeObject(stats, statChanges);

        const updatedData = mergeObject(data, { system: { stats: stats } })

        return flattenObject(updatedData);
    }
}

// Composites mixins with this class.
Object.assign(FeatureSheet.prototype, SheetMixin);

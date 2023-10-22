import * as AC from "../AC.js"
import * as Obj from "../Obj.js"
import { SheetMixin } from "./SheetMixin.js";

// The application for Kit Features.
export default class FeatureSheet extends ItemSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 550,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            template: 'systems/animecampaign/templates/feature/feature-sheet.hbs',
            scrollY: ["section.scrollable"],
        });

        options.tabs = [
            { navSelector: "[data-nav]", contentSelector: "[data-content]", initial: "description" },
        ];

        return options;
    }

    // A shorthand for this feature's stats. 
    get stats () { return this.object.system.stats }

    // A shorthand for this feature's sections. 
    get sections () { return this.object.system.sections }


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
        data.statList = this.stats;
        data.sections = this.sections;

        // Prepared Data
        data.categories = this.categories();

        return data;
    }

    /** Returns an array of available categories to select, including the default ones.
     * @returns {string[]}
     */
    categories () {
        // Owned features only list their parent's categories. 
        if (this.object.isOwned) {
            return this.object.parent.system.categories.map(cat => cat.name);
        }

        // Otherwise, list will contain the default categories and their own.
        const defaultCategories = CONFIG.animecampaign.defaultCategories.map(category => {
            return category.name;
        })
        const currentCategory = this.object.system.category;
        const categorySet = new Set([...defaultCategories, currentCategory])
        
        return [...categorySet];
    }


    //* EVENT LISTENERS */
    //* --------------- */ 

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {
        // Global
        this.submitOnEnter(html);
        this.disableSpellcheck(html);
        this.resizeTextArea(html);
        this.matchColor(html);
        this.contrastColor(html);
        this.collapse(html);

        // Summary
        this.resizeName(html);
        this.selectCategory(html);

        // Stats
        this.setStatView(html);
        this.addStat(html);
        this.deleteStat(html);

        // Nav
        this.setTabName(html);

        // Sections
        this.addSection(html);
        this.deleteSection(html);
        this.toggleSectionVisibility(html);

        super.activateListeners(html);
    }

    
    //* Summary

    /** Sets the category via the selection.
     * @param {*} html 
     */
    selectCategory (html) {
        const select = html.find('[data-select-category="select"]');
        const target = html.find('[data-select-category="target"]');

        select.on('change', event => {
            const category = $(event.target).val();
            target.val(category);
            this.object.update();
        });
    }


    //* Stats
    
    /** Sets the view of the stat.
     * @param {*} html 
     */
    setStatView (html) {
        const view = html.find('[data-view-stat]');
        const stat = html.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = this.stats[key].view;
            const selected = $(element).find(`[data-view-stat=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const key = $(event.target).parents('[data-stat]').data('stat');
            const setting = $(event.target).data('view-stat');
            const stats = this.stats;
            const stat = stats[key].toObject();

            stat.view = setting;
            stats[key] = stat;

            this.object.update({ 'system.stats': stats });
        });
    }

    /** Adds a stat to the end of the stats list.
     * @param {*} html 
     */
    addStat (html) {
        const add = html.find('[data-add-stat]');
        const stats = this.stats;

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
        const stats = this.stats;

        del.on('click', event => {
            const index = $(event.target).data('delete-stat');
            stats.splice(index, 1);

            this.object.update({ 'system.stats': stats });
        });
    }


    //* Sections

    /** Adds a blank section to the section list.
     * @param {*} html 
     */
    addSection (html) {
        const add = html.find('[data-add-section]');
        const sections = this.sections;

        add.on('click', () => {
            sections.push({});
            this.object.update({ 'system.sections': sections });
        })
    }

    /** Deletes a section at the desired index.
     * @param {*} html 
     */
    deleteSection (html) {
        const del = html.find('[data-delete-section]');
        const sections = this.sections;

        del.on('click', event => {
            const index = $(event.target).data('delete-section');
            sections.splice(index, 1);

            this.object.update({ 'system.sections': sections });
        });
    }

    /** Toggle's a section's visibility for chat messages.
     * @param {*} html 
     */
    toggleSectionVisibility (html) {
        const toggle = html.find('[data-toggle-section]');

        toggle.each((index, element) => {
            const section = this.sections[index];

            if (section.visible) { 
                $(element).css('color', 'blue')
            } else { 
                $(element).css('color', 'red')
            }
        });

        toggle.on('click', event => {
            const sections = this.sections;
            const index = $(event.target).data('toggle-section');

            // Invert boolean
            sections[index] = Obj.plain(sections[index])
            sections[index].visible = !sections[index].visible;

            this.object.update({ 'system.sections': sections })
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
        data = this.updateSectionList(data);
        data = this.lowercaseCategory(data);

        console.log(data)

        this.updateParentCategories(data);

        super._updateObject(event, data);
    }

    /** Ensures no data is lost when the stats array is updated.
     * @param {Object} data 
     * @returns {Object}
     */
    updateStatList (data) {
        const statChanges = getProperty(expandObject(data), 'system.stats');
        const stats = Object.fromEntries(this.stats.entries());

        for (const stat in statChanges) {
            const set = statChanges[stat];

            set.tag = set.tag.toLowerCase();

            statChanges[stat] = set;
        }

        mergeObject(stats, statChanges);

        const updatedData = mergeObject(data, { system: { stats: stats } })

        return flattenObject(updatedData);
    }

    /** Ensures no data is lost when the sections array is updated.
     * @param {Object} data 
     * @returns {Object}
     */
    updateSectionList (data) {
        const sectionChanges = getProperty(expandObject(data), 'system.sections');
        const sections = Object.fromEntries(this.sections.entries());

        mergeObject(sections, sectionChanges);

        const updatedData = mergeObject(data, { system: { sections: sections } })

        return flattenObject(updatedData);
    }

    /** Sets the category to lowercase.
     * @param {Object} data 
     * @returns {Object}
     */
    lowercaseCategory (data) {
        const category = getProperty(expandObject(data), 'system.category');

        const updatedData = mergeObject(data, { system: { category: category.toLowerCase() } });

        return flattenObject(updatedData);
    }

    /** Creates a new category to the parent's system categories if the entered category name doesn't exist.
     * @param {*} data 
     * @returns {null}
     */
    updateParentCategories (data) {
        if (!this.object.isOwned) return;

        const parentCategories = this.object.parent.system.categories
        const categoryNames = parentCategories.map(category => category.name);
        const newCategory = getProperty(expandObject(data), 'system.category');

        if (categoryNames.includes(newCategory)) return;

        const update = [ ...parentCategories, { name: newCategory } ];
        this.object.parent.update({ 'system.categories': update });
    }
}

// Composites mixins with this class.
Object.assign(FeatureSheet.prototype, SheetMixin);

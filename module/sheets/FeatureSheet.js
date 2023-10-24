import * as Global from "./Global.js"
import * as FeatureStat from "./FeatureStat.js"
import * as Section from "./Section.js"

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

        Global.listeners(html, this);
        FeatureStat.listeners(html, this);
        Section.listeners(html, this);
        
        super.activateListeners(html);
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

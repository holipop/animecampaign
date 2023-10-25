import * as List from "../List.js"
import * as Global from "./Global.js"
import * as Stat from "./Stat.js"
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


    //* DATA PREPARATION */

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.system = this.object.system;
        data.documentName = this.object.documentName;
        data.statList = this.object.system.stats;
        data.sections = this.object.system.sections;

        // Prepared Data
        data.categories = this.categories;

        return data;
    }

    /** Returns an array of available categories to select, including the default ones.
     * @returns {string[]}
     */
    get categories () {
        // Owned features only list their parent's categories. 
        if (this.object.isOwned) {
            return this.object.parent.system.categories.map(category => category.name);
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

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {

        Global.listeners(html, this);
        Stat.listeners(html, this);
        Section.listeners(html, this);
        
        super.activateListeners(html);
    }


    //* FORM SUBMISSION */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = Stat.update(data, this);
        data = Section.update(data, this);
        
        // category must always be lowercase
        data['system.category'] = data['system.category'].toLowerCase();

        // if the category doesn't exist for the owner, create it
        (() => {
            if (!this.object.isOwned) return;
    
            const categories = this.object.parent.system.categories
    
            const categoryExists = List.has(categories, { name: data['system.category'] });
            if (categoryExists) return;
    
            const update = List.add(categories, { name: data['system.category'] })
            this.object.parent.update({ 'system.categories': update });
        })();

        super._updateObject(event, data);
    }

}

import * as List from "./helper/List.js"

import * as Global from "./logic/Global.js"
import * as ColorStat from "./logic/ColorStat.js"
import * as Category from "./logic/Category.js"
import * as Feature from "./logic/Feature.js"
import * as Stat from "./logic/Stat.js"
import * as Section from "./logic/Section.js"

/**
 ** The application for Characters.
 */
export class CharacterSheet extends ActorSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 650,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"],
            template: 'systems/animecampaign/templates/character/character-sheet.hbs',
            scrollY: ["section.scrollable"],
        });

        options.dragDrop = [
            { dragSelector: "[data-kit] [data-feature]", dropSelector: null },
            { dragSelector: "[data-kit] [data-category]", dropSelector: null },
            { dragSelector: "[data-tracker-list] [data-tracker]", dropSelector: null },
        ];

        options.tabs = [
            { navSelector: "[data-nav]", contentSelector: "[data-content]", initial: "biography" },
        ];

        return options;
    }


    //** DATA PREPERATION */

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.system = this.object.system;
        data.documentName = this.object.documentName;

        // Prepared Data
        data.statList = this.usedStats;
        data.categories = this.categoriesObject;
        data.categorizedFeatures = this.categorizedFeatures;
        data.categorizedTrackers = this.categorizedTrackers;

        return data;
    }

    /** Returns the color stats in use.
     * @returns {Object}
     */
    get usedStats () {
        const stats = this.object.system.stats;
        const usedStats = {};
        for (const stat in stats) {
            if (stats[stat] != null) usedStats[stat] = stats[stat];
        }
        return usedStats;
    }

    /** Returns the categories as an object with each key as the name of that category.
     * @returns {Object}
     */
    get categoriesObject () {
        const categories = this.object.system.categories;
        const obj = {};

        categories.forEach(category => obj[category.name] = category);

        return obj;
    }

    /** Sorts all owned features by their category into an object.
     * @returns {Object}
     */
    get categorizedFeatures () {
        const items = [...this.object.items];
        const categoryList = this.object.system.categories.map(category => category.name);
        const features = {};

        categoryList.forEach(category => {
            features[category] = items.filter(item => item.system.category == category);
        })

        for (const category in features) {
            features[category].sort((a, b) => a.sort - b.sort);
        }

        return features;
    }

    /** Returns an object with category keys and their tracked stats array as the value.
     * @returns {Object}
     */
    get categorizedTrackers () {
        const categories = this.object.system.categories;
        const obj = {};

        categories.forEach(category => {
            obj[category.name] = category.trackers;
        })

        return obj;
    }


    //** DRAG AND DROP */

    /** Fires when a draggable element is picked up.
     * @param {*} event 
     */
    _onDragStart (event) {
        const dataset = $(event.target).data();
        let dragData;

        if (dataset.feature !== undefined) {
            const feature = this.object.getEmbeddedDocument('Item', dataset.feature);
            dragData = { type: 'Feature', obj: feature, id: dataset.feature };
        }

        const categories = this.object.system.categories;
        const key = $(event.target).closest('[data-category]').data('category');
        const category = List.get(categories, { name: key });
        
        if (dataset.category !== undefined) {
            dragData = { type: 'Category', obj: category };
        } 
        
        if (dataset.tracker !== undefined) {
            const tracker = category.trackers[dataset.tracker];
            dragData = { type: 'Tracker', obj: tracker, category: category, index: dataset.tracker };
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        super._onDragStart(event);
    }

    /** Fires when a draggable element is dropped.
     * @param {*} event 
     */
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event);

        if (!this.object.isOwner) return false;

        Feature.onDrop(event, data, this);
        Category.onDrop(event, data, this);

        super._onDrop(event);
    }
 

    //** EVENT LISTENERS */

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {

        Global.listeners(html, this);
        ColorStat.listeners(html, this);
        Category.listeners(html, this);
        Feature.listeners(html, this)

        super.activateListeners(html);
    }


    //** FORM SUBMISSION */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = ColorStat.update(data, this);

        super._updateObject(event, data);
    }

}



/**
 ** The application for Kit Features.
 */
export class FeatureSheet extends ItemSheet {

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

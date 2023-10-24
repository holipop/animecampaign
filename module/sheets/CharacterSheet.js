import * as AC from "../AC.js";
import * as List from "../List.js";
import * as Global from "../Global.js"
import * as ColorStat from "./ColorStat.js"
import * as Category from "./Category.js"
import * as Feature from "../Feature.js"

// The application for Characters.
export default class CharacterSheet extends ActorSheet {

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

    // A shorthand for this character's categories. 
    get categories () { return this.object.system.categories } 

    /** A shorthand for fetching a category.
     * @param {string} name 
     * @returns {Object}
     */
    getCategory (name) {
        return List.get(this.categories, { name: name });
    }

    /** A shorthand for setting a category, returning the list of categories.
     * @param {string} name 
     * @param {Object} changes
     * @returns {Object}
     */
    setCategory (name, changes) {
        return List.set(this.categories, { name: name }, changes);
    }

    /** A shorthand for if a category exists.
     * @param {string} name 
     * @returns {Object}
     */
    hasCategory (name) {
        return List.has(this.categories, { name: name });
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

        data.statList = this.usedStats();
        data.categories = this.categoriesObject();
        data.categorizedFeatures = this.categorizedFeatures();
        data.categorizedTrackers = this.categorizedTrackers();

        return data;
    }

    /** Returns the color stats in use.
     * @returns {Object}
     */
    usedStats () {
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
    categoriesObject () {
        const categories = this.categories;
        const obj = {};

        categories.forEach(category => obj[category.name] = category);

        return obj;
    }

    /** Sorts all owned features by their category into an object.
     * @returns {Object}
     */
    categorizedFeatures () {
        const items = [...this.object.items];
        const categoryList = this.categories.map(category => category.name);
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
    categorizedTrackers () {
        const categories = this.categories;
        const obj = {};

        categories.forEach(category => {
            obj[category.name] = category.trackers;
        })

        return obj;
    }


    //* DRAG AND DROP */
    //* ------------- */ 

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
        
        if (dataset.category !== undefined) {
            const category = this.getCategory(dataset.category);
            dragData = { type: 'Category', obj: category };
        } 
        
        if (dataset.tracker !== undefined) {
            const key = $(event.target).parents('[data-category]').data('category');
            const category = this.getCategory(key);
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

        this.onDropFeature(event, data);
        this.onDropCategory(event, data);
        this.onDropTracker(event, data);

        super._onDrop(event);
    }

    /** Inserts the dropped feature into the target category and sets its sort.
     * @param {*} event 
     * @param {*} data 
     */
    onDropFeature (event, data) {
        if (data.type != 'Feature') return;

        const features = this.actor.items;
        const source = features.get(data.id);

        const dropTarget = $(event.target).closest('[data-feature]');
        const dropCategory = $(event.target).closest('[data-category]');

        // If the feature was placed on an empty category.
        if (dropTarget.length == 0) {
            const updateData = [{
                _id: source._id,
                sort: 0,
                system: { category: dropCategory.data('category') }
            }];
            return this.object.updateEmbeddedDocuments('Item', updateData);
        };

        // Doesn't sort on itself.
        const target = features.get(dropTarget.data('feature'));
        if (source._id == target._id) return;

        const siblings = [];
        dropCategory.find('li[data-feature]').each((index, element) => {
            const siblingId = $(element).data('feature');
            if (siblingId && (siblingId !== source._id)) {
                siblings.push(features.get(siblingId))
            }
        })

        // Sorts based on its siblings.
        const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target._id;
            update.system = { category: dropCategory.data('category') }
            return update;
        })

        return this.object.updateEmbeddedDocuments('Item', updateData);
    }

    /** Inserts the dropped category on the index of the target category.
     * @param {*} event 
     * @param {*} data 
     */
    onDropCategory (event, data) {
        if (data.type != 'Category') return;
        if (this.categories.length == 1) return;

        const dropTarget = $(event.target).closest('[data-category]');
        if (dropTarget.length == 0) return;

        const targetIndex = this.categories.findIndex(category => {
            return category.name == dropTarget.data('category');
        })
        const currentIndex = this.categories.findIndex(category => {
            return category.name == data.obj.name
        })

        const update = [...this.categories];
        update.splice(currentIndex, 1);
        update.splice(targetIndex, 0, data.obj);

        return this.object.update({ 'system.categories': update });
    }

    /** Inserts the dropped category on the index of the target category.
     * @param {*} event 
     * @param {*} data 
     */
    onDropTracker (event, data) {
        if (data.type != 'Tracker') return;
        if (data.category.trackers.length == 1) return;  

        const dropCategory = $(event.target).closest('[data-category]');
        if (dropCategory.data('category') != data.category.name) return;

        const dropTarget =  $(event.target).closest('[data-tracker]');
        if (dropTarget.length == 0) return;

        const targetIndex = dropTarget.data('tracker');

        const trackerUpdate = this.getCategory(data.category.name).trackers;
        trackerUpdate.splice(data.index, 1);
        trackerUpdate.splice(targetIndex, 0, data.obj);

        const update = this.setCategory(data.category.name, { trackers: trackerUpdate });

        return this.object.update({ 'system.categories': update });
    }
 

    //* EVENT LISTENERS */
    //* --------------- */ 

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {

        Global.listeners(html, this);
        ColorStat.listeners(html, this);
        Category.listeners(html, this);
        Feature.listeners(html, this);

        super.activateListeners(html);
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
        const blankStats = AC.uniformObject(CONFIG.animecampaign.colorKeys, null)

        for (const stat in statChanges) {
            const set = statChanges[stat];

            set.tag = set.tag.toLowerCase();

            blankStats[statChanges[stat].color] = set;
        }

        const updatedData = mergeObject(data, { system: { stats: blankStats } });

        return flattenObject(updatedData);
    }
}

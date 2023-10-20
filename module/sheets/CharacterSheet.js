import * as AC from "../AC.js";
import * as Obj from "../Obj.js";
import { SheetMixin } from "./SheetMixin.js";

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
            template: 'systems/animecampaign/templates/sheets/character-sheet.hbs',
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
        return Obj.getEntry(this.categories, { name: name });
    }

    /** A shorthand for setting a category, returning the list of categories.
     * @param {string} name 
     * @param {Object} changes
     * @returns {Object}
     */
    setCategory (name, changes) {
        return Obj.setEntry(this.categories, { name: name }, changes);
    }

    /** A shorthand for if a category exists.
     * @param {string} name 
     * @returns {Object}
     */
    hasCategory (name) {
        return Obj.hasEntry(this.categories, { name: name });
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
        // Global
        this.submitOnEnter(html);
        this.disableSpellcheck(html);
        this.resizeTextArea(html);
        this.matchColor(html);
        this.contrastColor(html);
        this.contrastImage(html);
        this.collapse(html);

        // Summary
        this.resizeName(html);

        // Color Stats
        this.disableStatOptions(html);
        this.matchSelect(html);
        this.setColorStatView(html);
        this.addColorStat(html);
        this.deleteColorStat(html);

        // Navigation
        this.setTabName(html);

        // Category
        this.createCategory(html);
        this.deleteCategory(html);
        this.renameCategory(html);
        this.colorCategory(html);
        this.matchCategory(html);
        this.contrastCategory(html);
        this.floodCategory(html);
        this.disableTrackStat(html);
        this.trackStat(html);
        this.untrackStat(html);
        this.editStatTrackerImage(html);

        // Feature
        this.createFeature(html);
        this.viewFeature(html);
        this.deleteFeature(html);
        this.matchFeature(html);
        this.swapStatFonts(html);

        super.activateListeners(html);
    }

    //* Color Stats

    /** Disables the options of the color selection that are occupied by other stats.
     * @param {*} html 
     */
    disableStatOptions (html) {
        const stats = this.object.system.stats;
        const colorKeys = CONFIG.animecampaign.colorKeys;
        const populatedColors = colorKeys.filter(element => stats[element] != null);

        populatedColors.forEach(element => {
            const color = html.find(`[data-color-stat=${element}]`);

            color.each((index, element) => {
                const isSelected = $(element).attr('selected')

                if (!isSelected) $(element).attr('disabled', 'true');
            });
        });
    }

    matchSelect (html) {
        const select = html.find('[data-match-select]');

        select.each((index, element) => {
            const key = $(element).data('match-select');
            const color = CONFIG.animecampaign.colors[key];

            const styles = {
                'text-shadow': `${color} .1rem .1rem`,
                'box-shadow': `inset ${color} 0 0 .1rem`,
                'background-color': `${color}80`,
            }

            $(element).css(styles)
        })
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
            const setting = this.usedStats()[key].view;
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


    //* Category

    /** Creates a new category given a name via a dialog.
     * @param {*} html 
     */
    createCategory (html) {
        const create = html.find('[data-create-category]');

        create.on('click', () => {
            const callback = html => {
                const name = html.find('[name="name"]').val().toLowerCase() || "new category";
                const categories = this.categories;

                const isNameTaken = this.hasCategory(name);

                if (isNameTaken) {
                    ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another category.`)
                    return;
                };

                categories.push({ name: name });
    
                this.object.update({ 'system.categories': categories });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.create', { name: this.object.name }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.name'), AC.localize('app.newCategory')),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.createCategory'),
                        callback: callback
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
            const key = $(event.target).data('delete-category');

            const callback = () => {
                const features = this.categorizedFeatures()[key];
                const categories = this.categories;

                const ids = features.map(feature => feature._id);
                const index = categories.findIndex(category => category.name == key);

                categories.splice(index, 1);

                this.object.update({ 'system.categories': categories });
                this.object.deleteEmbeddedDocuments('Item', ids);
            }
            
            Dialog.confirm({
                title: AC.format('dialog.deleteCategory', {
                    category: key.toUpperCase(),
                    name: this.object.name
                }),
                content: 
                    `<p>Delete the "${key.toUpperCase()}" category?</p>
                    <p><b>Warning: This will delete all kit features within this category.</b></p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        });
    }

    /** Renames a category, moving all items to the new category name and deleting the old one.
     * @param {*} html 
     */
    renameCategory (html) {
        const rename = html.find('[data-rename-category]');

        rename.on('click', event => {
            const key = $(event.target).data('rename-category');

            const callback = html => {
                const features = this.categorizedFeatures()[key];
                const newName = html.find('[name="name"]').val().toLowerCase() || key;

                const updatedItems = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { category: newName }
                    }
                });

                const updatedCategories = this.setCategory(key, { name: newName });

                this.object.update({ 'system.categories': updatedCategories });
                this.object.updateEmbeddedDocuments('Item', updatedItems);
            }

            const dialog = new Dialog({
                title: AC.format('dialog.rename', {
                    category: key.toUpperCase(),
                    name: this.object.name
                }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.name'), key),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.renameCategory'),
                        callback: callback
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }

    /** Sets a category's color via a dialog.
     * @param {*} html 
     */
    colorCategory (html) {
        const color = html.find('[data-color-category]');

        color.on('click', event => {
            const key = $(event.target).data('color-category');
            const target = this.getCategory(key);
            const initialColor = target.color ?? this.object.system.color;

            const set = html => {
                const color = html.find('[name="color"]').val();

                const update = this.setCategory(key, { color: color });
                this.object.update({ 'system.categories': update });
            }

            const reset = () => {
                const update = this.setCategory(key, { color: null });

                this.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.recolor', {
                    category: key.toUpperCase(),
                    name: this.object.name
                }),
                content: CONFIG.animecampaign.colorDialog(initialColor),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.colorCategory'),
                        callback: set
                    },
                    reset: {
                        icon: '<i class="fas fa-arrow-rotate-left"></i>',
                        label: AC.localize('dialog.resetColor'),
                        callback: reset
                    }
                },
                default: "confirm",
                close: set,
            }, { width: 325 });

            dialog.render(true);
        });
    }

    /** Matches the color of each element with the category's flag color.
     * @param {*} html 
     */
    matchCategory (html) {
        const match = html.find('[data-match-category]');

        match.each((index, element) => {
            const properties = $(element).data('match-category') || "color";
            const key = $(element).parents('[data-category]').data('category');
            const target = this.getCategory(key)

            const color = target.color ?? this.object.system.color;

            const obj = Obj.uniform(properties.split(' '), color);
            $(element).css(obj);
        })
    }

    /** Contrasts the color of each element against the category's flag color luminosity.
     * @param {*} html 
     */
    contrastCategory (html) {
        const contrast = html.find('[data-contrast-category]');

        contrast.each((index, element) => {
            const properties = $(element).data('contrast-category') || "color";
            const key = $(element).parents('[data-category]').data('category');
            const target = this.getCategory(key);

            const rgb = AC.hexToRGB(target.color ?? this.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            const obj = Obj.uniform(properties.split(' '), color);
            $(element).css(obj);
        })
    }

    /** Sets a category's color to all of its features.
     * @param {*} html 
     */
    floodCategory (html) {
        const flood = html.find('[data-flood-category]');

        flood.on('click', event => {
            const key = $(event.target).data('flood-category');
            const features = this.categorizedFeatures()[key];
            const target = this.getCategory(key);

            const color = target.color ?? this.object.system.color;

            const callback = () => {
                const update = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { color: color }
                    }
                });

                this.object.updateEmbeddedDocuments('Item', update);
            }

            Dialog.confirm({
                title: `Flood Category [${key.toUpperCase()}]: ${this.object.name}`,
                content: 
                    `<p>Flood each feature under the "${key.toUpperCase()}" category with ${color}?</p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        })
    }

    /** Disables the ability to track more stats after a maximum amount.
     * @param {*} html 
     */
    disableTrackStat (html) {
        const MAX_TRACKERS = 4;
        const track = html.find('[data-track]');

        track.each((index, element) => {
            const key = $(element).data('track');
            const target = this.getCategory(key);

            if (target.trackers.length >= MAX_TRACKERS) $(element).hide();
        })
    }

    /** Adds a stat tracker to a category via a dialog.
     * @param {*} html 
     */
    trackStat (html) {
        const track = html.find('[data-track]');

        track.on('click', event => {
            const key = $(event.target).parents('[data-category]').data('category');
            const target = this.getCategory(key);

            const callback = html => {
                const name = html.find('[name="name"]').val()
                const trackers = target.trackers;

                if (name == '') return ui.notifications.warn(`Name field can't be blank.`);

                trackers.unshift({ tag: name })
                const update = this.setCategory(key, { trackers: trackers });
                this.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('track', { category: key, name: this.object.name }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.statName'), ''),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.trackStat'),
                        callback: callback
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }

    /** Removes a stat tracker from a category.
     * @param {*} html 
     */
    untrackStat (html) {
        const untrack = html.find('[data-untrack]');

        untrack.on('click', event => {
            const index = $(event.target).data('untrack');
            const category = $(event.target).parents('[data-category]').data('category');
            const trackers = this.categorizedTrackers()[category];

            trackers.splice(index, 1);

            const update = this.setCategory(category, { trackers: trackers });
            this.object.update({ 'system.categories': update });
        })
    }

    /** Renders a FilePicker to edit the image of a stat tracker.
     * @param {*} html 
     */
    editStatTrackerImage (html) {
        const edit = html.find('[data-image-tracker]');

        edit.on('click', event => {
            const index = $(event.target).data('image-tracker');
            const category = $(event.target).parents('[data-category]').data('category');
            const trackers = this.categorizedTrackers()[category];

            const callback = path => {
                trackers[index].img = path;

                const update = this.setCategory(category, { trackers: trackers });
                this.object.update({ 'system.categories': update });
            }

            const filePicker = new FilePicker({
                current: trackers[index].img,
                callback: callback
            });

            filePicker.render(true);
        });
    }


    
    //* Feature

    /** Creates a new feature under a category.
     * @param {*} html 
     */
    createFeature (html) {
        const create = html.find('[data-create-feature]');

        create.on('click', event => {
            const key = $(event.target).data('create-feature');
            const trackers = this.categorizedTrackers()[key];

            const color = this.getCategory(key).color ?? this.object.system.color;

            const stats = trackers.map(tracker => {
                return { tag: tracker.tag, img: tracker.img }
            });

            const data = [{
                name: 'New Feature',
                type: 'Feature',
                system: {
                    category: key,
                    stats: stats,
                    color: color,
                }
            }];

            this.object.createEmbeddedDocuments('Item', data)
        })
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

    /** Deletes a feature given its id.
     * @param {*} html 
     */
    deleteFeature (html) {
        const del = html.find('[data-delete-feature]');

        del.on('click', event => {
            const id = $(event.target).data('delete-feature');

            const callback = () => this.object.deleteEmbeddedDocuments('Item', [id]);

            Dialog.confirm({
                title: AC.format('dialog.deleteFeature', {
                    id: id,
                    name: this.object.name
                }),
                content: `<p>Delete this feature?</p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        })
    }

    /** Matches the color of each element with an embedded kit feature.
     * @param {*} html 
     */
    matchFeature (html) {
        const match = html.find('[data-match-feature]');

        match.each((index, element) => {
            const properties = $(element).data('match-feature') || "color";
            const id = $(element).parents('[data-feature]').data('feature');
            const feature = this.object.getEmbeddedDocument('Item', id);
            const color = feature.system.color;

            const obj = Obj.uniform(properties.split(' '), color);
            $(element).css(obj);
        })
    }

    /** Swaps the fonts of a stat label if it exceeds a certain amount of characters.
     * @param {*} html 
     */
    swapStatFonts (html) {
        const MAX_CHARS = 3;
        const swap = html.find('[data-swap-font]');

        swap.each((index, element) => {
            const text = $(element).text();

            if (text.length > MAX_CHARS) $(element).addClass('label');
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
        const blankStats = Obj.uniform(CONFIG.animecampaign.colorKeys, null)

        for (const stat in statChanges) {
            const set = statChanges[stat];

            set.tag = set.tag.toLowerCase();

            blankStats[statChanges[stat].color] = statChanges[stat];
        }

        const updatedData = mergeObject(data, { system: { stats: blankStats } });

        return flattenObject(updatedData);
    }
}

// Composites mixins with this class.
Object.assign(CharacterSheet.prototype, SheetMixin);

import * as AC from "../AC.js";
import * as List from "../List.js"
import { SheetMixin } from "./SheetMixin.js"

/**
 * The application for Characters.
 */
export default class CharacterSheet extends ActorSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 650,
            height: 550,
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


    //** DATA PREPERATION */

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {

        return {
            ...super.getData(),
            config: CONFIG.animecampaign,
            system: this.object.system,
            documentName: this.object.documentName,

            // Prepared Data
            statList: this.usedStats,
            categories: this.categoriesObject,
            categorizedFeatures: this.categorizedFeatures,
            categorizedTrackers: this.categorizedTrackers,
        }
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
     * @param {Event} event 
     */
    _onDragStart (event) {
        const dataset = $(event.target).data();
        let dragData;

        const categories = this.object.system.categories;
        const key = $(event.target).closest('[data-category]').data('category');
        const category = List.get(categories, { name: key });

        if ('feature' in dataset) {
            const feature = this.object.getEmbeddedDocument('Item', dataset.feature);
            dragData = { type: 'Feature', obj: feature, id: dataset.feature };

            const img = $(event.target).find('.img')[0];
            event.dataTransfer.setDragImage(img, 50, 50);
        } else if ('category' in dataset) {
            dragData = { type: 'Category', obj: category };
        } else if ('tracker' in dataset) {
            const tracker = category.trackers[dataset.tracker];
            dragData = { type: 'Tracker', obj: tracker, category: category, index: dataset.tracker };
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        super._onDragStart(event);
    }

    /** Fires when a draggable element is dropped.
     * @param {Event} event 
     */
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event);
        const sheet = this;

        if (!this.object.isOwner) return false;

        /** Inserts the dropped feature into the target category and sets its sort.
         */
        void function feature () {
            if (data.type != 'Feature') return;
        
            const features = sheet.actor.items;
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
                return sheet.object.updateEmbeddedDocuments('Item', updateData);
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
        
            return sheet.object.updateEmbeddedDocuments('Item', updateData);
        }()
        
        const categories = sheet.object.system.categories;

        /** Inserts the dropped category on the index of the target category. 
        */
        void function category () {
            if (data.type != 'Category') return;
            if (categories.length == 1) return;
        
            const dropTarget = $(event.target).closest('[data-category]');
            if (dropTarget.length == 0) return;
        
            const targetIndex = List.index(categories, { name: dropTarget.data('category') });
            const currentIndex = List.index(categories, { name: data.obj.name });
        
            let update = List.remove(categories, currentIndex);
            update = List.add(update, data.obj, targetIndex);
        
            return sheet.object.update({ 'system.categories': update });
        }()

        /** Inserts the dropped category on the index of the target category.
         */
        void function tracker () {
            if (data.type != 'Tracker') return;
            if (data.category.trackers.length == 1) return;  

            const dropCategory = $(event.target).closest('[data-category]');
            if (dropCategory.data('category') != data.category.name) return;

            const dropTarget = $(event.target).closest('[data-tracker]');
            if (dropTarget.length == 0) return;

            const targetIndex = dropTarget.data('tracker');

            let trackers = List.get(categories, { name: data.category.name }).trackers;
            trackers = List.remove(trackers, data.index);
            trackers = List.add(trackers, data.obj, targetIndex);

            const update = List.set(categories, { name: data.category.name }, { trackers })
            return sheet.object.update({ 'system.categories': update });
        }()

        super._onDrop(event);
    }
 

    //** EVENT LISTENERS */

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {

        this.globalListeners(html, this);
        this.colorStatListeners(html, this);
        this.categoryListeners(html, this);
        this.featureListeners(html, this);

        super.activateListeners(html);
    }

    /** Event listeners for color stats.
     * @param {*} html 
     * @param {*} sheet 
     */
    colorStatListeners (html, sheet) {

        /** @type {Object} */
        const stats = sheet.object.system.stats;

        /** @type {jQuery} */
        const ol = html.find('[data-stat-list]');

        /** @returns {String} */
        const key = event => {
            return $(event.target).closest('[data-stat]').data('stat');
        }

        /** Disables the options of the color selection that are occupied by other stats.
         */
        void function disableOptions () {
            const stats = sheet.object.system.stats;
            const colorKeys = CONFIG.animecampaign.colorKeys;
            const populatedColors = colorKeys.filter(element => stats[element] != null);

            populatedColors.forEach(element => {
                const color = ol.find(`[data-color-option=${element}]`);

                color.each((index, element) => {
                    const isSelected = $(element).attr('selected')

                    if (!isSelected) $(element).attr('disabled', 'true');
                });
            });
        }()

        /** Matches the color of the select element with the color stat.
         */
        void function matchSelect () {
            const select = ol.find('[data-match-select]');

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
        }()

        /** Sets the view of the color stat.
         */
        void function view () {
            const view = ol.find('[data-view]');
            const stat = ol.find('[data-stat]');

            view.removeClass('selected');

            stat.each((index, element) => {
                const key = $(element).data('stat');
                const setting = stats[key].view;
                const selected = $(element).find(`[data-view=${setting}]`);
                
                selected.addClass('selected');
            });

            view.on('click', event => {
                const setting = $(event.target).data('view');

                sheet.object.update({ [`system.stats.${key(event)}.view`]: setting });
            });
        }()

        /** Occupies a color stat by finding the first null stat. Removes the button if all stats are occupied.
         */
        void function add () {
            const add = ol.find("[data-add]");
            const allStatsPopulated = Object.values(stats).every(element => element != null);

            if (allStatsPopulated) add.hide();
            else add.show();

            add.on('click', () => {
                for (const stat in stats) {
                    if (stats[stat] == null) {
                        sheet.object.update({ [`system.stats.${stat}`]: { color: stat } })
                        return;
                    }
                }
            });
        }()

        /** Sets a color stat to null.
         */
        void function remove () {
            const remove = ol.find('[data-remove]');

            remove.on('click', event => {
                sheet.object.update({ [`system.stats.${key(event)}`]: null });
            });
        }()

    }

    /** Event listeners for categories.
     * @param {*} html 
     * @param {*} sheet 
     */
    categoryListeners (html, sheet) {

        /** @type {Category[]} */
        const categories = sheet.object.system.categories

        /** @type {jQuery} */
        const kit = html.find('[data-kit]');

        /** @returns {String} */
        const name = element => {
            // the + "" is to ensure the data-attr gets converted into a string.
            return $(element).closest('[data-category]').data('category') + "";
        }

        /** Sets the first letter of category names to be a little bigger.
         */
        void function firstLetter () {
            const first = html.find('[data-first-letter]');

            first.each((index, element) => {
                const initial = $(element).text().at(0);
                const text = $(element).text().slice(1);
                
                $(element).text(text)
                $(element).prepend(`
                    <span class="initial">${initial}</span>
                `)
            })
        }()

        /** Creates a new category given a name via a dialog.
         */
        void function create () {
            const create = kit.find('[data-create]');

            create.on('click', () => {
                const callback = html => {
                    const name = html.find('[name="name"]').val().toLowerCase() || "new category";
                    const isNameTaken = List.has(categories, { name })

                    if (isNameTaken) {
                        ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another category.`)
                        return;
                    };

                    const update = List.add(categories, { name });
                    sheet.object.update({ 'system.categories': update });
                }

                const dialog = new Dialog({
                    title: AC.format('dialog.create', { name: sheet.object.name }),
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
        }()

        /** Deletes a category given its index via a dialog.
         */
        void function del () {
            const del = kit.find('[data-delete]');

            del.on('click', event => {
                const key = name(event.target);

                const callback = () => {
                    const features = sheet.categorizedFeatures[key];
                    const ids = features.map(feature => feature._id);

                    const update = List.remove(categories, { name: key })
                    sheet.object.update({ 'system.categories': update });
                    sheet.object.deleteEmbeddedDocuments('Item', ids);
                }
                
                Dialog.confirm({
                    title: AC.format('dialog.deleteCategory', {
                        category: key.toUpperCase(),
                        name: sheet.object.name
                    }),
                    content: 
                        `<p>Delete the "${key.toUpperCase()}" category?</p>
                        <p><b>Warning: This will delete all kit features within this category.</b></p>`,
                    yes: callback,
                    no: () => {},
                    defaultYes: false,
                });
            });
        }()

        /** Renames a category, moving all items to the new category name and deleting the old one.
         */
        void function rename () {
            const rename = kit.find('[data-rename]');

            rename.on('click', event => {
                const key = name(event.target);

                const callback = html => {
                    const features = sheet.categorizedFeatures[key];
                    const newName = html.find('[name="name"]').val().toLowerCase() || key;

                    const isNameTaken = List.has(categories, { name: newName })
                    if (isNameTaken) {
                        ui.notifications.warn(`"${newName.toUpperCase()}" is already taken by another category.`)
                        return;
                    };

                    const updatedItems = features.map(feature => {
                        return {
                            _id: feature._id,
                            system: { category: newName }
                        }
                    });

                    const updateCategory = List.set(categories, { name: key }, { name: newName })
                    sheet.object.update({ 'system.categories': updateCategory });
                    sheet.object.updateEmbeddedDocuments('Item', updatedItems);
                }

                const dialog = new Dialog({
                    title: AC.format('dialog.rename', {
                        category: key.toUpperCase(),
                        name: sheet.object.name
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
        }()

        /** Sets a category's color via a dialog.
         */
        void function color () {
            const color = kit.find('[data-color]');

            color.on('click', event => {
                const key = name(event.target);
                const target = List.get(categories, { name: key });
                const initColor = target.color ?? sheet.object.system.color;

                const set = html => {
                    const color = html.find('[name="color"]').val();
                    const update = List.set(categories, { name: key }, { color })
                    sheet.object.update({ 'system.categories': update });
                }

                const reset = () => {
                    const update = List.set(categories, { name: key }, { color: null });
                    sheet.object.update({ 'system.categories': update });
                }

                const dialog = new Dialog({
                    title: AC.format('dialog.recolor', {
                        category: key.toUpperCase(),
                        name: sheet.object.name
                    }),
                    content: CONFIG.animecampaign.colorDialog(initColor),
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
                }, { width: 325 });

                dialog.render(true);
            });
        }()

        /** Sets a category's color to all of its features.
         */
        void function flood () {
            const flood = kit.find('[data-flood]');

            flood.on('click', event => {
                const key = name(event.target);
                const features = sheet.categorizedFeatures[key];
                const target = List.get(categories, { name: key });
                const color = target.color ?? sheet.object.system.color;

                const callback = () => {
                    const updatedItems = features.map(feature => {
                        return {
                            _id: feature._id,
                            system: { color: color }
                        }
                    });

                    sheet.object.updateEmbeddedDocuments('Item', updatedItems);
                }

                Dialog.confirm({
                    title: `Flood Category [${key.toUpperCase()}]: ${sheet.object.name}`,
                    content: 
                        `<p>Flood each feature under the "${key.toUpperCase()}" category with ${color}?</p>`,
                    yes: callback,
                    no: () => {},
                    defaultYes: false,
                });
            })
        }()

        /** Matches the color of each element with the category's flag color.
         */
        void function matchCategory () {
            const match = kit.find('[data-match-category]');

            match.each((index, element) => {
                const properties = $(element).data('match-category') || "color";
                const target = List.get(categories, { name: name(element) })
                const color = target.color ?? sheet.object.system.color;

                const styles = AC.uniformObject(properties.split(' '), color);
                $(element).css(styles);
            })
        }()

        /** Contrasts the color of each element against the category's flag color luminosity.
         */
        void function contrastCategory () {
            const contrast = kit.find('[data-contrast-category]');

            contrast.each((index, element) => {
                const properties = $(element).data('contrast-category') || "color";
                const target = List.get(categories, { name: name(element) });

                const rgb = AC.hexToRGB(target.color ?? sheet.object.system.color);
                rgb[0] *= 0.2126;
                rgb[1] *= 0.7152;
                rgb[2] *= 0.0722;

                const luma = rgb.reduce((n, m) => n + m) / 255;
                const color = (luma <= .5) ? "white" : "black";

                const obj = AC.uniformObject(properties.split(' '), color);
                $(element).css(obj);
            })
        }()

        /** Disables the ability to track more stats after a maximum amount.
         */
        void function disableTrack () {
            const MAX_TRACKERS = 4;
            const track = kit.find('[data-track]');

            track.each((index, element) => {
                const target = List.get(categories, { name: name(element) })

                if (target.trackers.length >= MAX_TRACKERS) $(element).hide();
            })
        }()

        /** Adds a stat tracker to a category via a dialog.
         */
        void function track () {
            const track = kit.find('[data-track]');

            track.on('click', event => {
                const key = name(event.target)
                const trackers = List.get(categories, { name: key }).trackers;

                const callback = html => {
                    const name = html.find('[name="name"]').val()

                    const isNameTaken = List.has(trackers, { tag: name.toLowerCase() });
                    if (isNameTaken) {
                        ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another stat tracker.`)
                        return;
                    }
                    if (name == '') return ui.notifications.warn(`Name field can't be blank.`);

                    trackers.unshift({ tag: name.toLowerCase() })
                    const update = List.set(categories, { name: key }, { trackers })
                    sheet.object.update({ 'system.categories': update });
                }

                const dialog = new Dialog({
                    title: AC.format('dialog.track', { category: key, name: sheet.object.name }),
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
        }()

        /** Removes a stat tracker from a category.
         */
        void function untrack () {
            const untrack = kit.find('[data-untrack]');

            untrack.on('click', event => {
                const index = +$(event.target).data('untrack');
                const category = name(event.target);
                const trackers = sheet.categorizedTrackers[category];

                trackers.splice(index, 1);

                const update = List.set(categories, { name: category }, { trackers });
                sheet.object.update({ 'system.categories': update });
            })
        }()

        /** Renders a FilePicker to edit the image of a stat tracker.
         */
        void function trackerImage () {
            const edit = kit.find('[data-tracker-image]');

            edit.on('click', event => {
                const index = +$(event.target).data('tracker-image');
                const category = name(event.target);
                const trackers = sheet.categorizedTrackers[category];

                const callback = path => {
                    trackers[index].img = path;

                    const update = List.set(categories, { name: category }, { trackers });
                    sheet.object.update({ 'system.categories': update });
                }

                const filePicker = new FilePicker({
                    current: trackers[index].img,
                    callback: callback
                });

                filePicker.render(true);
            });
        }()

    }

    /** Event listeners for categories.
     * @param {*} html 
     * @param {*} sheet 
     */
    featureListeners (html, sheet) {

        /** @type {jQuery} */
        const kit = html.find('[data-kit]');

        /** @returns {String} */
        const id = element => {
            return $(element).closest('[data-feature]').data('feature');
        }

        /** Creates a new feature under a category.
         */
        void function create () {
            const create = kit.find('[data-create-feature]');
            const categories = sheet.object.system.categories;

            create.on('click', event => {
                const category = $(event.target).data('create-feature');
                const stats = sheet.categorizedTrackers[category];

                const target = List.get(categories, { name: category })
                const color = target.color ?? sheet.object.system.color;

                const data = [{
                    name: `New Feature`,
                    type: 'Feature',
                    system: { category, stats, color }
                }];

                sheet.object.createEmbeddedDocuments('Item', data)
            })
        }()

        /** Fires an item's roll method.
         */
        void function roll () {
            const roll = kit.find('[data-roll]');

            roll.on('mousedown', event => {
                const feature = sheet.object.getEmbeddedDocument('Item', id(event.target));
                const post = (event.which === 3) // if right click was used

                feature.roll({ post });
            })
        }()

        /** Renders a kit feature's sheet.
         */
        void function view () {
            const view = kit.find('[data-view-feature]');

            view.on('click', event => {
                const feature = sheet.object.getEmbeddedDocument('Item', id(event.target));

                feature.sheet.render(true);
            })
        }()

        /** Deletes a feature.
         */
        void function del () {
            const del = kit.find('[data-delete-feature]');

            del.on('click', event => {
                const callback = () => {
                    sheet.object.deleteEmbeddedDocuments('Item', [id(event.target)]);
                }

                Dialog.confirm({
                    title: AC.format('dialog.deleteFeature', {
                        id: id(event.target),
                        name: sheet.object.name
                    }),
                    content: `<p>Delete this feature?</p>`,
                    yes: callback,
                    no: () => {},
                    defaultYes: false,
                });
            })
        }()

        /** Matches the color of each element with an embedded kit feature.
         */
        void function matchFeature () {
            const match = kit.find('[data-match-feature]');

            match.each((index, element) => {
                const properties = $(element).data('match-feature') || "color";
                const feature = sheet.object.getEmbeddedDocument('Item', id(element));
                const color = feature.system.color;

                const styles = AC.uniformObject(properties.split(' '), color);
                $(element).css(styles);
            })
        }()

        /** Swaps the fonts of a stat label if it exceeds a certain amount of characters.
         */
        void function swapStatFonts () {
            const MAX_CHARS = 3;
            const swap = html.find('[data-swap-font]');

            swap.each((index, element) => {
                const text = $(element).text();

                if (text.length > MAX_CHARS) $(element).addClass('label');
            })
        }()

    }


    //** FORM SUBMISSION */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = expandObject(data);

        // Ensure no data is lost for color stats.
        const statUpdate = AC.uniformObject(CONFIG.animecampaign.colorKeys, null);
        const statData = data.system.stats;

        for (const stat in statData) {
            const update = statData[stat];
            update.tag = update.tag.toLowerCase();

            const key = statData[stat].color;
            statUpdate[key] = update;
        }

        data.system.stats = statUpdate;

        // Update the apropriate text depending on the editor. This means that editing in
        // markdown won't completely destroy the richtext and vice versa.
        const bio = data.system.biography;
        const source = this.object.system.biography;
        const convert = new showdown.Converter();

        if (bio.editor == 'markdown') {
            bio.richtext = convert.makeHtml(bio.plaintext || source.plaintext);
        } else if (bio.editor == 'prosemirror') {
            bio.plaintext = convert.makeMarkdown(bio.richtext || source.richtext);
        }
        
        super._updateObject(event, data);
    }

}

// Composes mixins for this class.
Object.assign(CharacterSheet.prototype, SheetMixin);

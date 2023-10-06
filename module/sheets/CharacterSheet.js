import * as AC from "../AC.js";
import { SheetMixin } from "./SheetMixin.js";

// The application for Characters.
export default class CharacterSheet extends ActorSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            width: 650,
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
        this.renameCategory(html);
        this.colorCategory(html);
        this.matchCategory(html);
        this.contrastCategory(html);
        this.floodCategory(html);
        this.disableTrackStat(html);
        this.trackStat(html);
        this.untrackStat(html);

        // Feature
        this.createFeature(html);
        this.viewFeature(html);
        this.deleteFeature(html);

        super.activateListeners(html);
    }

    //* Color Stats

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


    //* Category

    /** Creates a new category given a name via a dialog.
     * @param {*} html 
     */
    createCategory (html) {
        const create = html.find('[data-create-category]');

        create.on('click', () => {
            const callback = html => {
                const name = html.find('[name="name"]').val() || "new category";
    
                this.object.update({ 'system.categories': { [name]: [] } });
            }

            const dialog = new Dialog({
                title: `Create New Category: ${this.object.name}`,
                content: CONFIG.animecampaign.textInputDialogContent('Name', 'New Category'),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Create New Category",
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
            const category = $(event.target).data('delete-category');

            const callback = () => {
                const features = this.object.system.categorizedFeatures[category];

                const ids = features.map(feature => feature._id);
    
                this.object.update({ 'system.categories': { [`-=${category}`]: null } });
                this.object.unsetFlag('animecampaign', `categories.${category}`)
                this.object.deleteEmbeddedDocuments('Item', ids);
            }
            
            Dialog.confirm({
                title: `Delete Category [${category.toUpperCase()}]: ${this.object.name}`,
                content: 
                    `<p>Delete the "${category.toUpperCase()}" category?</p>
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
                const flag = this.object.getFlag('animecampaign', `categories.${key}`)
                const category = this.object.system.categories[key];
                const features = this.object.system.categorizedFeatures[key];
                const name = html.find('[name="name"]').val() || key;

                const updates = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { category: name }
                    }
                });

                this.object.update({ 'system.categories': { [name]: category } });
                this.object.update({ 'system.categories': { [`-=${key}`]: null } });
                this.object.setFlag('animecampaign', `categories.${name}`, flag);
                this.object.unsetFlag('animecampaign', `categories.${key}`);
                this.object.updateEmbeddedDocuments('Item', updates);
            }

            const dialog = new Dialog({
                title: `Rename Category [${key.toUpperCase()}]: ${this.object.name}`,
                content: CONFIG.animecampaign.textInputDialogContent('Name', key),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Rename Category",
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
            const flag = this.object.getFlag('animecampaign', `categories.${key}`);
            const initialColor = flag?.color ?? this.object.system.color;

            const set = html => {
                const color = html.find('[name="color"]').val();

                this.object.setFlag('animecampaign', `categories.${key}`, { color: color });
            }

            const reset = () => {
                this.object.setFlag('animecampaign', `categories.${key}`, { '-=color': null });
            }

            const dialog = new Dialog({
                title: `Recolor Category [${key.toUpperCase()}]: ${this.object.name}`,
                content: CONFIG.animecampaign.colorCategoryDialogContent(initialColor),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: 'Color Category',
                        callback: set
                    },
                    reset: {
                        icon: '<i class="fas fa-arrow-rotate-left"></i>',
                        label: 'Reset Color',
                        callback: reset
                    }
                },
                default: "confirm",
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
            const flag = this.object.getFlag('animecampaign', `categories.${key}`);

            const color = flag?.color ?? this.object.system.color;

            const obj = AC.uniformObject(properties.split(' '), color);
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
            const flag = this.object.getFlag('animecampaign', `categories.${key}`);

            const rgb = AC.hexToRGB(flag?.color ?? this.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            const obj = AC.uniformObject(properties.split(' '), color);
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
            const features = this.object.system.categorizedFeatures[key];
            const flag = this.object.getFlag('animecampaign', `categories.${key}`);
            const color = flag?.color ?? this.object.system.color;

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
            const category = this.object.system.categories[key];

            if (category.length >= MAX_TRACKERS) $(element).hide();
        })
    };

    /** Adds a stat tracker to a category via a dialog.
     * @param {*} html 
     */
    trackStat (html) {
        const track = html.find('[data-track]');

        track.on('click', event => {
            const category = $(event.target).parents('[data-category]').data('category');

            const callback = html => {
                const name = html.find('[name="name"]').val()
                const trackers = this.object.system.categories[category];

                if (name == '') return ui.notifications.warn(`Name field can't be blank.`);

                trackers.push(name.toLowerCase());
                this.object.update({ [`system.categories.${category}`]: trackers });
            }

            const dialog = new Dialog({
                title: `Track Stat [${category}]: ${this.object.name}`,
                content: CONFIG.animecampaign.textInputDialogContent('Stat Name', ''),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Track Stat",
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
            const key = $(event.target).data('untrack');
            const category = $(event.target).parents('[data-category]').data('category');
            const trackers = this.object.system.categories[category];

            //trackers.remove(key);
            const update = trackers.filter(tracker => tracker != key);

            this.object.update({ [`system.categories.${category}`]: update });
        })
    }

    
    //* Feature

    /** Creates a new feature under a category.
     * @param {*} html 
     */
    createFeature (html) {
        const create = html.find('[data-create-feature]');

        create.on('click', event => {
            const key = $(event.target).data('create-feature');
            const category = this.object.system.categories[key];
            const stats = category.map(tracker => {
                return { tag: tracker }
            });

            const data = [{
                name: 'New Feature',
                type: 'Feature',
                system: { stats: stats }
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

            this.object.deleteEmbeddedDocuments('Item', [id]);
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
        const blankStats = AC.uniformObject(CONFIG.animecampaign.colors, null)

        for (const stat in statChanges) {
            blankStats[statChanges[stat].color] = statChanges[stat];
        }

        const updatedData = mergeObject(data, { system: { stats: blankStats } });

        return flattenObject(updatedData);
    }
}

// Composites mixins with this class.
Object.assign(CharacterSheet.prototype, SheetMixin);

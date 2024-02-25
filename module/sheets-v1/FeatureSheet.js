import * as List from "../List.js"
import * as Utils from "../Utils.js"
import SheetMixin from "./SheetMixin.js"

/**
 * The application for Kit Features.
 */
export default class FeatureSheet extends SheetMixin(ItemSheet) {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            width: 550,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            template: 'systems/animecampaign/templates/sheets/feature-sheet.hbs',
            scrollY: ["section.scrollable"],
        });

        options.dragDrop = [
            { dragSelector: "[data-section-list] [data-section-grip]", dropSelector: null },
            { dragSelector: "[data-stat-list] [data-stat]", dropSelector: null },
        ];

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

        return {
            ...super.getData(),
            config: CONFIG.AC,
            system: this.object.system,
            documentName: this.object.documentName,
            statList: this.object.system.stats,
            sections: this.object.system.sections,

            // Prepared Data
            emptyStats: (this.object.system.stats.length === 0),
            categories: this.categories,
        }
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
        const defaultCategories = CONFIG.AC.defaultCategories.map(category => {
            return category.name;
        })
        const currentCategory = this.object.system.category;
        const categorySet = new Set([...defaultCategories, currentCategory])
        
        return [...categorySet];
    }


    //** DRAG AND DROP */

    /** Defines whether a user can drag elements.
     * @returns {Boolean}
     */
    _canDragStart () {
        return this.isEditable;
    }

    /** Defines whether a user can drop elements.
     * @returns {Boolean}
     */
    _canDragDrop () {
        return this.isEditable;
    }

    /** Fires when a draggable element is picked up.
     * @param {*} event 
     */
    _onDragStart (event) {
        const dataset = $(event.target).data();
        let dragData;

        if ('sectionGrip' in dataset) {
            const sections = this.object.system.sections;
            const index = $(event.target).closest('[data-section]').data('section');
            const section = List.get(sections, index);
            dragData = { type: 'section', obj: section, index: Number(index) };

            event.dataTransfer.setDragImage($(event.target).closest('[data-section]')[0], 0, 0)
        } else if ('stat' in dataset) {
            const stats = this.object.system.stats;
            const stat = List.get(stats, dataset.stat)
            dragData = { type: 'stat', obj: stat, index: Number(dataset.stat) };
        }

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        super._onDragStart(event);
    }

    /** Fires when a draggable element is dropped.
     * @param {*} event 
     */
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event);
        const sheet = this;

        const onDropList = str => {
            if (data.type != str) return;

            // Given the string, retrieve the list
            const list = getProperty(sheet.object.system, `${str}s`);
            if (list.length == 1) return;

            const dropTarget = $(event.target).closest(`[data-${str}]`);
            if (dropTarget.length == 0) return;

            let update = List.remove(list, data.index);
            update = List.add(update, data.obj, dropTarget.data(str));

            return sheet.object.update({ [`system.${str}s`]: update });
        }

        onDropList('stat');
        onDropList('section');
    }


    //* EVENT LISTENERS */

    /** This is where we put all of the code for buttons and such in the sheet.
     * @param {*} html The HTML of the form in a jQuery object.
     */
    activateListeners (html) {
        super.activateListeners(html);

        this.statListeners(html, this);
        this.sectionListeners(html, this);

        const sheet = this;

        // Rolls the feature to the chat log.
        html.find('[data-roll]').on('mousedown', event => {
            const post = (event.which === 3) // if right click was used

            sheet.object.roll({ post });
        })


        // Sets a feature's category via the selection.
        const select = html.find('[data-select-category="select"]');
        const target = html.find('[data-select-category="target"]');

        select.on('change', event => {
            const category = $(event.target).val();
            target.val(category);
            sheet.object.update();
        });
        
    }

    /** Event listeners for feature stats.
     * @param {*} html 
     * @param {*} sheet 
     */
    statListeners (html, sheet) {

        /** @type {Stat[]} */
        const stats = sheet.object.system.stats;

        /** @type {jQuery} */
        const ol = html.find('[data-stat-list]');

        /** @returns {Number} */
        const getIndex = event => {
            // + is a unary operator, converts a string into a number.
            return +$(event.target).closest('[data-stat]').data('stat');
        }

        /** Adds a stat to the end of the stats list.
         */
        void function add () {
            const add = ol.find('[data-add]');

            add.on('click', () => {
                const index = stats.length;
                const updateData = {
                    [`system.stats.${index}`]: {
                        tag: ""
                    }
                }
                sheet.submit({ updateData });
            })
        }()

        /** Deletes a stat given its index.
         */
        void function remove () {
            const remove = ol.find('[data-remove]');

            remove.on('click', event => {
                const update = List.remove(stats, getIndex(event));
                sheet.object.update({ 'system.stats': update });
            });
        }()

        /** Sets the view of the stat.
         */
        void function view () {
            const view = ol.find('[data-view]');
            const stat = ol.find('[data-stat]');

            view.removeClass('selected');

            stat.each((index, element) => {
                const setting = stats[index].view;
                const selected = $(element).find(`[data-view=${setting}]`);
                
                selected.addClass('selected');
            });

            view.on('click', event => {
                const setting = $(event.target).data('view');
                const index = getIndex(event)
                const updateData = {
                    [`system.stats.${index}.view`]: setting
                }

                sheet.submit({ updateData })
            });
        }()

    }

    /** Event listeners for sections.
     * @param {*} html 
     * @param {*} sheet 
     */
    sectionListeners (html, sheet) {

        /** @type {Section[]} */
        const sections = sheet.object.system.sections;

        /** @type {jQuery} */
        const ol = html.find('[data-section-list]');

        /** @returns {Number} */
        const getIndex = event => {
            // + is a unary operator, converts a string into a number.
            return +$(event.target).closest('[data-section]').data('section');
        }

        /** Adds a blank section to the section list.
         */
        void function add () {
            const add = ol.find('[data-add]');

            add.on('click', () => {
                const index = sections.length;
                const updateData = {
                    [`system.sections.${index}`]: {
                        name: "",
                        plaintext: "",
                        richtext: "",
                        visible: true,
                        collapsed: false
                    }
                }
                sheet.submit({ updateData });
            })
        }()

        /** Deletes a section at the desired index.
         */
        void function remove () {
            const remove = ol.find('[data-remove]');

            remove.on('click', event => {
                const update = List.remove(sections, getIndex(event));
                sheet.object.update({ 'system.sections': update });
            });
        }()

        /** Toggle's a section's visibility for chat messages.
         */
        void function toggle () {
            const toggle = ol.find('[data-toggle]');

            toggle.each((index, element) => {
                const section = List.get(sections, index);

                if (section.visible) { 
                    $(element).addClass('selected');
                } else { 
                    $(element).removeClass('fa-eye');
                    $(element).addClass('fa-eye-slash');
                }
            });

            toggle.on('click', event => {
                // Get boolean and invert it.
                const index = getIndex(event);
                const visibility = List.get(sections, index).visible;
                const updateData = {
                    [`system.sections.${index}.visible`]: !visibility
                }

                sheet.submit({ updateData });
            });
        }()

    }


    //* FORM SUBMISSION */

    /** Called whenever the form is submitted, we can put preliminary updates here.
     * @param {Event} event 
     * @param {Object} data 
     */
    _updateObject (event, data) {
        data = expandObject(data);

        // Insures a list, making sure all of its values are kept on update.
        const insure = key => {
            const list = List.toObject(this.object.system[key]);
            const update = mergeObject(list, data.system[key]);

            data.system[key] = update;
        }
        insure('sections');
        insure('stats');

        // category must always be lowercase
        data.system.category = data.system.category.toLowerCase();
        // stats as well
        for (const i in data.system.stats) {
            data.system.stats[i].tag = data.system.stats[i].tag.toLowerCase();
        }

        // if the category doesn't exist for the owner, create it
        (() => {
            if (!this.object.isOwned) return;

            const name = data.system.category;
            const categories = this.object.parent.system.categories
            const categoryExists = List.has(categories, { name });
            if (categoryExists) return;
    
            const update = List.add(categories, { name })
            this.object.parent.update({ 'system.categories': update });
        })();

        // Update text fields for Sections so neither editor oversteps on the other.
        const convert = new showdown.Converter();
        const source = this.object.system.sections;

        for (const [i, section] of Object.entries(data.system.sections)) {
            if (section === null) { }
            else if (data.system.details.editor == 'markdown') {
                section.richtext = convert.makeHtml(
                    section.plaintext ?? 
                    source[i].plaintext ??
                    ""
                );
            } else if (data.system.details.editor == 'prosemirror') {
                section.plaintext = convert.makeMarkdown(
                    section.richtext ?? 
                    source[i].richtext ??
                    ""
                );
            }
        }

        super._updateObject(event, data);
    }
}

// Composes mixins for this class.
//Object.assign(FeatureSheet.prototype, SheetMixin);

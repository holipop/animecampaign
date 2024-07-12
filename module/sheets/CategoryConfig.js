import * as List from "../List.js";

/**
 * A configuration application for editing a category.
 */
export default class CategoryConfig extends FormApplication {

    /** @type {*} */
    data

    /** Instantiate a new config window for category.
     * @param {*} data 
     * @param {*} options 
     * @constructor
     */
    constructor (data = {}, options = {}) {
        super({}, options)
        this.data = data
    }

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            width: 450,
            height: "auto",
            classes: ["sheet", "category-config"],
            template: 'systems/animecampaign/templates/sheets/category-config.hbs',
        });

        options.tabs = [
            { navSelector: "[data-nav]", contentSelector: "[data-content]", initial: "basic" },
        ];

        return options;
    }

    /** The title for this application.
     * @return {string}
     */
    get title () {
        return `Edit Category: ${this.name.toUpperCase()} [${this.actor.name}]`
    }

    /** The name of this category.
     * @returns {String}
     */
    get name () {
        return this.data.name
    }

    /** The actor who owns this category.
     * @returns {Actor}
     */
    get actor () {
        return this.data.actor
    }

    /** The category being configured.
     * @returns {Category}
     */
    get category () {
        return List.get(this.actor.system.categories, { name: this.name })
    }

    /** The context for this application's template.
     * @returns {*}
     */
    getData () {
        const trackers = [{}, {}, {}, {}]
        for (let i = 0; i < this.category.trackers.length; i++) {
            trackers[i] = this.category.trackers[i]
        }

        console.log(trackers)

        return {
            name: this.name,
            actor: this.actor,
            category: this.category,
            color: this.category.color || this.actor.system.color,
            trackers,
        }
    }

    /** Hook up event listenrs.
     * @param {jQuery} html 
     */
    activateListeners (html) {
        html.find('[data-cancel]').on('click', this.close.bind(this))
        html.find('[data-submit]').on('click', this.submit.bind(this))

        const colorInputs = html.find('[name="color"]').add('input[type="color"]')

        // Update color pickers to synchronize.
        colorInputs.on('change', event => {
            const update = $(event.target).val()
            colorInputs.val(update)
        })

        // Reset category color to the actor's default color.
        html.find('[data-reset]').on('click', () => {
            colorInputs.val(this.actor.system.color)
        })

        // Generate a file picker.
        html.find('[data-file-button]').on('click', event => {
            const index = Number($(event.target).closest('button').data('file-button'))

            const filePicker = new FilePicker({
                current: this.category.trackers[index].img,
                callback: path => {
                    html.find(`[data-file-text="${index}"]`).val(path)
                }
            });

            filePicker.render(true);
        })
    }

    /** Update the category.
     * @param {*} event 
     * @param {*} data 
     */
    _updateObject (event, data) {
        const changes = { system: {} }

        if (this.category.name !== data.name) {
            changes.name = "test"

            //this.actor.updateEmbeddedDocuments("Item", updates)
        }

        console.log(data)
        
        this.actor.update(changes)
        this.close()
    }

}
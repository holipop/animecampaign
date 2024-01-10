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
        const options = mergeObject(super.defaultOptions, {
            width: 450,
            classes: ["sheet", "token-sheet"],
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
        return {
            name: this.name,
            actor: this.actor,
            category: this.category
        }
    }

    /** Hook up event listenrs.
     * @param {jQuery} html 
     */
    activateListeners (html) {
        html.find('[data-cancel]').on('click', () => this.close())
        html.find('[data-commit]').on('click', this._onSubmit.bind(this))
    }

    /** Update the category.
     * @param {*} event 
     * @param {*} data 
     */
    _updateObject (event, data) {

        const changes = {}

        if (this.category.name !== data.name) {
            changes.name = "test"

            //this.actor.updateEmbeddedDocuments("Item", updates)
        }

        console.log(this.actor)
        
        this.actor.update(changes)
        this.close()
    }

}
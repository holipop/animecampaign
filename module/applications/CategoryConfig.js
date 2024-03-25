import * as List from "../List.js"

/**
 * The configuration dialog for CategoryConfig.
 */
export default class CategoryConfig extends FormApplication {

    constructor(object, options) {
        super(object, options);
    
        /** A reference to the parent for this stat.
         * @type {ACActor}
         */
        this.parent = this.object.parent;
        
        /** The index of this object for its list.
         * @type {Number}
         */
        this.index = this.object.index;
    }

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            classes: ["animecampaign", "dialog", "config"],
            template: "systems/animecampaign/templates/dialog/category-config.hbs",
            tabs: [{ navSelector: "[data-nav]", contentSelector: "[data-content]" }],
            dragDrop: [{ dragSelector: "[data-drag]", dropSelector: '[data-drop]' }],
            focus: true,
            width: 400,
            height: "auto",
            jQuery: true
        });

        return options;
    }

    /** Is this configuring a new category?
     * @returns {Boolean}
     */
    get isNew () {
        return (this.object.name === undefined)
    }

    /** Fetches the context for this application's template.
     * @returns {*}
     */
    async getData () {
        return {
            ...super.getData(),
            config: CONFIG.AC,

            isNew: this.isNew,
            namePlaceholder: (this.isNew)
                ? "new category" // localize soon
                : this.object.name, 
            displayColor: this.object.color || this.object.parent.system.color
        }
    }

    /** Fires when a draggable element is picked up.
     * @param {Event} event 
     */
    _onDragStart (event) {
        const dataset = $(event.target).data()
        const data = { index: null, object: null }

        event.dataTransfer.setData("text/plain", JSON.stringify(data))
    }

    /** Fires when a draggable element is dropped.
     * @param {Event} event 
     */
    _onDrop (event) {
        const data = TextEditor.getDragEventData(event)
    }

    /** Hook up event listeners for this application.
     * @param {jQuery} html 
     * @override
     */
    activateListeners (html) {

        // set the value of each color picker
        const colorPicker = html.find('[data-color-picker]')
        colorPicker.on('change', event => {
            colorPicker.val($(event.target).val())
        })

        // reset the color to null
        html.find('[data-color-reset]').on('click', () => {
            $(colorPicker[0]).val("")
            $(colorPicker[1]).val(this.object.parent.system.color)
        })

        super.activateListeners(html)
    } 

    /** Handle how this object updates.
     * @param {SubmitEvent} event 
     * @param {*} data 
     */
    async _updateObject (event, data) {
        console.log(data)

        const categories = this.parent.system.categories

        if (data.name === "") {
            throw ui.notifications.error(game.i18n.localize("AC.NOTIFY.Character.BlankName"))
        }

        const nameTaken = categories
            .filter(cat => cat.name !== this.object.name)
            .map(cat => cat.name)
            .includes(data.name)
        if (nameTaken) {
            throw ui.notifications.error(
                game.i18n.format("AC.NOTIFY.CategoryNameTaken", { name: data.name.toUpperCase() })
            );
        }

        data.name = data.name.toLowerCase();

        console.log(List.set(categories, this.index, data))
        this.parent.update({ 'system.categories': List.set(categories, this.index, data) })
    }
}
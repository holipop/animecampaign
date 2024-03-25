/**
 * The configuration dialog for CategoryConfig.
 */
export default class CategoryConfig extends FormApplication {

    constructor(object, options) {
        super(object, options);
    
        /**
         * A reference to the parent for this stat.
         */
        this.parent = this.object.parent;
    }

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = mergeObject(super.defaultOptions, {
            classes: ["animecampaign", "dialog", "config"],
            template: "systems/animecampaign/templates/dialog/category-config.hbs",
            tabs: [{ navSelector: "[data-nav]", contentSelector: "[data-content]" }],
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
        }
    }

    /** Handle how this object updates.
     * @param {SubmitEvent} event 
     * @param {*} data 
     */
    async _updateObject (event, data) {
        console.log(data)
    }
}
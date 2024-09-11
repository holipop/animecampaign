/**
 * The configuration dialog for Stats.
 */
export default class StatConfig extends FormApplication {

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
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["animecampaign", "dialog", "config"],
            template: "systems/animecampaign/templates/dialog/stat-config.hbs",
            focus: true,
            width: 400,
            height: "auto",
            jQuery: true
        });

        return options;
    }

    /** Is this configuring a new stat?
     * @returns {Boolean}
     */
    get isNew () {
        return (this.object.tag === undefined)
    }

    /** The stats that aren't occupied.
     * @returns {*}
     */
    get availableColors () {
        if (this.parent.documentName === "Item") return {};

        const stats = this.parent.system._stats;
        const options = Object
            .entries(CONFIG.AC.colorStat)
            .filter(([color]) => {
                // if editing an existing stat, its own color should be a valid selection
                return (this.isNew) 
                    ? (stats[color] === null)
                    : (stats[color] === null || color === this.object.color)
            })

        return Object.fromEntries(options)
    }

    /** Fetches the context for this application's template.
     * @returns {*}
     */
    async getData () {
        return {
            ...super.getData(),
            config: CONFIG.AC,

            isNew: this.isNew,
            colors: this.availableColors
        }
    }

    /** Handle how this object updates.
     * @param {SubmitEvent} event 
     * @param {*} data 
     */
    async _updateObject (event, data) {

        data.tag ||= "new stat"
        data.tag = data.tag.toLowerCase()

        data.sort = this.object.sort

        if (this.parent.documentName === "Actor") {
            const stats = this.parent.system.colorStats

            // tags must be unique
            const tagTaken = stats
                .filter(stat => stat.color !== this.object.color)
                .map(stat => stat.tag)
                .includes(data.tag)
            if (tagTaken) {
                throw ui.notifications.error(
                    game.i18n.format("AC.NOTIFY.StatTagTaken", { tag: data.tag.toUpperCase() })
                );
            }

            // always place new stats at the end
            if (this.isNew && stats.length > 0) {
                const lastStat = stats.at(-1)

                // for some reason, foundry sorts by the hundred thousands
                data.sort = lastStat.sort + 100000
            }
            
            const updates = {
                [`system._stats.${data.color}`]: data
            }

            // if the color of an existing stat is changed, set the old color to null
            if (!this.isNew && data.color !== this.object.color) {
                updates[`system._stats.${this.object.color}`] = null
            }

            this.parent.update(updates)
        } else {

            // item

        }
    }

}
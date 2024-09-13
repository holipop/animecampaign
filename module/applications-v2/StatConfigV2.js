const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export default class StatConfigV2 extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "dialog", "config"],
        tag: "form",
        position: {
            width: 400,
            height: "auto",
        },
        window: {
            minimizable: false,
        },
        form: {
            handler: StatConfigV2.onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    get object () {
        return this.options.stat
    }

    get parent () {
        return this.options.document
    }

    get title () {
        return game.i18n.format("AC.DIALOG.AddStat.Title", { name: this.parent.name })
    }

    /** Is this configuring a new stat?
     * @returns {Boolean}
     */
    get isNew () {
        return (this.object.tag === "")
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

    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/stat-config.hbs" }
    }

    async _prepareContext () {
        return {
            app: this,
            config: CONFIG.AC,
            object: this.object,
            parent: this.parent,

            isNew: this.isNew,
            colors: this.availableColors,
        }
    }

    /**
     * @param {SubmitEvent} event 
     * @param {HTMLFormElement} form 
     * @param {*} data 
     */
    static onSubmit (event, form, formData) {
        console.log({event, form, formData})

        const data = formData.object

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
                throw game.i18n.format("AC.NOTIFY.StatTagTaken", { tag: data.tag.toUpperCase() })
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
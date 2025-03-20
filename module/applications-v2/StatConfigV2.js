import ACActor from "../documents/ACActor.js"
import ACItem from "../documents/ACItem.js"

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 * The configuration window for Stats.
 */
export default class StatConfigV2 extends HandlebarsApplicationMixin(ApplicationV2) {

    /** @inheritdoc */
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

    /** @inheritdoc */
    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/stat-config.hbs" }
    }

    /** 
     * The Stat being configured. 
     * @returns {Stat}
     **/
    get stat () {
        return this.options.stat
    }

    /**
     * The document owns this Stat.
     * @returns {ACActor|ACItem}
     **/
    get document () {
        return this.options.document
    }

    /** 
     * Is this configuring a new Stat?
     * @returns {Boolean}
     */
    get isNew () {
        return (this.stat.tag === "")
    }



    // ---- Context ----

    /** 
     * For editing Stats on Characters, returns the list of unoccupied Stats.
     * @returns {Record<string, string>}
     */
    getAvailableColors () {
        if (this.document.documentName === "Item") return {};

        const stats = this.document.system.stats;
        const options = Object
            .entries(CONFIG.AC.colorStat)
            .filter(([color]) => {
                // if editing an existing stat, its own color should be a valid selection
                return (this.isNew) 
                    ? (stats[color] === null)
                    : (stats[color] === null || color === this.stat.color)
            })

        return Object.fromEntries(options)
    }

    /** @inheritdoc */
    async _prepareContext () {
        return {
            app: this,
            config: CONFIG.AC,
            stat: this.stat,
            document: this.document,

            isNew: this.isNew,
            colors: this.getAvailableColors(),
        }
    }



    // ---- Actions ----

    /** Update the stats list for the Stat's document. 
     * @param {SubmitEvent} event 
     * @param {HTMLFormElement} form 
     * @param {*} data 
     * @this {StatConfigV2}
     */
    static onSubmit (event, form, formData) {
        const data = formData.object

        data.tag ||= "new stat"
        data.tag = data.tag.toLowerCase()

        if (this.document.documentName === "Actor") {
            const stats = this.document.system.colorStats

            data.sort = this.stat.sort

            // tags must be unique
            const tagTaken = stats
                .filter(stat => stat.color !== this.stat.color)
                .find(stat => stat.tag == data.tag)
            if (tagTaken) {
                throw game.i18n.format("AC.StatConfig.StatTagTaken", { tag: data.tag?.toUpperCase() })
            }

            // always place new stats at the end
            if (this.isNew && stats.length > 0) {
                const lastStat = stats.at(-1)

                // for some reason, foundry sorts by the hundred thousands
                data.sort = lastStat.sort + 100000
            }
            
            const updates = {
                [`system.stats.${data.color}`]: data
            }

            // if the color of an existing stat is changed, set the old color to null
            if (!this.isNew && data.color !== this.stat.color) {
                updates[`system.stats.${this.stat.color}`] = null
            }

            this.document.update(updates)
        } else {
            // item
            const stats = [...this.document.system.stats]

            // tags must be unique
            const tagTaken = stats
                .filter(stat => stat.tag !== this.stat.tag)
                .find(stat => stat.tag == data.tag)
            if (tagTaken) {
                throw game.i18n.format("AC.StatConfig.StatTagTaken", { tag: data.tag.toUpperCase() })
            }

            // preserve data
            data.value = this.stat.value
            data.max = this.stat.max
            data.label = this.stat.label

            // always place new stats at the end
            if (this.isNew) {
                stats.push(data)
            } else {
                const index = stats.findIndex(stat => stat.tag === this.stat.tag)
                stats[index] = data
            }

            this.document.update({ "system.stats": stats })
        }
    }

}
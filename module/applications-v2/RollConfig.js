import ACItem from "../documents/ACItem.js"

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 * The configuration window for Stats.
 */
export default class RollConfig extends HandlebarsApplicationMixin(ApplicationV2) {

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
            handler: null,
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    /**
     * The list of queries to resolve.
     * @returns {Set<Query>}
     */
    get queries () {
        return this.options.queries
    }

    /**
     * The Item being rolled.
     * @returns {ACItem}
     **/
    get item () {
        return this.options.item
    }

    /** @inheritdoc */
    static PARTS = {
        hbs: { template: "systems/animecampaign/templates/dialog/roll-config.hbs" }
    }

    /** @inheritdoc */
    async _prepareContext () {
        return {
            app: this,
            config: CONFIG.AC,
            queries: this.queries
        }
    }
    
    /**
     * 
     * @param {ApplicationOptions} options 
     * @returns 
     */
    static prompt(options) {
        return new Promise(async (resolve, reject) => {
            const config = new RollConfig(options)
            await config.render({ force: true })
            console.log(config.element)

            config.addEventListener("close", event => {
                const data = new FormDataExtended(config.element)
                console.log(data)
                resolve(data)
            })
        })
    }

}
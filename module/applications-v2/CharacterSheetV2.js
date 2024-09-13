import SheetMixinV2 from "./SheetMixinV2.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * The application for Characters.
 */
export default class CharacterSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ActorSheetV2)) {

    /** The default configuration options which are assigned to every instance of this Application class. */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "actor", "sheet"],
        position: {
            width: 650,
            height: 550,
        },
        window: {
            resizable: true,
        },
        actions: {
            onInvokeColorPicker: super.onInvokeColorPicker,
            onEditImage: super.onEditImage,
            onStatAdd: super.onStatAdd,
            onStatEdit: super.onStatEdit,
            onStatDelete: super.onStatDelete,
        },
        form: {
            submitOnChange: true,
        }
    }

    /** The Handlebars templates for this application. These are rendered in order. */
    static PARTS = {
        summary:    { template: "systems/animecampaign/templates/character-v2/summary.hbs" },
        mainStats:  { template: "systems/animecampaign/templates/character-v2/main-stats.hbs" },
        statList:   { template: "systems/animecampaign/templates/stat-list.hbs" },
        //nav:        { template: "systems/animecampaign/templates/character-v2/nav.hbs" },
    }

    /** The title of this application's window.
     * @returns {String}
     */
    get title () {
        return `${this.document.name}`
    }

    /** The context passed to each Handlebars template.
     * @returns {*}
     */
    async _prepareContext () {
        return {
            ...super._prepareContext(),
            ...this.document,
            config: CONFIG.AC,
            document: this.document,
            palette: this.palette,
            stats: this.document.system.colorStats,

            /* svg: {
                bg: this.svgBackground,
                text: this.svgText,
            }, */
        }
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @protected
     * @override
     */
    _onRender(context, options) {
        super._onRender(context, options)

        // Make the little stamina bar change amount :3
        let staminaRatio = this.document.system.staminaRatio
        if (staminaRatio >= 1) {
            staminaRatio = 1
        } else if (staminaRatio <= 0) {
            staminaRatio = 0
        }
        staminaRatio *= 100
        this.element.querySelector('[data-stam-bar]').style.height = `${staminaRatio}%`

        // Disable the Add Stat button when the stats list is full.
        if (this.document.system.colorStats.length >= 8) {
            this.element.querySelector(`[data-action="onStatAdd"]`).style.display = 'none'
        }

    }

    /**
     * Submit a document update based on the processed form data.
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {object} submitData                   Processed and validated form data to be used for a document update
     * @returns {Promise<void>}
     * @protected
     * @override
     */
    async _processSubmitData(event, form, submitData) {
        const updates = submitData

        // intercept stat handling
        if ("stats" in updates.system) {
            const statData = Object
                .entries(updates.system.stats)
                .map(([index, statChanges]) => {
                    const stat = this.document.system.colorStats[index]
                    return [stat.color, { ...stat, ...statChanges }]
                })

            updates.system.stats = null // v1.0 bandaid
            updates.system._stats = Object.fromEntries(statData)
        }

        super._processSubmitData(event, form, updates)
    }

}
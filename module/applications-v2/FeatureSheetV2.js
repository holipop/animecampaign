import SheetMixinV2 from "./SheetMixinV2.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets

/**
 * The application for Features.
 */
export default class FeatureSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ItemSheetV2)) {

    /** The default configuration options which are assigned to every instance of this Application class. */
    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "item", "sheet"],
        position: {
            width: 550,
            height: 500,
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
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** The Handlebars templates for this application. These are rendered in order. */
    static PARTS = {
        part: { template: "systems/animecampaign/templates/feature-v2/template.hbs" },
    }

    /** The title of this application's window.
     * @returns {String}
     */
    get title () {
        return `${this.document.name}`
    }

    /** @override */
    tabGroups = {
        feature: "description"
    }

    /** The context passed to each Handlebars template.
     * @returns {*}
     */
    async _prepareContext () {
        return {
            ...super._prepareContext(),
            config: CONFIG.AC,
            document: this.document,
            system: this.document.system,
            palette: this.document.system.palette,
            //tabs: this.getTabs(),

            /* svg: {
                bg: this.svgBackground,
                text: this.svgText,
            }, */
        }
    }

    /** 
     * Invokes the Stat configuration window for creating a stat. 
     */
    static onStatAdd () { }

    /** 
     * Invokes the Stat configuration window for editing the targetted stat. 
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    static onStatEdit (event, target) { }

    /** Deletes the targetted stat.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    static async onStatDelete (event, target) { }

}
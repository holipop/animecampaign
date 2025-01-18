import SheetMixinV2 from "./SheetMixinV2.js"
import StatConfigV2 from "./StatConfigV2.js"
import ACDialogV2 from "./ACDialogV2.js"

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets

/**
 * The application for Features.
 */
export default class FeatureSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ItemSheetV2)) {

    /** @override */
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
            onRemoveImage: FeatureSheetV2.onRemoveImage,
            onStatAdd: FeatureSheetV2.onStatAdd,
            onStatEdit: FeatureSheetV2.onStatEdit,
            onStatDelete: FeatureSheetV2.onStatDelete,
        },
        form: {
            submitOnChange: true,
        },
        dragDrop: [{ dragSelector: '.JS-Drag', dropSelector: '.JS-Drop' }],
    }

    /** @override */
    static PARTS = {
        part: { template: "systems/animecampaign/templates/feature-v2/template.hbs" },
    }

    /** 
     * The title of this application's window.
     * @returns {String}
     */
    get title () {
        return `${this.document.name}`
    }

    /**
     * Actions performed after any render of the Application.
     * Post-render steps are not awaited by the render process.
     * @param {ApplicationRenderContext} context      Prepared context data
     * @param {RenderOptions} options                 Provided render options
     * @protected
     * @override
     */
    _onRender (context, options) {
        super._onRender(context, options)
    }



    // ---- Context ----

    /** @override */
    tabGroups = {
        feature: "description"
    }

    /**
     * Returns a record of navigation tabs.
     * @returns {Record<string, ApplicationTab>}
     */
    getTabs () {
        const tabs = {
            decription: { id: "description", group: "feature", icon: "notes", label: "AC.FeatureSheet.Description" },
            details:    { id: "details", group: "feature", icon: "info", label: "AC.FeatureSheet.Details" }
        }
        
        for (const tab of Object.values(tabs)) {
            tab.active = this.tabGroups[tab.group] === tab.id
            tab.css = tab.active ? "active" : ""
        }
        return tabs
    }

    /** @override */
    async _prepareContext () {
        return {
            ...super._prepareContext(),
            config: CONFIG.AC,
            document: this.document,
            system: this.document.system,
            palette: this.document.system.palette,
            tabs: this.getTabs(),
        }
    }



    // ---- Actions ----

    /** 
     * Removes the Features's image.
     * @this {FeatureSheetV2}
     */
    static onRemoveImage () {
        this.document.update({ img: null })
    }

    /** 
     * Invokes the Stat configuration window for creating a Stat. 
     * @this {FeatureSheetV2}
     */
    static onStatAdd () {
        new StatConfigV2({
            window: { 
                title: game.i18n.format("AC.StatConfig.AddStat.Title", { name: this.document.name }) 
            },
            document: this.document,
            stat: {
                view: "value", 
                tag: "",
            }
        }).render(true)
    }

    /** 
     * Invokes the Stat configuration window for editing a Stat. 
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {FeatureSheetV2}
     */
    static onStatEdit (event, target) {
        const index = target.closest('.JS-Stat').dataset.stat
        const stat = this.document.system.stats[index];

        new StatConfigV2({
            window: { 
                title: game.i18n.format("AC.StatConfig.EditStat.Title", { name: this.document.name }) 
            },
            document: this.document,
            stat
        }).render(true)
    }

    /** 
     * Deletes a targetted Stat.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @this {FeatureSheetV2}
     */
    static async onStatDelete (event, target) {
        const index = target.closest('.JS-Stat').dataset.stat
        const { tag } = this.document.system.stats[index]

        const confirm = await ACDialogV2.confirm({
            window: {
                title: game.i18n.format("AC.DeleteStatDialog.Title", { 
                    tag: tag.toUpperCase(), 
                    name: this.document.name
                }),
            },
            content: game.i18n.format("AC.DeleteStatDialog.Content", {
                tag: tag.toUpperCase(), 
            }),
            modal: true
        });

        const stats = [...this.document.system.stats]
        stats.splice(index, 1)
        
        if (confirm) {
            this.document.update({ "system.stats": stats })
        }
    }

}
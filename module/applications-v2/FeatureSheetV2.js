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
        }
    }

    /** The Handlebars templates for this application. These are rendered in order. */
    static PARTS = {
        summary:    { template: "systems/animecampaign/templates/feature-v2/summary.hbs" },
        statList:   { template: "systems/animecampaign/templates/stat-list.hbs" },
    }

}
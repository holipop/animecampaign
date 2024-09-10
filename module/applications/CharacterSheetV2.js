import SheetMixinV2 from "./SheetMixinV2.js"

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * The application for Characters.
 */
export default class CharacterSheetV2 extends HandlebarsApplicationMixin(SheetMixinV2(ActorSheetV2)) {

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
        },
        form: {
            submitOnChange: true,
        }
    }

    static PARTS = {
        summary:    { template: "systems/animecampaign/templates/character-v2/summary.hbs" },
        mainStats:  { template: "systems/animecampaign/templates/character-v2/main-stats.hbs" },
        statList:   { template: "systems/animecampaign/templates/stat-list.hbs" },
        //nav:        { template: "systems/animecampaign/templates/character-v2/nav.hbs" },
    }

    get title () {
        return `${this.document.name}`
    }

    async _prepareContext () {
        return {
            ...super._prepareContext(),
            ...this.document,
            config: CONFIG.AC,
            palette: this.palette,
            stats: this.document.system.colorStats, 

            /* svg: {
                bg: this.svgBackground,
                text: this.svgText,
            }, */
        }
    }

}
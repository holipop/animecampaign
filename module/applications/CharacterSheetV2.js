const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * The application for Characters.
 */
export default class CharacterSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["animecampaign", "actor", "sheet"],
        position: {
            width: 660,
            height: 550
        },
        window: {
            title: "Test"
        },
        actions: {
            myAction: CharacterSheetV2.myAction,
        }
    }

    static PARTS = {
        summary: {
            template: "systems/animecampaign/templates/character/character-sheet-v2.hbs"
        }
    }

    get title () {
        return `${game.i18n.localize("AC.Character")}: ${this.document.name}`
    }

    async _prepareContext () {
        return {
            ...super._prepareContext(),
            ...this.document,
            config: CONFIG.AC,
            //palette: this.palette,
            stats: this.document.system.colorStats, 

            /* svg: {
                bg: this.svgBackground,
                text: this.svgText,
            }, */
        }
    }

    /** 
     * @param {PointerEvent} event 
     * @param {HTMLElement} target 
     */
    static myAction (event, target) {
        // h
    }

}
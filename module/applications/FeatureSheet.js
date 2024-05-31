import SheetMixin from "./SheetMixin.js";

/**
 * The application for Features.
 */
export default class FeatureSheet extends SheetMixin(ActorSheet) {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            width: 550,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            //template: 'systems/animecampaign/templates/sheets/feature-sheet.hbs',
        });

        return options;
    }

}
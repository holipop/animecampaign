// The application for Kit Features.
export default class FeatureSheet extends ItemSheet {

    /** Sets the default options for this application.
     * @returns {Object}
     */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            template: 'systems/animecampaign/templates/sheets/feature-sheet.hbs',
        });
    }

    /** Returns the context object for Handlebars.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData();

        data.config = CONFIG.animecampaign;
        data.system = this.object.system;
        data.documentName = this.object.documentName;

        console.log(data);
        
        return data;
    }
}

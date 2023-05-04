export default class ACItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    get template() {
        return `systems/animecampaign/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    async getData() {
        const data = super.getData()
        data.config = CONFIG.animecampaign; //This is the localization
        data.system = data.item.system; //THIS IS THE SHIT WE DEFINED!!!
        return data;
    }
}
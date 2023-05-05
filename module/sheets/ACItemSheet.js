export default class ACItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    get template() {
        if (this.item.type) {
            return `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`;
        }
    }

    async getData() {
        const data = super.getData()

        data.config = CONFIG.animecampaign;
        data.system = data.item.system; 

        return data;
    }
}
import { ACSheetMixin } from "../config.js";

export default class ACActorSheet extends ActorSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"]
        });
    }

    get template() {
        return `systems/animecampaign/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; 
        data.system = data.actor.system; 

        return data;
    }

    activateListeners(html) {
        // Adjust Name Font Size
        const NAME = html.find('.name');
        const nameResize = new ResizeObserver(e => {
            this.adjustFontSize(NAME, 3, 60)
        })
        nameResize.observe(NAME[0]);
        nameResize.observe(html[0]);

        html.ready(() => this.adjustFontSize(NAME, 3, 60));

        // Update Name
        NAME.on('blur', e => this.actor.update({ 'name': NAME.text() }));
        NAME[0].addEventListener('paste', e => e.preventDefault())

        // Update Class
        const CLASS = html.find('.class');
        CLASS.on('blur', e => this.actor.update({ 'system.class':  CLASS.text() }));
        CLASS[0].addEventListener('paste', e => e.preventDefault());

        // Create Navigation Tabs
        const tabs = new Tabs({
            navSelector: ".tabs", 
            contentSelector: ".content", 
            initial: "kit", 
            callback: () => {}
        });
        tabs.bind(html[0]);

        // Create Kit Pieces
        html.find(".kit-piece-create").on("click", evenet => {
            this.actor.createEmbeddedDocuments('Item', [{
                name: game.i18n.localize(CONFIG.animecampaign.kitText.newkitpiece),
                type: "Kit Piece"
            }]);
        })

        // Delete Kit Pieces
        html.find(".kit-piece-delete").on("click", e => {
            let itemId = e.currentTarget.dataset.id
            this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        })

        // Edit Kit Pieces
        html.find(".kit-piece-edit").on("click", e=> {
            let itemId = e.currentTarget.dataset.id
            let item = this.actor.getEmbeddedDocument("Item", itemId);
            item.sheet.render(true);
        })

        this.updateBackground(html, 0.5);
        super.activateListeners(html);
    }
}

Object.assign(ACActorSheet.prototype, ACSheetMixin);
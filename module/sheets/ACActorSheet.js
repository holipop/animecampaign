import { ACSheetMixin } from "../mixins.js";

//
//  Defining the schema for Actor Sheets.
//
export default class ACActorSheet extends ActorSheet {
    
    //  Sets the default options for the ActorSheet.
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"]
        });
    }

    //  Retrieves the Handlebars filepath to load depending on the type of Actor.
    get template() {
        return `systems/animecampaign/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    //  Returns an object for Handlebars usage.
    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.actor.system;    //  Actor schema that we defined
        data.items = data.actor.items       //  Actor's owned items
        data.advancement = data.actor.system.stats.proficiency.advancement  // Proficiency
        
        data.weapons = data.items.filter(e => e.system.type == "weapon");
        data.talents = data.items.filter(e => e.system.type == "talent");
        data.passives = data.items.filter(e => e.system.type == "passive");
        data.abilities = data.items.filter(e => e.system.type == "ability");

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    activateListeners(html) {

        this.updateName(html, 3, 60);

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
            let type = evenet.currentTarget.dataset.type
            let itemData
            if (type == undefined) {
                itemData = [{
                    name: game.i18n.localize(CONFIG.animecampaign.kitText.newkitpiece),
                    type: "Kit Piece",
                }]
            }
            else {
                itemData = [{
                    name: game.i18n.localize(CONFIG.animecampaign.kitText.newkitpiece),
                    type: "Kit Piece",
                    system: {
                        type: type
                    }
                }]
            }

            this.actor.createEmbeddedDocuments('Item', itemData);
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

//  Composites mixins with this class
Object.assign(ACActorSheet.prototype, ACSheetMixin);
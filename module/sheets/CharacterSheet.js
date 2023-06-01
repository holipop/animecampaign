import { SheetMixin } from "./SheetMixin.js";

//  Defining the schema for Actor Sheets.
export default class CharacterSheet extends ActorSheet {

    //  Sets the default options for the ActorSheet.
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"]
        });
    }

    //  Retrieves the Handlebars filepath to load depending on the type of Actor.
    //*     () : string
    get template() {
        return `systems/animecampaign/templates/sheets/${this.actor.type}-sheet.hbs`;
    }

    //  Returns an object for Handlebars usage.
    //*     () : object
    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.actor.system;    //  Actor schema that we defined
        data.items = data.actor.items       //  Actor's owned items
        //data.advancement = data.actor.system.stats.proficiency.advancement  // Proficiency
        
        data.weapons = data.items.filter(element => element.system.type == "weapon");
        data.talents = data.items.filter(element => element.system.type == "talent");
        data.passives = data.items.filter(element => element.system.type == "passive");
        data.abilities = data.items.filter(element => element.system.type == "ability");

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    //*     (_html: jQuery) : void
    activateListeners(_html) {
        this.updateName(_html, 3, 60);
        
        this.updateClass(_html);
        this.updateBackground(_html, 0.5);
        this.createNavigation(_html);

        this.createKitPiece(_html);
        this.deleteKitPiece(_html);
        this.editKitPiece(_html);

        this.updateStatWidth(_html, .75);
        this.createBlankStat(_html);
        this.addDefaultStats(_html);
        this.collapseStatBlock(_html)

        new ContextMenu(_html, '.stat', this.contextMenuEntries());

        super.activateListeners(_html);
    }

    //  Manually updates the Character's class since it's a contenteditable div
    //*     (_html: jQuery) : void
    updateClass(_html) {
        const CLASS = _html.find('.class');
        CLASS.on('blur', e => this.actor.update({ 'system.class':  CLASS.text() }));

        CLASS[0].addEventListener('paste', event => event.preventDefault());
    }

    //  Creating a Tabs object for sheet navigation.
    //*     (_html: jQuery) : void
    createNavigation(_html) {
        const tabs = new Tabs({
            navSelector: ".tabs", 
            contentSelector: ".content", 
            initial: "kit", 
            callback: () => {}
        });
        tabs.bind(_html[0]);
    }

    //  Creates a new Kit Piece within the Character's owned Items collection.
    //*     (_html: jQuery) : void
    createKitPiece(_html) {
        _html.find(".kit-piece-create").on("click", event => {
            const type = event.currentTarget.dataset.type

            let itemData = [{
                name: game.i18n.localize(CONFIG.animecampaign.kitText.newKitPiece),
                type: "Kit Piece",
            }]

            if (type != undefined) itemData[0].system = { type: type };
    
            this.actor.createEmbeddedDocuments('Item', itemData);
        })
    }

    //  Deletes a Kit Piece from the Character's owned Items.
    //*     (_html: jQuery) : void
    deleteKitPiece(_html) {
        _html.find(".kit-piece-delete").on("click", e => {
            let itemId = e.currentTarget.dataset.id
            this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        })
    }

    //  Renders an owned Kit Piece.
    //*     (_html: jQuery) : void
    editKitPiece(_html) {
        _html.find(".kit-piece-edit").on("click", e=> {
            let itemId = e.currentTarget.dataset.id
            let item = this.actor.getEmbeddedDocument("Item", itemId);
            item.sheet.render(true);
        })
    }
}

//  Composites mixins with this class
Object.assign(CharacterSheet.prototype, SheetMixin);
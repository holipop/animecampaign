import { SheetMixin } from "./SheetMixin.js";

//  Defining the schema for Item Sheets.
export default class KitPieceSheet extends ItemSheet {
    
    //  Sets the default options for the ItemSheet.
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"]
        });
    }

    //  Retrieves the Handlebars filepath to load depending on the type of Item.
    //*     () : string
    get template() {
        if (this.item.type == 'Kit Piece') {
            return `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`;
        }
    }

    //  Returns an object for Handlebars usage.
    //*     () : object
    async getData() {
        const data = super.getData()

        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.item.system;     //  Item schema that we defined

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    //*     (_html: jQuery) : void
    activateListeners(_html) {

        this.updateName(_html, 2.5, 60);

        this.updateBackground(_html, 0.5);

        this.updateStatWidth(_html, .75);
        this.createBlankStat(_html);
        this.addDefaultStats(_html);
        this.collapseStatBlock(_html)
        new ContextMenu(_html, '.stat', this.contextMenuEntries());
        
        super.activateListeners(_html);
    }
}

//  Composites mixins with this class
Object.assign(KitPieceSheet.prototype, SheetMixin);
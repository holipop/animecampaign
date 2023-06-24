import { SheetMixin } from "../mixins/SheetMixin.js";

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

        this.customTypeToLowercase(_html);

        this.updateStatWidth(_html, .75);
        this.createBlankStat(_html);
        this.addDefaultStats(_html);
        this.collapseStatBlock(_html)

        this.roll(_html);
        
        this.moveSection(_html, 'up');
        this.moveSection(_html, 'down');
        this.addSection(_html);
        this.deleteSection(_html);

        new ContextMenu(_html, '.stat', this.contextMenuEntries());
        
        super.activateListeners(_html);
    }

    customTypeToLowercase(_html) {
        const CUSTOM_TYPE = _html.find('.custom-type');
        if (!CUSTOM_TYPE.length) return;

        const loweredInput = CUSTOM_TYPE.val().toLowerCase();

        CUSTOM_TYPE.on('change', event => {
            console.log(this.object);
            this.item.update([{ 'system.customType': loweredInput }]);
        })
    }

    roll(_html) {
        _html.find('.roll').on('click', event => {
            this.object.roll();
        })

        _html.find('.post').on('click', event => {
            this.object.roll({ post: true });
        })
    }

    moveSection(_html, _direction) {
        const MOVE = _html.find(`.section-move-${_direction}`);

        MOVE.on('click', event => {
            const index = $(event.currentTarget).parents('.section').data('index');
            const moveTo = (_direction == 'up')
                ? index - 1 
                : index + 1
            ;

            this.object.system.moveSection(index, moveTo);
        })
    }

    addSection(_html) {
        const ADD_SECTION = _html.find('.add-section');
        ADD_SECTION.on('click', event => {
            this.object.system.createSections();
        }) 
    }

    deleteSection(_html) {
        const DELETE_SECTION = _html.find('.section-delete');
        DELETE_SECTION.on('click', event => {
            const index = $(event.currentTarget).parents('.section').data('index');

            this.object.system.deleteSectionIndex(index);
        })
    }
}

//  Composites mixins with this class
Object.assign(KitPieceSheet.prototype, SheetMixin);
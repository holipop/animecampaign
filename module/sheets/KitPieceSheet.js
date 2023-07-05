import { SheetMixin } from "../mixins/SheetMixin.js";

//  Defining the schema for Item Sheets.
export default class KitPieceSheet extends ItemSheet {
    
    //  Sets the default options for the ItemSheet.
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            scrollY: ["div.scrollable"],
            template: `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`
        });
    }

    //  Returns an object for Handlebars usage.
    //*     () : object
    async getData() {
        const data = super.getData()

        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.item.system;     //  Item schema that we defined
        data.ownership = this.getOwnership();

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    //*     (_html: jQuery) : void
    activateListeners(_html) {

        if (this.getOwnership() == 3) {
            this.createBlankStat(_html);
            this.addDefaultStats(_html);
            
            this.hideSection(_html);
            this.moveSection(_html, 'up');
            this.moveSection(_html, 'down');
            this.addSection(_html);
            this.deleteSection(_html);
            
            new ContextMenu(_html, '.stat', this.contextMenuEntries());
        }
        this.updateName(_html, 2.5, 60);
        
        this.roll(_html);

        this.updateStatWidth(_html, .75);
        this.collapseStatBlock(_html)
        
        super.activateListeners(_html);
    }

    // Sends a chat message of the Kit Piece to the chat, optionally with a Roll.
    //*     (_html: jQuery) : void
    roll(_html) {
        _html.find('.roll').on('click', event => {
            this.object.roll();
        })

        _html.find('.post').on('click', event => {
            this.object.roll({ post: true });
        })
    }

    hideSection(_html) {
        const HIDE = _html.find('[data-hide]');

        for (const button of HIDE) {
            const index = $(button).parents('.section').data('index');
            const section = this.object.system.sections[index];

            if (section.hidden) $(button).addClass('active');
        }
        
        HIDE.on('click', event => {
            const index = $(event.currentTarget).parents('.section').data('index');
            $(event.currentTarget).toggleClass('active');

            if ($(event.currentTarget).hasClass('active')) {
                this.object.system.updateSection(index, {hidden: true});
            } else {
                this.object.system.updateSection(index, {hidden: false});
            }
        })
    }

    //  Shifts a section up or down by one index in the sections array.
    //*     (_html: jQuery, _direction: string) : void
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

    //*     (_html: jQuery) : void
    addSection(_html) {
        const ADD_SECTION = _html.find('.add-section');
        ADD_SECTION.on('click', event => {
            this.object.system.createSections();
        }) 
    }

    //*     (_html: jQuery) : void
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
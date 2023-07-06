import { SheetMixin } from "../mixins/SheetMixin.js";
import AC from "../AC.js";

//  Defining the schema for Actor Sheets.
export default class CharacterSheet extends ActorSheet {

    //  Sets the default options for the ActorSheet.
    //*     () : ApplicationOptions
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 520,
            height: 500,
            classes: ["animecampaign", "sheet", "actor"],
            tabs: [{
                navSelector: ".tabs", 
                contentSelector: ".content", 
                initial: "kit", 
            }],
            scrollY: ["section.scrollable"],
            template: `systems/animecampaign/templates/sheets/character-sheet.hbs`
        });
    }

    //  Returns an object for Handlebars usage.
    //*     () : object
    async getData() {
        const data = super.getData()
        
        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.actor.system;    //  Actor schema that we defined
        data.items = data.actor.items;      //  Actor's owned items
        data.kitPieces = this.ownedKitTypes;
        data.ownership = this.getOwnership();
        data.color = data.actor.system.color;

        return data;
    }

    //  This is where we put any custom event listeners for our sheets.
    //*     (_html: jQuery) : void
    activateListeners(_html) {
        const OWNER = 3;

        if (this.getOwnership() == OWNER) {
            this.addDefaultKit(_html);
            this.createKitPiece(_html);
            this.deleteKitPiece(_html);
            this.createBlankStat(_html);
            this.addDefaultStats(_html);
            this.setCustomTypeColor(_html);
            
            new ContextMenu(_html, '.stat', this.contextMenuEntries());
        }
        
        this.updateName(_html, 3, 60);
        this.updateClass(_html);
        this.applyCustomTypeColor(_html);

        this.collapseKitSection(_html);
        this.rollKitPiece(_html);
        this.editKitPiece(_html);
        
        this.updateStatWidth(_html, .75);
        this.collapseStatBlock(_html)

        super.activateListeners(_html);
    }

    //  Manually updates the Character's class since it's a contenteditable div.
    //*     (_html: jQuery) : void
    updateClass(_html) {
        const CLASS = _html.find('.class');
        CLASS.on('blur', e => this.actor.update({ 'system.class':  CLASS.text() }));

        CLASS[0].addEventListener('paste', event => event.preventDefault());
    }

    //  Send a chat message of the Kit Piece, right clicking will omit the Roll.
    //*     (_html: jQuery) : void
    rollKitPiece(_html) { 
        const KIT_IMG = _html.find('.kit-piece-img');
        KIT_IMG.on('mousedown', event => {
            const id = $(event.currentTarget).data('id');

            const item = this.object.getEmbeddedDocument('Item', id);

            const RIGHT_CLICK = 2;
            const settings = {
                post: (event.button == RIGHT_CLICK)
            }
            item.roll(settings);
        });
    }

    //  Creates a new Kit Piece within the Character's owned Items collection.
    //*     (_html: jQuery) : void
    createKitPiece(_html) {
        _html.find(".kit-piece-create").on("click", event => {
            const type = $(event.currentTarget).data('type');
            const isCustom = !Object.keys(CONFIG.animecampaign.kitTypes).includes(type);
            const customColor = this.object.getFlag('animecampaign', `${type}Color`);

            let itemData = [{
                name: game.i18n.localize(CONFIG.animecampaign.kitText.newKitPiece),
                type: "Kit Piece",
                system: {
                    color: customColor ?? this.actor.system.color,
                    type: (isCustom) ? 'custom' : $(event.currentTarget).data('type'),
                    customType: (isCustom) ? $(event.currentTarget).data('type') : "",
                }
            }]
    
            this.actor.createEmbeddedDocuments('Item', itemData);
        })
    }

    //  Generates a series of blank Kit Pieces, enough for a basic character sheet.
    //*     (_html: jQuery) : void
    addDefaultKit(_html) {
        _html.find(".add-default").on("click", event => {
            const add = (_type, _quantity = 1) => {
                if (_quantity < 1) AC.error('Cannot take values under 0.')

                let arr = [];
                for (let i = 0; i < _quantity; i++) {
                    arr.push({
                        name: game.i18n.localize(CONFIG.animecampaign.kitText.newKitPiece),
                        type: "Kit Piece",
                        system: {
                            color: this.actor.system.color,
                            type: _type
                        }
                    })
                }
                return arr;
            }

            let itemData = [ 
                ...add('talent'), 
                ...add('passive'), 
                ...add('weapon'), 
                ...add('ability', 3) 
            ];

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

    collapseKitSection(_html) {
        _html.find('[data-collapse]').on('click', event => {
            const ICON = $(event.currentTarget).children('i');
            const SECTION = $(event.currentTarget).parent().next();
            
            SECTION.toggleClass('hidden');
            ICON.toggleClass('fa-chevron-right');
        })
    }

    setCustomTypeColor(_html) {
        const typeColorFlagKeys = Object.keys(this.object.flags.animecampaign).filter(i => i.endsWith("Color"));
        for (const key of typeColorFlagKeys) {
            const type = key.replace("Color", "");
            const COLOR = _html.find(`.kit-type-color[data-type=${type}]`);
            COLOR.addClass('active');
        }

        _html.find('[data-typeColor]').on('click', event => {
            const COLOR = $(event.currentTarget);
            const type = COLOR.data('type');
            const defaultColor = this.object.getFlag('animecampaign', `${type}Color`) ?? this.object.system.color

            const data = {
                title: `${COLOR.data('type')}: Custom Color`,
                content: `
                    <div style="margin-bottom: 0.1rem; display: grid; place-items: center;">
                        <span>
                            Select a custom color: 
                            <input data-color type="color" value="${defaultColor}">
                        </span>
                    </div>
                `,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Confirm",
                        callback: (_html) => {
                            const colorInput = _html.find('[data-color]').val();
                            this.object.setFlag('animecampaign', `${type}Color`, colorInput);
                        }
                    },
                    reset: {
                        icon: '<i class="fas fa-rotate"></i>',
                        label: "Reset",
                        callback: () => {
                            this.object.unsetFlag('animecampaign', `${type}Color`)
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => {}
                    }
                },
                default: "cancel",
            }
            
            const options = {
                width: 300,
            }

            const dialog = new Dialog(data, options);
            dialog.render(true);
        })
    }

    applyCustomTypeColor(_html) {
        const match = AC.hbsHelpers.match;
        const contrast = AC.hbsHelpers.contrast;

        const typeColorFlagKeys = Object.keys(this.object.flags.animecampaign).filter(i => i.endsWith("Color"));
        for (const key of typeColorFlagKeys) {
            const type = key.replace("Color", "");
            const TYPE = _html.find(`.kit-type[data-type=${type}]`);
            const color = this.object.getFlag('animecampaign', key);

            TYPE.attr( 'style', match(color, {hash: {alpha: .7, attr: false}}) );
            TYPE.find('a').each(function(i) {
                $(this).attr( 'style', contrast(color, {hash: {attr: false}}) )
            })
        }
    }

    //*     () : Object
    get ownedKitTypes() {
        const data = super.getData();
        const items = data.actor.items.values();
        let [typeSet, sortedSet] = [new Set(), new Set()];
        let types = {}

        for (const entry of items) {
            entry.system.type == 'custom' 
                ? typeSet.add(entry.system.customType)
                : typeSet.add(entry.system.type);
        }

        for (const type of ['weapon', 'talent', 'passive', 'ability']) {
            if (typeSet.has(type)) {
                sortedSet.add(type);
                typeSet.delete(type);
            }
        }

        typeSet.forEach(entry => sortedSet.add(entry));
        
        for (const entry of sortedSet) {
            types[entry] = data.actor.items.filter(element => {
                return element.system.type == 'custom'
                    ? element.system.customType == entry
                    : element.system.type == entry
            });
        }

        return types;
    }
}

//  Composites mixins with this class
Object.assign(CharacterSheet.prototype, SheetMixin);
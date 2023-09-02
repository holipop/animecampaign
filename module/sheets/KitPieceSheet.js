import { SheetMixin } from "../mixins/SheetMixin.js";

//  Defining the schema for Item Sheets.
export default class KitPieceSheet extends ItemSheet {
    
    /** Sets the default options of this application.
     * @returns {ApplicationOptions} 
     */
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            width: 450,
            height: 500,
            classes: ["animecampaign", "sheet", "item"],
            scrollY: ["div.scrollable"],
            template: `systems/animecampaign/templates/sheets/kit-piece-sheet.hbs`
        });
    }

    /** Returns an object for Handlebars usage.
     * @returns {Object}
     */
    async getData () {
        const data = super.getData()

        data.config = CONFIG.animecampaign; //  Localization paths
        data.system = data.item.system;     //  Item schema that we defined
        data.ownership = this.getOwnership();
        data.color = data.item.system.color;

        return data;
    }

    /** This is where we put any custom event listeners for our sheets.
     * @param {jQuery} html 
     */
    activateListeners (html) {
        if (this.getOwnership() == 3) {
            this.createBlankStat(html);
            this.addDefaultStats(html);
            
            this.resizeTextArea(html)
            this.hideSection(html);
            this.moveSection(html, 'up');
            this.moveSection(html, 'down');
            this.addSection(html);
            this.deleteSection(html);
            
            new ContextMenu(html, '.stat', this.contextMenuEntries());
        }
        this.updateName(html, 2.5, 60);
        
        this.roll(html);

        this.updateStatWidth(html, .75);
        this.collapseStatBlock(html)
        
        super.activateListeners(html);
    }

    /** Sends a chat message of the Kit Piece to the chat, optionally with a Roll.
     * @param {jQuery} html 
     */
    roll (html) {
        html.find('.roll').on('click', event => {
            this.object.roll();
        })

        html.find('.post').on('click', event => {
            this.object.roll({ post: true });
        })
    }

    /** Automatically resizes the textbox with the content.
     * @param {jQuery} html 
     */
    resizeTextArea (html) {
        html.find("textarea").each(function() {
            this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
        }).on("input", function() {
            this.style.height = 0;
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    /** Toggles the visibility of sections.
     * @param {*} html 
     */
    hideSection (html) {
        const HIDE = html.find('[data-hide]');

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

    /** Shifts a section up or down by one index in the sections array.
     * @param {jQuery} html 
     * @param {string} direction 
     */
    moveSection (html, direction) {
        const MOVE = html.find(`.section-move-${direction}`);

        MOVE.on('click', event => {
            const index = $(event.currentTarget).parents('.section').data('index');
            const moveTo = (direction == 'up')
                ? index - 1 
                : index + 1
            ;

            this.object.system.moveSection(index, moveTo);
        })
    }

    /** Event listener for creating a section.
     * @param {jQuery} html 
     */
    addSection (html) {
        const ADD_SECTION = html.find('.add-section');
        ADD_SECTION.on('click', event => {
            this.object.system.createSections();
        }) 
    }

    /** Event listener for deleting a section.
     * @param {jQuery} _html 
     */
    deleteSection (_html) {
        const DELETE_SECTION = _html.find('.section-delete');
        DELETE_SECTION.on('click', event => {
            const index = $(event.currentTarget).parents('.section').data('index');

            this.object.system.deleteSectionIndex(index);
        })
    }
}

//  Composites mixins with this class
Object.assign(KitPieceSheet.prototype, SheetMixin);
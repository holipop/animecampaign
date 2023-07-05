//  Class definining any actions done on Kit Piece chat messages.
export class RolledItem {

    //  Any event listeners for chat messages.
    //*     (_html: jQuery) : void
    static addChatListeners(_html) {
        this.collapse(_html);
    }

    //  Toggle between revealing and hiding the text of a section.
    //*     (_html: jQuery) : void
    static collapse(_html) {
        _html.find('.section-label').on('click', event => {
            const ICON = $(event.currentTarget).children('.collapse').children();
            const TEXT = $(event.currentTarget).next();
            
            TEXT.toggleClass('hidden');
            ICON.toggleClass('fa-chevron-right');
        })
    }
}
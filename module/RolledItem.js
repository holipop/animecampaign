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
        _html.find('.collapse').on('click', event => {
            const ICON = $(event.currentTarget).children();
            const TEXT = $(event.currentTarget).parent().next();
            
            TEXT.toggleClass('hidden');
            ICON.toggleClass('fa-chevron-right');
        })
    }
}
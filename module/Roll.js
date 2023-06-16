//  Class definining any actions done on rolled Kit Pieces.
export class Roll {
    static addChatListeners(_html) {
        this.collapse(_html);
    }

    static collapse(_html) {
        _html.find('.collapse').on('click', event => {
            const ICON = $(event.currentTarget).children();
            const TEXT = $(event.currentTarget).parent().next();
            
            TEXT.toggleClass('hidden');
            ICON.toggleClass('fa-chevron-right');
        })
    }
}
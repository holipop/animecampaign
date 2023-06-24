//  Class definining any actions done on rolled Kit Pieces.
export class RolledItem {
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

    static critColor(_roll) {
        const formula = _roll.formula;
        
        if (_roll.total == new Roll(formula).roll({ maximize: true }).total) {
            return '#0a9b03';
        } else if (_roll.total == new Roll(formula).roll({ minimize: true }).total) {
            return '#e22209';
        }
    }
}
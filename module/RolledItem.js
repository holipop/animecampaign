/** Class definining any actions done on Kit Piece chat messages.
 * @class
 */
export class RolledItem {

    /** Any event listeners for chat messages.
     * @static
     * @param {jQuery} html - The template of the chat message.
     */
    static addChatListeners(html) {
        this.collapse(html);
    }

    /** Toggle between revealing and hiding the text of a section.
     * @static
     * @param {jQuery} html - The template of the chat message.
     */
    static collapse(html) {
        html.find('.section-label').on('click', event => {
            const ICON = $(event.currentTarget).children('.collapse').children();
            const TEXT = $(event.currentTarget).next();

            TEXT.toggleClass('hidden');
            ICON.toggleClass('fa-chevron-right');
        })
    }
}

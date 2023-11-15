/** A namespace for chat messages.
 * @module Roll
 */


/** Event listeners for chat messages.
 * @param {*} message 
 * @param {*} html 
 * @param {*} data 
 */
export function listeners (message, html, data) {

    const msg = html.find('[data-id]');

    /** Collapses an element given a button and target.
     */
    void function collapse () {
        // Only gets the elements that don't start with "target".
        const collapse = msg.find('[data-collapse]');

        // Sets the default visibility.
        collapse.each((index, element) => {
            const anchor = $(element).closest('a');
            const key = anchor.data('collapse');
            const visibile = anchor.data('visible');
            const target = msg.find(`[data-collapse-target="${key}"]`);

            if (visibile) return;

            target.toggle();
            anchor.find('i').toggleClass('fa-chevron-down');
            anchor.find('i').toggleClass('fa-chevron-right');
        })

        collapse.on('click', event => {
            const anchor = $(event.target).closest('a');
            const key = anchor.data('collapse');
            const target = msg.find(`[data-collapse-target="${key}"]`);

            target.toggle();
            anchor.find('i').toggleClass('fa-chevron-down');
            anchor.find('i').toggleClass('fa-chevron-right');
        })
    }()

}
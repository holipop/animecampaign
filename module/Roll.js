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
        const collapse = msg.find('[data-collapse]').filter((index, element) => {
            const key = $(element).data('collapse').toString();
            return (!key.startsWith('target'));
        });

        // Sets the default visibility.
        collapse.each((index, element) => {
            const key = $(element).data('collapse');
            const visibile = $(element).data('visible');
            const target = msg.find(`[data-collapse="target ${key}"]`);

            if (visibile) return;

            target.toggle();
            $(element).toggleClass('fa-chevron-down');
            $(element).toggleClass('fa-chevron-right');
        })

        collapse.on('click', event => {
            const key = $(event.target).data('collapse');
            const target = msg.find(`[data-collapse="target ${key}"]`);

            target.toggle();
            $(event.target).toggleClass('fa-chevron-down');
            $(event.target).toggleClass('fa-chevron-right');
        })
    }()

}
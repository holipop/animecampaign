/** A namespace for chat messages.
 * @module ChatMessage
 */


/** Event listeners for chat messages.
 * @param {*} message 
 * @param {*} html 
 * @param {*} data 
 */
export function activateListeners (message, html, data) {

    const msg = html.find('[data-id]');

    // Collapses an element given a button and target.
    msg.find('[data-collapse]')
        .each((index, element) => { 
            // Set the initial state of visibility
            const anchor = $(element).closest('a');
            const key = anchor.data('collapse');
            const visibile = anchor.data('visible');
            const target = msg.find(`[data-collapse-target="${key}"]`);

            if (visibile) return;

            target.toggle();
            anchor.find('i').toggleClass('fa-chevron-down');
            anchor.find('i').toggleClass('fa-chevron-right');
        })
        .on('click', event => {
            const anchor = $(event.target).closest('a');
            const key = anchor.data('collapse');
            const target = msg.find(`[data-collapse-target="${key}"]`);

            target.toggle();
            anchor.find('i').toggleClass('fa-chevron-down');
            anchor.find('i').toggleClass('fa-chevron-right');
        })
}
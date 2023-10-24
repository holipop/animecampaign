/** A namespace for Feature Stats.
 * @module FeatureStat
 */


/** Event listeners for feature stats.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {


    /** Sets the view of the stat.
     * @param {*} html 
     */
    void function setStatView (html) {
        const view = html.find('[data-view-stat]');
        const stat = html.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = sheet.stats[key].view;
            const selected = $(element).find(`[data-view-stat=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const key = $(event.target).parents('[data-stat]').data('stat');
            const setting = $(event.target).data('view-stat');
            const stats = sheet.stats;
            const stat = stats[key].toObject();

            stat.view = setting;
            stats[key] = stat;

            sheet.object.update({ 'system.stats': stats });
        });
    }(html)


    /** Adds a stat to the end of the stats list.
     * @param {*} html 
     */
    void function addStat (html) {
        const add = html.find('[data-add-stat]');
        const stats = sheet.stats;

        add.on('click', () => {
            stats.push({});
            sheet.object.update({ 'system.stats': stats });
        })
    }(html)


    /** Deletes a stat given its index.
     * @param {*} html 
     */
    void function deleteStat (html) {
        const del = html.find('[data-delete-stat]');
        const stats = sheet.stats;

        del.on('click', event => {
            const index = $(event.target).data('delete-stat');
            stats.splice(index, 1);

            sheet.object.update({ 'system.stats': stats });
        });
    }(html)

}
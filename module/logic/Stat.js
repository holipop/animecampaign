/** A namespace for Feature Stats.
 * @module Stat
 */


import * as List from "../helper/List.js"

/** Event listeners for feature stats.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {Stat[]} */
    const stats = sheet.object.system.stats;

    /** @type {jQuery} */
    const ol = html.find('[data-stat-list]');

    /** @returns {Number} */
    const index = event => {
        // + is a unary operator, converts a string into a number.
        return +$(event.target).closest('[data-stat]').data('stat');
    }


    /** Adds a stat to the end of the stats list.
     */
    void function add () {
        const add = ol.find('[data-add]');

        add.on('click', () => {
            const update = List.add(stats);
            sheet.object.update({ 'system.stats': update });
        })
    }()


    /** Deletes a stat given its index.
     */
    void function remove () {
        const remove = ol.find('[data-remove]');

        remove.on('click', event => {
            const update = List.remove(stats, index(event));
            sheet.object.update({ 'system.stats': update });
        });
    }()


    /** Sets the view of the stat.
     */
    void function view () {
        const view = ol.find('[data-view]');
        const stat = ol.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const setting = stats[index].view;
            const selected = $(element).find(`[data-view=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const setting = $(event.target).data('view');
            const update = List.set(stats, index(event), { view: setting })

            sheet.object.update({ 'system.stats': update });
        });
    }()

}

/** Ensures no data is lost when the stats array is updated.
 * @param {Object} data 
 * @param {Object} sheet 
 * @returns {Object} 
 */
export function update (data, sheet) {
    const statChanges = getProperty(expandObject(data), 'system.stats');
    const stats = Object.fromEntries(sheet.object.system.stats.entries());

    for (const stat in statChanges) {
        const set = statChanges[stat];

        set.tag = set.tag.toLowerCase();

        statChanges[stat] = set;
    }

    mergeObject(stats, statChanges);

    const updatedData = mergeObject(data, { system: { stats: stats } })

    return flattenObject(updatedData);
}
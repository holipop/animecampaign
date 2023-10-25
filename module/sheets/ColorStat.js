/** A namespace for Color Stats.
 * @module ColorStat
 */


/** Event listeners for color stats.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {Object} */
    const stats = sheet.object.system.stats;

    /** @type {jQuery} */
    const ol = html.find('[data-stat-list]');

    /** @returns {String} */
    const key = event => {
        return $(event.target).closest('[data-stat]').data('stat');
    }


    /** Disables the options of the color selection that are occupied by other stats.
     */
    void function disableOptions () {
        const stats = sheet.object.system.stats;
        const colorKeys = CONFIG.animecampaign.colorKeys;
        const populatedColors = colorKeys.filter(element => stats[element] != null);

        populatedColors.forEach(element => {
            const color = ol.find(`[data-color-option=${element}]`);

            color.each((index, element) => {
                const isSelected = $(element).attr('selected')

                if (!isSelected) $(element).attr('disabled', 'true');
            });
        });
    }()


    /** Matches the color of the select element with the color stat.
     */
    void function matchSelect () {
        const select = ol.find('[data-match-select]');

        select.each((index, element) => {
            const key = $(element).data('match-select');
            const color = CONFIG.animecampaign.colors[key];

            const styles = {
                'text-shadow': `${color} .1rem .1rem`,
                'box-shadow': `inset ${color} 0 0 .1rem`,
                'background-color': `${color}80`,
            }

            $(element).css(styles)
        })
    }()


    /** Sets the view of the color stat.
     */
    void function view () {
        const view = ol.find('[data-view]');
        const stat = ol.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = stats[key].view;
            const selected = $(element).find(`[data-view=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const setting = $(event.target).data('view');

            sheet.object.update({ [`system.stats.${key(event)}.view`]: setting });
        });
    }()


    /** Occupies a color stat by finding the first null stat. Removes the button if all stats are occupied.
     */
    void function add () {
        const add = ol.find("[data-add]");
        const allStatsPopulated = Object.values(stats).every(element => element != null);

        if (allStatsPopulated) add.hide();
        else add.show();

        add.on('click', () => {
            for (const stat in stats) {
                if (stats[stat] == null) {
                    sheet.object.update({ [`system.stats.${stat}`]: { color: stat } })
                    return;
                }
            }
        });
    }()


    /** Sets a color stat to null.
     */
    void function remove () {
        const remove = ol.find('[data-remove]');

        remove.on('click', event => {
            sheet.object.update({ [`system.stats.${key(event)}`]: null });
        });
    }()

}
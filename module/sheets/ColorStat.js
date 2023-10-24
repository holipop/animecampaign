/** A namespace for Color Stats.
 * @module ColorStat
 */


/** Event listeners for color stats.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {


    /** Disables the options of the color selection that are occupied by other stats.
     * @param {*} html 
     */
    void function disableStatOptions (html) {
        const stats = sheet.object.system.stats;
        const colorKeys = CONFIG.animecampaign.colorKeys;
        const populatedColors = colorKeys.filter(element => stats[element] != null);

        populatedColors.forEach(element => {
            const color = html.find(`[data-color-stat=${element}]`);

            color.each((index, element) => {
                const isSelected = $(element).attr('selected')

                if (!isSelected) $(element).attr('disabled', 'true');
            });
        });
    }(html)


    /** Matches the color of the select element with the color stat.
     * @param {*} html
     */
    void function matchSelect (html) {
        const select = html.find('[data-match-select]');

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
    }(html)


    /** Sets the view of the color stat.
     * @param {*} html 
     */
    void function setColorStatView (html) {
        const view = html.find('[data-view-stat]');
        const stat = html.find('[data-stat]');

        view.removeClass('selected');

        stat.each((index, element) => {
            const key = $(element).data('stat');
            const setting = sheet.usedStats()[key].view;
            const selected = $(element).find(`[data-view-stat=${setting}]`);
            
            selected.addClass('selected');
        });

        view.on('click', event => {
            const setting = $(event.target).data('view-stat');
            const key = $(event.target).parents('[data-stat]').data('stat');
            const stat = sheet.object.system.stats[key];

            stat.view = setting;

            sheet.object.update({ [`system.stats.${key}`]: stat });
        });
    }(html)


    /** Occupies a color stat by finding the first null stat. Removes the button if all stats are occupied.
     * @param {*} html 
     */
    void function addColorStat (html) {
        const add = html.find("[data-add-stat]");
        const stats = sheet.object.system.stats;
        const areAllStatsPopulated = Object.values(stats).every(element => element != null);

        if (areAllStatsPopulated) add.hide();
        else add.show();

        add.on('click', () => {
            for (const stat in stats) {
                if (stats[stat] == null) {
                    sheet.object.update({ [`system.stats.${stat}`]: { color: stat } })
                    return;
                }
            }
        });
    }(html)


    /** Sets a color stat to null.
     * @param {*} html 
     */
    void function deleteColorStat (html) {
        const del = html.find('[data-delete-stat]');

        del.on('click', event => {
            const key = $(event.target).data('delete-stat');
            sheet.object.update({ [`system.stats.${key}`]: null });
        });
    }(html)

}
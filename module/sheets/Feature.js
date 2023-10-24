/** A namespace for Embedded Features.
 * @module Feature
 */


import * as AC from "../AC.js";

/** Event listeners for categories.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {


    /** Creates a new feature under a category.
     * @param {*} html 
     */
    void function createFeature (html) {
        const create = html.find('[data-create-feature]');

        create.on('click', event => {
            const key = $(event.target).data('create-feature');
            const trackers = sheet.categorizedTrackers()[key];

            const color = sheet.getCategory(key).color ?? sheet.object.system.color;

            const stats = trackers.map(tracker => {
                return { tag: tracker.tag, img: tracker.img }
            });

            const data = [{
                name: 'New Feature',
                type: 'Feature',
                system: {
                    category: key,
                    stats: stats,
                    color: color,
                }
            }];

            sheet.object.createEmbeddedDocuments('Item', data)
        })
    }(html)


    /** Fires an item's roll method.
     * @param {*} html 
     */
    void function rollFeature (html) {
        const roll = html.find('[data-roll]');

        roll.on('click', event => {
            const id = $(event.target).data('roll');
            const feature = sheet.object.getEmbeddedDocument('Item', id);

            feature.roll();
        })
    }(html)


    /** Renders a kit feature's sheet.
     * @param {*} html 
     */
    void function viewFeature (html) {
        const view = html.find('[data-view-feature]');

        view.on('click', event => {
            const id = $(event.target).data('view-feature');
            const feature = sheet.object.getEmbeddedDocument('Item', id);

            feature.sheet.render(true);
        })
    }(html)


    /** Deletes a feature given its id.
     * @param {*} html 
     */
    void function deleteFeature (html) {
        const del = html.find('[data-delete-feature]');

        del.on('click', event => {
            const id = $(event.target).data('delete-feature');

            const callback = () => sheet.object.deleteEmbeddedDocuments('Item', [id]);

            Dialog.confirm({
                title: AC.format('dialog.deleteFeature', {
                    id: id,
                    name: sheet.object.name
                }),
                content: `<p>Delete this feature?</p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        })
    }(html)


    /** Matches the color of each element with an embedded kit feature.
     * @param {*} html 
     */
    void function matchFeature (html) {
        const match = html.find('[data-match-feature]');

        match.each((index, element) => {
            const properties = $(element).data('match-feature') || "color";
            const id = $(element).parents('[data-feature]').data('feature');
            const feature = sheet.object.getEmbeddedDocument('Item', id);
            const color = feature.system.color;

            const obj = AC.uniformObject(properties.split(' '), color);
            $(element).css(obj);
        })
    }(html)


    /** Swaps the fonts of a stat label if it exceeds a certain amount of characters.
     * @param {*} html 
     */
    void function swapStatFonts (html) {
        const MAX_CHARS = 3;
        const swap = html.find('[data-swap-font]');

        swap.each((index, element) => {
            const text = $(element).text();

            if (text.length > MAX_CHARS) $(element).addClass('label');
        })
    }(html)

}
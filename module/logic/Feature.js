/** A namespace for Embedded Features.
 * @module Feature
 */


import * as AC from "../helper/AC.js";
import * as List from "../helper/List.js";

/** Inserts the dropped feature into the target category and sets its sort.
 * @param {*} event 
 * @param {*} data 
 * @param {*} sheet
 */
export function onDrop (event, data, sheet) {
    if (data.type != 'Feature') return;

    const features = sheet.actor.items;
    const source = features.get(data.id);

    const dropTarget = $(event.target).closest('[data-feature]');
    const dropCategory = $(event.target).closest('[data-category]');

    // If the feature was placed on an empty category.
    if (dropTarget.length == 0) {
        const updateData = [{
            _id: source._id,
            sort: 0,
            system: { category: dropCategory.data('category') }
        }];
        return sheet.object.updateEmbeddedDocuments('Item', updateData);
    };

    // Doesn't sort on itself.
    const target = features.get(dropTarget.data('feature'));
    if (source._id == target._id) return;

    const siblings = [];
    dropCategory.find('li[data-feature]').each((index, element) => {
        const siblingId = $(element).data('feature');
        if (siblingId && (siblingId !== source._id)) {
            siblings.push(features.get(siblingId))
        }
    })

    // Sorts based on its siblings.
    const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
    const updateData = sortUpdates.map(u => {
        const update = u.update;
        update._id = u.target._id;
        update.system = { category: dropCategory.data('category') }
        return update;
    })

    return sheet.object.updateEmbeddedDocuments('Item', updateData);
}


/** Event listeners for categories.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {jQuery} */
    const kit = html.find('[data-kit]');

    /** @returns {String} */
    const id = element => {
        return $(element).closest('[data-feature]').data('feature');
    }


    /** Creates a new feature under a category.
     */
    void function create () {
        const create = kit.find('[data-create-feature]');
        const categories = sheet.object.system.categories;

        create.on('click', event => {
            const category = $(event.target).data('create-feature');
            const stats = sheet.categorizedTrackers[category];

            const target = List.get(categories, { name: category })
            const color = target.color ?? sheet.object.system.color;

            const data = [{
                name: `New Feature`,
                type: 'Feature',
                system: { category, stats, color }
            }];

            sheet.object.createEmbeddedDocuments('Item', data)
        })
    }()


    /** Fires an item's roll method.
     */
    void function roll () {
        const roll = kit.find('[data-roll]');

        roll.on('click', event => {
            const feature = sheet.object.getEmbeddedDocument('Item', id(event.target));

            feature.roll();
        })
    }()


    /** Renders a kit feature's sheet.
     */
    void function view () {
        const view = kit.find('[data-view-feature]');

        view.on('click', event => {
            const feature = sheet.object.getEmbeddedDocument('Item', id(event.target));

            feature.sheet.render(true);
        })
    }()


    /** Deletes a feature.
     */
    void function del () {
        const del = kit.find('[data-delete-feature]');

        del.on('click', event => {
            const callback = () => {
                sheet.object.deleteEmbeddedDocuments('Item', [id(event.target)]);
            }

            Dialog.confirm({
                title: AC.format('dialog.deleteFeature', {
                    id: id(event.target),
                    name: sheet.object.name
                }),
                content: `<p>Delete this feature?</p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        })
    }()


    /** Matches the color of each element with an embedded kit feature.
     */
    void function matchFeature () {
        const match = kit.find('[data-match-feature]');

        match.each((index, element) => {
            const properties = $(element).data('match-feature') || "color";
            const feature = sheet.object.getEmbeddedDocument('Item', id(element));
            const color = feature.system.color;

            const styles = AC.uniformObject(properties.split(' '), color);
            $(element).css(styles);
        })
    }()


    /** Swaps the fonts of a stat label if it exceeds a certain amount of characters.
     */
    void function swapStatFonts () {
        const MAX_CHARS = 3;
        const swap = html.find('[data-swap-font]');

        swap.each((index, element) => {
            const text = $(element).text();

            if (text.length > MAX_CHARS) $(element).addClass('label');
        })
    }()

}
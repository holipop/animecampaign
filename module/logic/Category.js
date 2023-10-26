/** A namespace for Categories.
 * @module Category
 */


import * as AC from "../helper/AC.js";
import * as List from "../helper/List.js"

/** Drop behaviors for categories.
 * @param {*} event 
 * @param {*} data 
 * @param {*} sheet
 */
export function onDrop (event, data, sheet) {

    /** @type {Category[]} */
    const categories = sheet.object.system.categories;

    /** Inserts the dropped category on the index of the target category. 
    */
    void function category () {
        if (data.type != 'Category') return;
        if (categories.length == 1) return;
    
        const dropTarget = $(event.target).closest('[data-category]');
        if (dropTarget.length == 0) return;
    
        const targetIndex = List.index(categories, { name: dropTarget.data('category') });
        const currentIndex = List.index(categories, { name: data.obj.name });
    
        let update = List.remove(categories, currentIndex);
        update = List.add(update, data.obj, targetIndex);
    
        return sheet.object.update({ 'system.categories': update });
    }()

    /** Inserts the dropped category on the index of the target category.
     */
    void function tracker () {
        if (data.type != 'Tracker') return;
        if (data.category.trackers.length == 1) return;  

        const dropCategory = $(event.target).closest('[data-category]');
        if (dropCategory.data('category') != data.category.name) return;

        const dropTarget = $(event.target).closest('[data-tracker]');
        if (dropTarget.length == 0) return;

        const targetIndex = dropTarget.data('tracker');

        let trackers = List.get(categories, { name: data.category.name }).trackers;
        trackers = List.remove(trackers, data.index);
        trackers = List.add(trackers, data.obj, targetIndex);

        const update = List.set(categories, { name: data.category.name }, { trackers })
        return sheet.object.update({ 'system.categories': update });
    }()
}


/** Event listeners for categories.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {Category[]} */
    const categories = sheet.object.system.categories

    /** @type {jQuery} */
    const kit = html.find('[data-kit]');

    /** @returns {String} */
    const name = element => {
        return $(element).closest('[data-category]').data('category');
    }


    /** Creates a new category given a name via a dialog.
     */
    void function create () {
        const create = kit.find('[data-create]');

        create.on('click', () => {
            const callback = html => {
                const name = html.find('[name="name"]').val().toLowerCase() || "new category";
                const isNameTaken = List.has(categories, { name })

                if (isNameTaken) {
                    ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another category.`)
                    return;
                };

                const update = List.add(categories, { name });
                sheet.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.create', { name: sheet.object.name }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.name'), AC.localize('app.newCategory')),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.createCategory'),
                        callback: callback
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }()


    /** Deletes a category given its index via a dialog.
     */
    void function del () {
        const del = kit.find('[data-delete]');

        del.on('click', event => {
            const key = name(event.target);

            const callback = () => {
                const features = sheet.categorizedFeatures[key];
                const ids = features.map(feature => feature._id);

                const update = List.remove(categories, { name: key })
                sheet.object.update({ 'system.categories': update });
                sheet.object.deleteEmbeddedDocuments('Item', ids);
            }
            
            Dialog.confirm({
                title: AC.format('dialog.deleteCategory', {
                    category: key.toUpperCase(),
                    name: sheet.object.name
                }),
                content: 
                    `<p>Delete the "${key.toUpperCase()}" category?</p>
                    <p><b>Warning: This will delete all kit features within this category.</b></p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        });
    }()


    /** Renames a category, moving all items to the new category name and deleting the old one.
     */
    void function rename () {
        const rename = kit.find('[data-rename]');

        rename.on('click', event => {
            const key = name(event.target);

            const callback = html => {
                const features = sheet.categorizedFeatures[key];
                const newName = html.find('[name="name"]').val().toLowerCase() || key;

                const isNameTaken = List.has(categories, { name: newName })
                if (isNameTaken) {
                    ui.notifications.warn(`"${newName.toUpperCase()}" is already taken by another category.`)
                    return;
                };

                const updatedItems = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { category: newName }
                    }
                });

                const updateCategory = List.set(categories, { name: key }, { name: newName })
                sheet.object.update({ 'system.categories': updateCategory });
                sheet.object.updateEmbeddedDocuments('Item', updatedItems);
            }

            const dialog = new Dialog({
                title: AC.format('dialog.rename', {
                    category: key.toUpperCase(),
                    name: sheet.object.name
                }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.name'), key),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.renameCategory'),
                        callback: callback
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }()


    /** Sets a category's color via a dialog.
     */
    void function color () {
        const color = kit.find('[data-color]');

        color.on('click', event => {
            const key = name(event.target);
            const target = List.get(categories, { name: key });
            const initColor = target.color ?? sheet.object.system.color;

            const set = html => {
                const color = html.find('[name="color"]').val();
                const update = List.set(categories, { name: key }, { color })
                sheet.object.update({ 'system.categories': update });
            }

            const reset = () => {
                const update = List.set(categories, { name: key }, { color: null });
                sheet.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.recolor', {
                    category: key.toUpperCase(),
                    name: sheet.object.name
                }),
                content: CONFIG.animecampaign.colorDialog(initColor),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.colorCategory'),
                        callback: set
                    },
                    reset: {
                        icon: '<i class="fas fa-arrow-rotate-left"></i>',
                        label: AC.localize('dialog.resetColor'),
                        callback: reset
                    }
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        });
    }()


    /** Sets a category's color to all of its features.
     */
    void function flood () {
        const flood = kit.find('[data-flood]');

        flood.on('click', event => {
            const key = name(event.target);
            const features = sheet.categorizedFeatures[key];
            const target = List.get(categories, { name: key });
            const color = target.color ?? sheet.object.system.color;

            const callback = () => {
                const updatedItems = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { color: color }
                    }
                });

                sheet.object.updateEmbeddedDocuments('Item', updatedItems);
            }

            Dialog.confirm({
                title: `Flood Category [${key.toUpperCase()}]: ${sheet.object.name}`,
                content: 
                    `<p>Flood each feature under the "${key.toUpperCase()}" category with ${color}?</p>`,
                yes: callback,
                no: () => {},
                defaultYes: false,
            });
        })
    }()


    /** Matches the color of each element with the category's flag color.
     */
    void function matchCategory () {
        const match = kit.find('[data-match-category]');

        match.each((index, element) => {
            const properties = $(element).data('match-category') || "color";
            const target = List.get(categories, { name: name(element) })
            const color = target.color ?? sheet.object.system.color;

            const styles = AC.uniformObject(properties.split(' '), color);
            $(element).css(styles);
        })
    }()


    /** Contrasts the color of each element against the category's flag color luminosity.
     */
    void function contrastCategory () {
        const contrast = kit.find('[data-contrast-category]');

        contrast.each((index, element) => {
            const properties = $(element).data('contrast-category') || "color";
            const target = List.get(categories, { name: name(element) });

            const rgb = AC.hexToRGB(target.color ?? sheet.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            const obj = AC.uniformObject(properties.split(' '), color);
            $(element).css(obj);
        })
    }()


    /** Disables the ability to track more stats after a maximum amount.
     */
    void function disableTrack () {
        const MAX_TRACKERS = 4;
        const track = kit.find('[data-track]');

        track.each((index, element) => {
            const target = List.get(categories, { name: name(element) })

            if (target.trackers.length >= MAX_TRACKERS) $(element).hide();
        })
    }()


    /** Adds a stat tracker to a category via a dialog.
     */
    void function track () {
        const track = kit.find('[data-track]');

        track.on('click', event => {
            const key = name(event.target)
            const trackers = List.get(categories, { name: key }).trackers;

            const callback = html => {
                const name = html.find('[name="name"]').val()

                const isNameTaken = List.has(trackers, { tag: name });
                if (isNameTaken) {
                    ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another stat tracker.`)
                    return;
                }
                if (name == '') return ui.notifications.warn(`Name field can't be blank.`);

                trackers.unshift({ tag: name })
                const update = List.set(categories, { name: key }, { trackers })
                sheet.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.track', { category: key, name: sheet.object.name }),
                content: CONFIG.animecampaign.textDialog(AC.localize('app.statName'), ''),
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: AC.localize('app.trackStat'),
                        callback: callback
                    },
                },
                default: "confirm",
            }, { width: 325 });

            dialog.render(true);
        })
    }()


    /** Removes a stat tracker from a category.
     */
    void function untrack () {
        const untrack = kit.find('[data-untrack]');

        untrack.on('click', event => {
            const index = +$(event.target).data('untrack');
            const category = name(event.target);
            const trackers = sheet.categorizedTrackers[category];

            trackers.splice(index, 1);

            const update = List.set(categories, { name: category }, { trackers });
            sheet.object.update({ 'system.categories': update });
        })
    }()


    /** Renders a FilePicker to edit the image of a stat tracker.
     */
    void function trackerImage () {
        const edit = kit.find('[data-tracker-image]');

        edit.on('click', event => {
            const index = +$(event.target).data('tracker-image');
            const category = name(event.target);
            const trackers = sheet.categorizedTrackers[category];

            const callback = path => {
                trackers[index].img = path;

                const update = List.set(categories, { name: category }, { trackers });
                sheet.object.update({ 'system.categories': update });
            }

            const filePicker = new FilePicker({
                current: trackers[index].img,
                callback: callback
            });

            filePicker.render(true);
        });
    }()

}

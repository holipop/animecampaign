/** A namespace for Categories.
 * @module Category
 */


import * as AC from "../AC.js";

/** Event listeners for categories.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {


    /** Creates a new category given a name via a dialog.
     * @param {*} html 
     */
    void function createCategory (html) {
        const create = html.find('[data-create-category]');

        create.on('click', () => {
            const callback = html => {
                const name = html.find('[name="name"]').val().toLowerCase() || "new category";
                const categories = sheet.categories;

                const isNameTaken = sheet.hasCategory(name);

                if (isNameTaken) {
                    ui.notifications.warn(`"${name.toUpperCase()}" is already taken by another category.`)
                    return;
                };

                categories.push({ name: name });
    
                sheet.object.update({ 'system.categories': categories });
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
    }(html)


    /** Deletes a category given its index via a dialog.
     * @param {*} html 
     */
    void function deleteCategory (html) {
        const del = html.find('[data-delete-category]');

        del.on('click', event => {
            const key = $(event.target).data('delete-category');

            const callback = () => {
                const features = sheet.categorizedFeatures()[key];
                const categories = sheet.categories;

                const ids = features.map(feature => feature._id);
                const index = categories.findIndex(category => category.name == key);

                categories.splice(index, 1);

                sheet.object.update({ 'system.categories': categories });
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
    }(html)


    /** Renames a category, moving all items to the new category name and deleting the old one.
     * @param {*} html 
     */
    void function renameCategory (html) {
        const rename = html.find('[data-rename-category]');

        rename.on('click', event => {
            const key = $(event.target).data('rename-category');

            const callback = html => {
                const features = sheet.categorizedFeatures()[key];
                const newName = html.find('[name="name"]').val().toLowerCase() || key;

                const updatedItems = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { category: newName }
                    }
                });

                const updatedCategories = sheet.setCategory(key, { name: newName });

                sheet.object.update({ 'system.categories': updatedCategories });
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
    }(html)


    /** Sets a category's color via a dialog.
     * @param {*} html 
     */
    void function colorCategory (html) {
        const color = html.find('[data-color-category]');

        color.on('click', event => {
            const key = $(event.target).data('color-category');
            const target = sheet.getCategory(key);
            const initialColor = target.color ?? sheet.object.system.color;

            const set = html => {
                const color = html.find('[name="color"]').val();

                const update = sheet.setCategory(key, { color: color });
                sheet.object.update({ 'system.categories': update });
            }

            const reset = () => {
                const update = sheet.setCategory(key, { color: null });

                sheet.object.update({ 'system.categories': update });
            }

            const dialog = new Dialog({
                title: AC.format('dialog.recolor', {
                    category: key.toUpperCase(),
                    name: sheet.object.name
                }),
                content: CONFIG.animecampaign.colorDialog(initialColor),
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
                close: set,
            }, { width: 325 });

            dialog.render(true);
        });
    }(html)


    /** Matches the color of each element with the category's flag color.
     * @param {*} html 
     */
    void function matchCategory (html) {
        const match = html.find('[data-match-category]');

        match.each((index, element) => {
            const properties = $(element).data('match-category') || "color";
            const key = $(element).parents('[data-category]').data('category');
            const target = sheet.getCategory(key)

            const color = target.color ?? sheet.object.system.color;

            const obj = AC.uniformObject(properties.split(' '), color);
            $(element).css(obj);
        })
    }(html)


    /** Contrasts the color of each element against the category's flag color luminosity.
     * @param {*} html 
     */
    void function contrastCategory (html) {
        const contrast = html.find('[data-contrast-category]');

        contrast.each((index, element) => {
            const properties = $(element).data('contrast-category') || "color";
            const key = $(element).parents('[data-category]').data('category');
            const target = sheet.getCategory(key);

            const rgb = AC.hexToRGB(target.color ?? sheet.object.system.color);
            rgb[0] *= 0.2126;
            rgb[1] *= 0.7152;
            rgb[2] *= 0.0722;

            const luma = rgb.reduce((n, m) => n + m) / 255;
            const color = (luma <= .5) ? "white" : "black";

            const obj = AC.uniformObject(properties.split(' '), color);
            $(element).css(obj);
        })
    }(html)


    /** Sets a category's color to all of its features.
     * @param {*} html 
     */
    void function floodCategory (html) {
        const flood = html.find('[data-flood-category]');

        flood.on('click', event => {
            const key = $(event.target).data('flood-category');
            const features = sheet.categorizedFeatures()[key];
            const target = sheet.getCategory(key);

            const color = target.color ?? sheet.object.system.color;

            const callback = () => {
                const update = features.map(feature => {
                    return {
                        _id: feature._id,
                        system: { color: color }
                    }
                });

                sheet.object.updateEmbeddedDocuments('Item', update);
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
    }(html)


    /** Disables the ability to track more stats after a maximum amount.
     * @param {*} html 
     */
    void function disableTrackStat (html) {
        const MAX_TRACKERS = 4;
        const track = html.find('[data-track]');

        track.each((index, element) => {
            const key = $(element).data('track');
            const target = sheet.getCategory(key);

            if (target.trackers.length >= MAX_TRACKERS) $(element).hide();
        })
    }(html)


    /** Adds a stat tracker to a category via a dialog.
     * @param {*} html 
     */
    void function trackStat (html) {
        const track = html.find('[data-track]');

        track.on('click', event => {
            const key = $(event.target).parents('[data-category]').data('category');
            const target = sheet.getCategory(key);

            const callback = html => {
                const name = html.find('[name="name"]').val()
                const trackers = target.trackers;

                if (name == '') return ui.notifications.warn(`Name field can't be blank.`);

                trackers.unshift({ tag: name })
                const update = sheet.setCategory(key, { trackers: trackers });
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
    }(html)


    /** Removes a stat tracker from a category.
     * @param {*} html 
     */
    void function untrackStat (html) {
        const untrack = html.find('[data-untrack]');

        untrack.on('click', event => {
            const index = $(event.target).data('untrack');
            const category = $(event.target).parents('[data-category]').data('category');
            const trackers = sheet.categorizedTrackers()[category];

            trackers.splice(index, 1);

            const update = sheet.setCategory(category, { trackers: trackers });
            sheet.object.update({ 'system.categories': update });
        })
    }(html)


    /** Renders a FilePicker to edit the image of a stat tracker.
     * @param {*} html 
     */
    void function editStatTrackerImage (html) {
        const edit = html.find('[data-image-tracker]');

        edit.on('click', event => {
            const index = $(event.target).data('image-tracker');
            const category = $(event.target).parents('[data-category]').data('category');
            const trackers = sheet.categorizedTrackers()[category];

            const callback = path => {
                trackers[index].img = path;

                const update = sheet.setCategory(category, { trackers: trackers });
                sheet.object.update({ 'system.categories': update });
            }

            const filePicker = new FilePicker({
                current: trackers[index].img,
                callback: callback
            });

            filePicker.render(true);
        });
    }(html)

}

/** A namespace for Sections.
 * @module Section
 */


import * as List from "../helper/List.js"

/** Event listeners for sections.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {Section[]} */
    const sections = sheet.object.system.sections;

    /** @type {jQuery} */
    const ol = html.find('[data-section-list]');

    /** @returns {Number} */
    const index = event => {
        // + is a unary operator, converts a string into a number.
        return +$(event.target).closest('[data-section]').data('section');
    }


    /** Adds a blank section to the section list.
     */
    void function add () {
        const add = ol.find('[data-add]');

        add.on('click', () => {
            const update = List.add(sections);
            sheet.object.update({ 'system.sections': update });
        })
    }()


    /** Deletes a section at the desired index.
     */
    void function remove () {
        const remove = ol.find('[data-remove]');

        remove.on('click', event => {
            const update = List.remove(sections, index(event));
            sheet.object.update({ 'system.sections': update });
        });
    }()


    /** Toggle's a section's visibility for chat messages.
     */
    void function toggle () {
        const toggle = ol.find('[data-toggle]');

        toggle.each((index, element) => {
            const section = List.get(sections, index);

            if (section.visible) { 
                $(element).css('color', 'blue')
            } else { 
                $(element).css('color', 'red')
            }
        });

        toggle.on('click', event => {
            // Get boolean and inverse it.
            const visibility = List.get(sections, index(event)).visible;
            const update = List.set(sections, index(event), { visible: !visibility });

            sheet.object.update({ 'system.sections': update })
        });
    }()

}

/** Ensures no data is lost when the sections array is updated.
 * @param {*} data 
 * @param {*} sheet 
 */
export function update (data, sheet) {
    const sectionChanges = getProperty(expandObject(data), 'system.sections');
    const sections = Object.fromEntries(sheet.object.system.sections.entries());

    mergeObject(sections, sectionChanges);

    const updatedData = mergeObject(data, { system: { sections: sections } })

    return flattenObject(updatedData);
}

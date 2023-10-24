/** A namespace for Sections.
 * @module Section
 */


import { Section } from "../Data.js"
import * as List from "../List.js"

/** Event listeners for sections.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {

    /** @type {Section[]} */
    const sections = sheet.object.system.sections;

    /** @type {jQuery} */
    const list = html.find('[data-section-list]');

    /** @returns {Number} */
    const index = event => {
        // + is a unary operator, converts a string into a number.
        return +$(event.target).closest('[data-section]').data('section');
    }


    /** Adds a blank section to the section list.
     * @param {*} html 
     */
    void function add () {
        const add = list.find('[data-add]');

        add.on('click', () => {
            const update = List.add(sections);
            sheet.object.update({ 'system.sections': update });
        })
    }()


    /** Deletes a section at the desired index.
     * @param {*} html 
     */
    void function remove () {
        const remove = list.find('[data-remove]');

        remove.on('click', event => {
            const update = List.remove(sections, index(event));
            sheet.object.update({ 'system.sections': update });
        });
    }()


    /** Toggle's a section's visibility for chat messages.
     * @param {*} html 
     */
    void function toggle () {
        const toggle = list.find('[data-toggle]');

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
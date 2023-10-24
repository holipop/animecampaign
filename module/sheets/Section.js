/** A namespace for Sections.
 * @module Section
 */


import * as AC from "../AC.js"

/** Event listeners for sections.
 * @param {*} html 
 * @param {*} sheet 
 */
export function listeners (html, sheet) {


    /** Adds a blank section to the section list.
     * @param {*} html 
     */
    void function addSection (html) {
        const add = html.find('[data-add-section]');
        const sections = sheet.sections;

        add.on('click', () => {
            sections.push({});
            sheet.object.update({ 'system.sections': sections });
        })
    }(html)


    /** Deletes a section at the desired index.
     * @param {*} html 
     */
    void function deleteSection (html) {
        const del = html.find('[data-delete-section]');
        const sections = sheet.sections;

        del.on('click', event => {
            const index = $(event.target).data('delete-section');
            sections.splice(index, 1);

            sheet.object.update({ 'system.sections': sections });
        });
    }(html)


    /** Toggle's a section's visibility for chat messages.
     * @param {*} html 
     */
    void function toggleSectionVisibility (html) {
        const toggle = html.find('[data-toggle-section]');

        toggle.each((index, element) => {
            const section = sheet.sections[index];

            if (section.visible) { 
                $(element).css('color', 'blue')
            } else { 
                $(element).css('color', 'red')
            }
        });

        toggle.on('click', event => {
            const sections = sheet.sections;
            const index = $(event.target).data('toggle-section');

            // Invert boolean
            sections[index] = AC.plainObject(sections[index]);
            sections[index].visible = !sections[index].visible;

            sheet.object.update({ 'system.sections': sections })
        });
    }(html)

}
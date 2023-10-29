/** 
 * Data structure for sections.
 */
export default class Section extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField(),
            plaintext: new fields.StringField(),
            richtext: new fields.HTMLField(),
            visible: new fields.BooleanField({ initial: true }),
        }
    }
}

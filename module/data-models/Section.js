// Data structure for Sections.
export default class Section extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;
        
        return {
            name: new fields.StringField(),
            text: new fields.HTMLField(),
            show: new fields.BooleanField({ initial: true }),
        }
    }
}

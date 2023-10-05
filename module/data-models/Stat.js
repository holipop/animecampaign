// Data structure for all stats.
export default class Stat extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            tag: new fields.StringField(),
            color: new fields.StringField(),
            view: new fields.StringField({ initial: 'value' }),

            value: new fields.NumberField(),
            max: new fields.NumberField(),
            label: new fields.StringField(),
        }
    }
}
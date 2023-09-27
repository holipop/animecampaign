// Data structure for all stats.
export default class Stat extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            value: new fields.NumberField(),
            max: new fields.NumberField(),
            min: new fields.NumberField(),

            stringValue: new fields.StringField(),
            stringMax: new fields.StringField(),
        }
    }
}
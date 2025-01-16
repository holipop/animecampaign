/** 
 * Data structure for feature details.
 */
export default class Details extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            editor: new fields.StringField({ initial: "prosemirror" }),
            formula: new fields.StringField(),

            action: new fields.StringField(),

            usage: new fields.SchemaField({
                multiple: new fields.StringField(),
                timeframe: new fields.StringField()
            }),
        }
    }

}

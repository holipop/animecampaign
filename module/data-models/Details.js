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
            editor: new fields.StringField({ initial: 'markdown' }),
            formula: new fields.StringField({ initial: '1d20' }),

            action: new fields.StringField({ initial: 'Main' }),

            usage: new fields.SchemaField({
                multiple: new fields.StringField({ initial: '1' }),
                timeframe: new fields.StringField({ initial: 'Round' })
            }),
        }
    }

}

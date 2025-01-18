/** 
 * Data structure for stats.
 */ 
export default class Stat extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            tag: new fields.StringField(),
            color: new fields.StringField(),
            img: new fields.FilePathField({
                categories: ['IMAGE'],
                initial: 'icons/svg/circle.svg'
            }),

            view: new fields.StringField({ initial: 'value' }),

            value: new fields.NumberField(),
            max: new fields.NumberField(),
            label: new fields.StringField(),

            sort: new fields.NumberField({ initial: 0 }),

            // ! Pre-v1.0
            name: new fields.StringField(),
            settings: new fields.SchemaField({
                display: new fields.StringField(),
            }),
        }
    }
}

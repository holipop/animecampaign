// Data structure for categories.
export default class Category extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField(),
            color: new fields.StringField(),

            trackers: new fields.ArrayField(new fields.SchemaField({
                tag: new fields.StringField(),
                /* img: new fields.FilePathField({
                    categories: ['IMAGE']
                }) */
            }))
        };
    }
}
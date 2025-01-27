/** 
 * Data structure for sections.
 * @deprecated
 */
export default class Section extends foundry.abstract.DataModel {

    /** @override */
    static defineSchema () {
        const fields = foundry.data.fields;

        return {
            name: new fields.StringField({ nullable: true }),
            visible: new fields.BooleanField({ initial: true }),
            
            plaintext: new fields.StringField({ 
                nullable: true,
                initial: "", 
            }),
            richtext: new fields.HTMLField({ 
                nullable: true,
                initial: "", 
            }),

            collapsed: new fields.BooleanField({ initial: false }),

            // ! Pre-v1.0
            label: new fields.StringField(),
            hidden: new fields.StringField(),
            text: new fields.StringField(),
        }
    }
}

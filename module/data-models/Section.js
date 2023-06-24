export class Section extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            label: new fields.StringField(),
            value: new fields.StringField(),
            stat: new fields.StringField(),
            text: new fields.HTMLField(),
        }
    }
}
//
//  Defining the schema for Stats
//
export class Stat extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        const defaultSettings = {
            required: false,
            nullable: true
        }

        return {
            name: new fields.StringField(defaultSettings),
            value: new fields.StringField(defaultSettings),
            max: new fields.StringField(defaultSettings)
        }
    }

    get percent() {
        let value = Number(this.value)
        let max = Number(this.max)
        if (isNaN(value) || isNaN(max)) {
            return NaN;
        }
        return value / max;
    }
}
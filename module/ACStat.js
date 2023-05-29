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

        const IMAGE = CONST.FILE_CATEGORIES.IMAGE;
        const imgSettings = {
            categories: ["IMAGE"],
        }

        return {
            name: new fields.StringField(defaultSettings),
            img: new fields.FilePathField({
                ...imgSettings,
                initial: 'icons/dice/d20black.svg'
            }),

            value: new fields.StringField(defaultSettings),
            min: new fields.StringField(defaultSettings),
            max: new fields.StringField(defaultSettings),

            states: new fields.ArrayField( new fields.ObjectField(), defaultSettings ),
            advancement: new fields.ArrayField( new fields.ObjectField(), defaultSettings ),

            settings: new fields.SchemaField({
                display: new fields.StringField({
                    initial: "single", 
                    ...defaultSettings
                }, ['single', 'double', 'phase', 'state', 'advancement']),
            })
        }
    }

    get percent() {
        const value = Number(this.value)
        const max = Number(this.max)
        if (isNaN(value) || isNaN(max)) {
            return NaN;
        }
        return value / max;
    }

    get label() {
        return this.name.toLowerCase();
    }
}
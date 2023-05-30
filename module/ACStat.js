//  Defining the schema for Stat objects
export class Stat extends foundry.abstract.DataModel {

    //*     () : StatSchema
    static defineSchema() {
        const fields = foundry.data.fields;

        const defaultSettings = {
            required: false,
            nullable: true
        }

        const imgSettings = {
            categories: ["IMAGE"],
        }

        return {
            name: new fields.StringField(defaultSettings),
            img: new fields.FilePathField({
                ...imgSettings,
                ...defaultSettings
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

    //*     () : number
    get percent() {
        const value = Number(this.value)
        const max = Number(this.max)
        if (isNaN(value) || isNaN(max)) {
            return NaN;
        }
        return value / max;
    }

    //*     () : string
    get label() {
        return this.name.toLowerCase();
    }
}
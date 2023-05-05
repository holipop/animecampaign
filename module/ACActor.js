export class CharacterData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            class: new fields.StringField(),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                initial: "#CCCCCC"
            }),
            stats: new fields.SchemaField({
                stamina: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                    max: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    })
                }),
                proficiency: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    })
                }),
                movement: new fields.SchemaField({
                    value: new fields.NumberField({
                        required: true,
                        initial: 5,
                        integer: true
                    }),
                    build: new fields.StringField({
                        required: true,
                        initial: "Average"
                    })
                })
            })
        }
    }
}
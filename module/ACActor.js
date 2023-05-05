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

    get profClass() {
        const proficiency = this.parent.system.stats.proficiency.value;

        if (proficiency < 60) {
            return "I";
        } else if ((60 <= proficiency) && (proficiency < 100)) {
            return "II";
        } else {
            return "III";
        }
    }

    get isInscribed() {
        let inscribedValues = Object
            .values(CONFIG.animecampaign.type.inscribed)
            .map(element => game.i18n.localize(element).toLowerCase());
        const type = this.parent.system.type;

        return inscribedValues.includes(type);
    }
}
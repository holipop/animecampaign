export class CharacterData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            class: new fields.StringField({
                initial: "Class"
            }),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                required: true,
                initial: "#CCCCCC"
            }),
            stats: new fields.ObjectField()
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

    createStat(key, value = "") {
        this.parent.update({ [`system.stats.${key}`]: value });
    }

    deleteStat(key) {
        this.parent.update({ [`system.stats.-=${key}`]: null })
    }

    createDefaultStats() {
        this.parent.update({ 
            'system.stats.stamina': {
                value: 0,
                max: 0
            },
            'system.stats.proficiency': {
                value: 0,
                ladder: []
            },
            'system.stats.movement': {
                value: 0,
                build: "Average"
            }
        });
    }
}
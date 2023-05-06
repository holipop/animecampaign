export class KitPieceData extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;

        return {
            description: new fields.HTMLField(),
            color: new fields.StringField({
                required: true,
                initial: "#CCCCCC"
            }),
            type: new fields.StringField({
                required: true,
                initial: "Weapon"
            }),
            stats: new fields.ObjectField()
        }
    }

    createStat(key, value = "") {
        this.parent.update({ [`system.stats.${key}`]: value });
    }

    deleteStat(key) {
        this.parent.update({ [`system.stats.-=${key}`]: null })
    }
}

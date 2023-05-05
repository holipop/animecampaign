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
            })
        }
    }
}

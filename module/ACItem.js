import { ACEntityMixin } from "./mixins.js";

//
//  Defining the schema for Kit Pieces.
//
export class KitPieceData extends foundry.abstract.DataModel {

    //  The object being returned is everything a Kit Piece will have on creation.
    //? Foundry uses the DataField object to allow for strongly-typed data and strictness.
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
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, ACEntityMixin);
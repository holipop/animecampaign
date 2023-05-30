import { ACStatMixin } from "./StatMixin.js";
import { Stat } from "./ACStat.js";

//
//  Defining the schema for Kit Pieces.
//
export class KitPieceData extends foundry.abstract.DataModel {

    //  The object being returned is everything a Kit Piece will have on creation.
    //? Foundry uses the DataField object to allow for strongly-typed data and strictness.
    static defineSchema() {
        const fields = foundry.data.fields;

        const defaultSettings = {
            required: false, 
            nullable: true
        }

        return {
            description: new fields.HTMLField(),
            color: new fields.StringField({ 
                ...defaultSettings, 
                initial: "#CCCCCC" 
            }),
            type: new fields.StringField({
                ...defaultSettings,
                initial: "weapon"
            }),
            stats: new fields.ArrayField( new fields.EmbeddedDataField( Stat ) )
        }
    }
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, ACStatMixin );
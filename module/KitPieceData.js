import { StatMixin } from "./StatMixin.js";
import { Stat } from "./Stat.js";

//  Defining the schema for Kit Pieces.
export class KitPieceData extends foundry.abstract.DataModel {

    //*     () : KitPieceSchema
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
                initial: "weapon",
            }),
            customType: new fields.StringField(defaultSettings),
            stats: new fields.ArrayField( new fields.EmbeddedDataField( Stat ) )
        }
    }
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, StatMixin );
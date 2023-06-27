import AC from "../AC.js";

//  Defining the schema for Stat objects
export class Stat extends foundry.abstract.DataModel {

    //*     () : Object
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
                
                resource: new fields.StringField({ 
                    initial: 'None',
                    ...defaultSettings
                })
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

    //  Returns the valid displays of a stat. Kit Pieces cannot have advancements as they cannot contain
    //  other Items.
    //*     () : Object
    get validDisplays() {
        let displays = { ...CONFIG.animecampaign.statDisplay };
        const type = this.parent.parent.type;

        if (type == 'Kit Piece') delete displays.advancement;

        return displays;
    }
}
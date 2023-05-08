import { ACEntityMixin } from "./mixins.js";

//
//  Defining the schema for Kit Pieces.
//
export class KitPieceData extends foundry.abstract.DataModel {

    //  The object being returned is everything a Kit Piece will have on creation.
    //? Foundry uses the DataField object to allow for strongly-typed data and strictness.
    static defineSchema() {
        const fields = foundry.data.fields;

        const defaultSettings = {
            nullable: true,
            required: true
        }

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
            sections: new fields.ArrayField(
                new fields.ObjectField({
                    description: new fields.HTMLField(defaultSettings),
                    proficiency: new fields.NumberField(defaultSettings),
                    type: new fields.StringField(defaultSettings),
                    action: new fields.StringField(defaultSettings),
                    duration: new fields.StringField(defaultSettings),
                    stats: new fields.ObjectField(defaultSettings)

                    //TODO  Not exactly sure how Statuses work
                    // statuses: new fields.ObjectField(),
                })
            )
        }
    }

    addSection() {
        let sections = this.sections;

        sections.push({
            description: "",
            proficiency: null,
            type: null,
            action: null,
            duration: null, 
            stats: null,
        });

        this.parent.update( {'system.sections': sections} );
    }

    deleteSection(_index) {
        let sections = this.sections;

        sections.splice(_index, 1);
        
        this.parent.update( {'system.sections': sections} );
    }
}

//  Composites mixins with this class
Object.assign(KitPieceData.prototype, ACEntityMixin);
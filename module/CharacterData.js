import { StatMixin } from "./StatMixin.js";
import { defaultStats } from "./DefaultStats.js";
import { Stat } from "./Stat.js";
import AC from "./AC.js";

//  Defining the schema for Characters.
export class CharacterData extends foundry.abstract.DataModel {

    //*     () : CharacterSchema
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
            stats: new fields.ArrayField( 
                new fields.EmbeddedDataField( Stat ),
                {
                    initial: this.defaultStats
                }
            )
        }
    }

    //*     () : Stat[]
    static get defaultStats() {
        return defaultStats.characterStats.map(obj => new Stat(obj));
    }

    //*     () : boolean
    get isInscribed() {
        let inscribedValues = Object
            .values(CONFIG.animecampaign.type.inscribed)
            .map(element => game.i18n.localize(element).toLowerCase());
        const type = this.type;

        return inscribedValues.includes(type);
    }

    //*     () : string
    get proficiencyClass() {
        const proficiency = this.stats.find((element) => element.label == 'proficiency');

        if (!proficiency) return AC.log(`${this.parent.name} doesn't have a Proficiency stat.`);
        if (this.type != 'epithet') return AC.log(`${this.parent.name} has no epithet.`);

        if (proficiency.value < 60) {
            return 'I';
        } else if ((proficiency.value >= 60) && (proficiency.value < 100)) {
            return 'II';
        } else {
            return 'III';
        }
    }
}

//  Composites mixins with this class
Object.assign(CharacterData.prototype, StatMixin);
import AC from "../AC.js";
import { StatMixin } from "../mixins/StatMixin.js";
import { defaultStats } from "../DefaultStats.js";
import { Stat } from "./Stat.js";

//  Defining the schema for Characters.
export class CharacterData extends foundry.abstract.DataModel {

    //*     () : Object
    static defineSchema() {
        const fields = foundry.data.fields;

        const generateResources = () => {
            let resources = {};
            AC.resourceKeys.forEach(i => {
                Object.assign(resources, { 
                    [i]: new fields.SchemaField({
                        stat: new fields.EmbeddedDataField( Stat, {
                            nullable: true,
                            initial: null
                        }),
                        value: new fields.NumberField(), 
                        max: new fields.NumberField() 
                    })
                })
            });
            return resources;
        }

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
            ),

            resources: new fields.SchemaField( generateResources() )
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

        if (!proficiency) return
        if (this.type != 'epithet') return

        if (proficiency.value < 60) {
            return 'I';
        } else if ((proficiency.value >= 60) && (proficiency.value < 100)) {
            return 'II';
        } else {
            return 'III';
        }
    }

    getAvailableResources(_stat) {
        const filteredResources = Object.entries(this.resources).map(i => {
            return { key: i[0], stat: i[1].stat }
        });
        const openResources = filteredResources.filter(i => objectsEqual(i.stat, _stat) || i.stat == null).map(i => i.key);
        return [ 'None', ...openResources ];
    }

    assignStatToResource(_stat, _resource) {
        const filteredResources = Object.entries(this.resources).map(i => {
            return { key: i[0], stat: i[1].stat }
        });
        const previousResource = filteredResources.find(i => objectsEqual(i.stat, _stat))
        if (previousResource) {
            this.parent.update({ [`system.resources.${previousResource.key}.stat`]: null });
        }

        this.parent.update({ [`system.resources.${_resource}.stat`]: _stat })
    }
}

//  Composites mixins with this class
Object.assign(CharacterData.prototype, StatMixin);
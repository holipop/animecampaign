import Stat from "./Stat.js";
import Category from "./Category.js";

// Data structure for characters.
export default class CharacterData extends foundry.abstract.DataModel {

    /** Defining the data structure of this data model. This cannot be changed post-init.
     * @returns {Object}
     */
    static defineSchema () {
        const fields = foundry.data.fields;

        const colorStats = {};
        for (const element of CONFIG.animecampaign.colors) {
            colorStats[element] = new fields.EmbeddedDataField(Stat, {
                initial: null,
                nullable: true
            });
        }

        return {
            stamina: new fields.EmbeddedDataField(Stat),
            proficiency: new fields.EmbeddedDataField(Stat),
            movement: new fields.EmbeddedDataField(Stat),

            stats: new fields.SchemaField(colorStats),

            categories: new fields.ArrayField(new fields.EmbeddedDataField(Category), {
                initial: CONFIG.animecampaign.defaultCategories
            }),

            biography: new fields.SchemaField({
                editor: new fields.StringField({ initial: 'markdown' }),
                text: new fields.HTMLField(),
            }),

            class: new fields.StringField(),
            word: new fields.StringField(),
            type: new fields.StringField(),
            color: new fields.StringField({
                required: true,
                initial: CONFIG.animecampaign.defaultColor
            }),
        };
    }

    /** Returns the class level as a roman numeral.
     * @returns {number} 
     */
    get classLevel () {
        const prof = this.proficiency.value;

        if (prof >= 100) return "III";
        else if (prof >= 60) return "II";
        else if (prof >= 0) return "I";
        return "";
    }
}